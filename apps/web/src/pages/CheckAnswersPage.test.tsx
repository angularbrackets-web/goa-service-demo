import { screen } from '@testing-library/react';
import { act } from 'react';
import { byTestId, emit, renderPage } from '../../test/render.tsx';
import type { Answers } from '../form/answers.ts';
import { CheckAnswersPage } from './CheckAnswersPage.tsx';

const complete: Partial<Answers> = {
  issueType: 'DAMAGED_SIGN',
  location: 'Jasper Ave and 109 St',
  description: 'Stop sign bent over',
  noticedOn: '2026-09-10',
  wantsUpdates: 'no',
};

function mockFetch(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe('CheckAnswersPage', () => {
  it('summarises answers with "Change" links that name the question', () => {
    renderPage(<CheckAnswersPage />, {
      path: '/report/check-answers',
      answers: complete,
    });

    expect(screen.getByText('Damaged or missing sign')).toBeInTheDocument();
    expect(screen.getByText('Not provided')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Change location' }),
    ).toHaveAttribute('href', '/report/location?change=1');
  });

  it('redirects to the first unanswered question', () => {
    renderPage(<CheckAnswersPage />, {
      path: '/report/check-answers',
      answers: { ...complete, location: '' },
    });
    expect(screen.getByTestId('path')).toHaveTextContent('/report/location');
  });

  it('submits only the needed fields and shows the confirmation', async () => {
    const fetchMock = mockFetch(201, {
      reference: 'RD-AAAA-BBBB',
      submittedAt: 'now',
    });
    renderPage(<CheckAnswersPage />, {
      path: '/report/check-answers',
      answers: complete,
    });

    await act(async () => emit(byTestId('submit'), '_click'));

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/reports');
    expect(JSON.parse(init.body)).toEqual({
      issueType: 'DAMAGED_SIGN',
      location: 'Jasper Ave and 109 St',
      description: 'Stop sign bent over',
      noticedOn: '2026-09-10',
    });
    expect(screen.getByTestId('path')).toHaveTextContent(
      '/report/confirmation',
    );
  });

  it('shows server-side validation errors linked to the page to fix them', async () => {
    mockFetch(400, {
      message: 'Validation failed',
      errors: [
        {
          field: 'noticedOn',
          message: 'The date must be today or in the past',
        },
      ],
    });
    renderPage(<CheckAnswersPage />, {
      path: '/report/check-answers',
      answers: complete,
    });

    await act(async () => emit(byTestId('submit'), '_click'));

    expect(
      screen.getByRole('link', {
        name: 'The date must be today or in the past',
      }),
    ).toHaveAttribute('href', '/report/date?change=1');
  });
});
