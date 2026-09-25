import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { REFERENCE_PATTERN } from '../src/reports/reference.js';

/**
 * Boots the real application (validation pipe, guard, Prisma, PostgreSQL) and
 * drives it over HTTP. Needs DATABASE_URL pointing at a disposable database;
 * defaults to the `road_reports_test` database from docker-compose.yml.
 */
process.env.DATABASE_URL ??=
  'postgresql://demo:demo@localhost:5432/road_reports_test';
process.env.STAFF_API_TOKEN ??= 'integration-test-staff-token';
const staffAuth = `Bearer ${process.env.STAFF_API_TOKEN}`;

const answers = {
  issueType: 'POTHOLE',
  location: 'Highway 16 westbound near Edson',
  description: 'Pothole about 30 cm across in the right lane',
  noticedOn: '2026-09-01',
};

describe('Reports API (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.roadIssueReport.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  const http = () => request(app.getHttpServer());

  it('GET /api/health reports the database is reachable', async () => {
    await http().get('/api/health').expect(200, { status: 'ok' });
  });

  describe('POST /api/reports', () => {
    it('stores a report and returns only a receipt', async () => {
      const res = await http().post('/api/reports').send(answers).expect(201);

      expect(Object.keys(res.body).sort()).toEqual([
        'reference',
        'submittedAt',
      ]);
      expect(res.body.reference).toMatch(REFERENCE_PATTERN);

      const row = await prisma.roadIssueReport.findUniqueOrThrow({
        where: { reference: res.body.reference },
      });
      expect(row.status).toBe('RECEIVED');
      expect(row.contactEmail).toBeNull();
      expect(row.noticedOn.toISOString()).toBe('2026-09-01T00:00:00.000Z');
    });

    it('returns field-level errors the UI can display', async () => {
      const res = await http()
        .post('/api/reports')
        .send({ ...answers, location: '  ', contactEmail: 'nope' })
        .expect(400);

      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          { field: 'location', message: 'Enter where the issue is' },
          {
            field: 'contactEmail',
            message:
              'Enter an email address in the correct format, like name@example.com',
          },
        ]),
      );
    });

    it('reports the most helpful message when an answer is missing', async () => {
      const res = await http().post('/api/reports').send({}).expect(400);
      expect(res.body.errors).toEqual([
        { field: 'issueType', message: 'Select the type of road issue' },
        { field: 'location', message: 'Enter where the issue is' },
        { field: 'description', message: 'Describe the issue' },
        { field: 'noticedOn', message: 'Enter a real date' },
      ]);
    });

    it('rejects unexpected fields instead of silently storing them', async () => {
      await http()
        .post('/api/reports')
        .send({ ...answers, status: 'RESOLVED' })
        .expect(400);
    });

    it('rejects a date in the future', async () => {
      const res = await http()
        .post('/api/reports')
        .send({ ...answers, noticedOn: '2999-01-01' })
        .expect(400);
      expect(res.body.errors[0].field).toBe('noticedOn');
    });
  });

  describe('staff endpoints', () => {
    it('require a staff token', async () => {
      await http().get('/api/staff/reports').expect(401);
      await http()
        .get('/api/staff/reports')
        .set('Authorization', 'Bearer wrong')
        .expect(401);
    });

    it('list reports without exposing contact emails', async () => {
      await http()
        .post('/api/reports')
        .send({ ...answers, contactEmail: 'Person@Example.com' })
        .expect(201);

      const res = await http()
        .get('/api/staff/reports')
        .set('Authorization', staffAuth)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toMatchObject({
        wantsUpdates: true,
        status: 'RECEIVED',
      });
      expect(res.body[0]).not.toHaveProperty('contactEmail');
    });

    it('show the contact email on the detail view (normalised)', async () => {
      const { body } = await http()
        .post('/api/reports')
        .send({ ...answers, contactEmail: ' Person@Example.com ' })
        .expect(201);

      const res = await http()
        .get(`/api/staff/reports/${body.reference}`)
        .set('Authorization', staffAuth)
        .expect(200);
      expect(res.body.contactEmail).toBe('person@example.com');
    });

    it('update status and filter by it', async () => {
      const { body } = await http()
        .post('/api/reports')
        .send(answers)
        .expect(201);
      await http().post('/api/reports').send(answers).expect(201);

      await http()
        .patch(`/api/staff/reports/${body.reference}/status`)
        .set('Authorization', staffAuth)
        .send({ status: 'IN_PROGRESS' })
        .expect(200);

      const res = await http()
        .get('/api/staff/reports?status=IN_PROGRESS')
        .set('Authorization', staffAuth)
        .expect(200);
      expect(res.body.map((r: { reference: string }) => r.reference)).toEqual([
        body.reference,
      ]);
    });

    it('refuse a disallowed status change with 409', async () => {
      const { body } = await http()
        .post('/api/reports')
        .send(answers)
        .expect(201);
      const patch = (status: string) =>
        http()
          .patch(`/api/staff/reports/${body.reference}/status`)
          .set('Authorization', staffAuth)
          .send({ status });

      await patch('RESOLVED').expect(200);
      await patch('RECEIVED').expect(409);
    });

    it('return 404 for an unknown reference', async () => {
      await http()
        .get('/api/staff/reports/RD-0000-0000')
        .set('Authorization', staffAuth)
        .expect(404);
    });
  });

  it('serves the OpenAPI document', async () => {
    const res = await http().get('/api/docs-json').expect(200);
    expect(Object.keys(res.body.paths)).toEqual(
      expect.arrayContaining(['/api/reports', '/api/staff/reports']),
    );
  });
});
