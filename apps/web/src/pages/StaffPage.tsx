import {
  GoabBadge,
  GoabButton,
  GoabCallout,
  GoabDropdown,
  GoabDropdownItem,
  GoabFormItem,
  GoabInputPassword,
  GoabTable,
} from '@abgov/react-components';
import type { GoabBadgeType } from '@abgov/ui-components-common';
import { useEffect, useState } from 'react';
import {
  api,
  Unauthorized,
  type ReportStatus,
  type ReportSummary,
} from '../api/client.ts';
import { usePageSetup } from '../components/usePageSetup.ts';
import { ISSUE_TYPES, type IssueType } from '../form/answers.ts';

const STATUS: Record<ReportStatus, { label: string; badge: GoabBadgeType }> = {
  RECEIVED: { label: 'Received', badge: 'information' },
  IN_PROGRESS: { label: 'In progress', badge: 'important' },
  RESOLVED: { label: 'Resolved', badge: 'success' },
};

/**
 * Minimal staff triage view: list reports, filter by status, change status.
 * The token lives in component state only (never persisted). In a real service
 * this page would sit behind SSO (Keycloak) rather than a pasted token.
 */
export function StaffPage() {
  const heading = usePageSetup('Staff triage');
  const [tokenInput, setTokenInput] = useState('');
  const [token, setToken] = useState<string>();
  const [filter, setFilter] = useState<ReportStatus | ''>('');
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [problem, setProblem] = useState<string>();
  const [announcement, setAnnouncement] = useState('');

  // Bumped after a status change to trigger a reload.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!token) return;
    let current = true;
    api
      .listReports(token, filter || undefined)
      .then((list) => {
        if (!current) return;
        setReports(list);
        setProblem(undefined);
      })
      .catch((error: unknown) => {
        if (!current) return;
        if (error instanceof Unauthorized) {
          setToken(undefined);
          setProblem('That staff token was not accepted.');
        } else {
          setProblem('Reports could not be loaded. Try again.');
        }
      });
    return () => {
      current = false; // ignore responses for a stale filter
    };
  }, [token, filter, version]);

  async function changeStatus(reference: string, status: ReportStatus) {
    try {
      await api.changeStatus(token!, reference, status);
      setAnnouncement(`${reference} changed to ${STATUS[status].label}`);
    } catch {
      setProblem(
        `${reference} could not be changed to ${STATUS[status].label}.`,
      );
    }
    setVersion((v) => v + 1); // reload (also reverts the dropdown after a failure)
  }

  return (
    <>
      <h1 ref={heading} tabIndex={-1}>
        Staff triage
      </h1>
      {problem && (
        <GoabCallout type="emergency" heading="There is a problem" mb="l">
          {problem}
        </GoabCallout>
      )}

      {!token ? (
        <>
          <p>Enter the staff token to view submitted reports.</p>
          <GoabFormItem
            label="Staff token"
            helpText="For this demo, see STAFF_API_TOKEN in apps/api/.env"
          >
            <GoabInputPassword
              name="staffToken"
              value={tokenInput}
              width="30ch"
              onChange={({ value }) => setTokenInput(value)}
            />
          </GoabFormItem>
          <GoabButton
            mt="l"
            onClick={() => setToken(tokenInput)}
            testId="sign-in"
          >
            View reports
          </GoabButton>
        </>
      ) : (
        <>
          <GoabFormItem label="Show reports with status" mb="l">
            <GoabDropdown
              name="statusFilter"
              value={filter}
              onChange={({ value }) =>
                setFilter((value ?? '') as ReportStatus | '')
              }
            >
              <GoabDropdownItem value="" label="All statuses" />
              {Object.entries(STATUS).map(([value, { label }]) => (
                <GoabDropdownItem key={value} value={value} label={label} />
              ))}
            </GoabDropdown>
          </GoabFormItem>

          <p role="status" className="visually-hidden">
            {announcement}
          </p>

          {reports.length === 0 ? (
            <p>No reports to show.</p>
          ) : (
            <GoabTable width="100%" testId="reports-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Submitted</th>
                  <th>Issue</th>
                  <th>Location</th>
                  <th>Updates?</th>
                  <th>Status</th>
                  <th>Change status</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.reference}>
                    <td>{report.reference}</td>
                    <td>
                      {new Date(report.submittedAt).toLocaleDateString('en-CA')}
                    </td>
                    <td>
                      {ISSUE_TYPES[report.issueType as IssueType] ??
                        report.issueType}
                    </td>
                    <td>{report.location}</td>
                    <td>{report.wantsUpdates ? 'Yes' : 'No'}</td>
                    <td>
                      <GoabBadge
                        type={STATUS[report.status].badge}
                        content={STATUS[report.status].label}
                        icon={false}
                      />
                    </td>
                    <td>
                      <GoabDropdown
                        name={`status-${report.reference}`}
                        ariaLabel={`Status for ${report.reference}`}
                        value={report.status}
                        size="compact"
                        onChange={({ value }) =>
                          value && value !== report.status
                            ? changeStatus(
                                report.reference,
                                value as ReportStatus,
                              )
                            : undefined
                        }
                      >
                        {Object.entries(STATUS).map(([value, { label }]) => (
                          <GoabDropdownItem
                            key={value}
                            value={value}
                            label={label}
                          />
                        ))}
                      </GoabDropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </GoabTable>
          )}
        </>
      )}
    </>
  );
}
