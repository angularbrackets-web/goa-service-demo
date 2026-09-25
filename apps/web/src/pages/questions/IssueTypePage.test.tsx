import { screen } from '@testing-library/react';
import { act } from 'react';
import { byTestId, emit, renderPage } from '../../../test/render.tsx';
import { IssueTypePage } from './IssueTypePage.tsx';

const continueButton = () => byTestId('continue');

describe('IssueTypePage', () => {
  it('asks one question with progress and a back link', () => {
    renderPage(<IssueTypePage />, { path: '/report/issue-type' });

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'What type of road issue are you reporting?',
      }),
    ).toHaveFocus();
    expect(screen.getByText('Question 1 of 5')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('shows the error in the summary and on the field when nothing is selected', () => {
    const { container } = renderPage(<IssueTypePage />, {
      path: '/report/issue-type',
    });

    act(() => emit(continueButton(), '_click'));

    expect(
      screen.getByRole('link', { name: 'Select the type of road issue' }),
    ).toBeInTheDocument();
    expect(container.querySelector('goa-form-item')).toHaveAttribute(
      'error',
      'Select the type of road issue',
    );
    expect(document.title).toMatch(/^Error: /);
    expect(screen.getByTestId('path')).toHaveTextContent('/report/issue-type');
  });

  it('continues to the next question once an answer is chosen', () => {
    const { container } = renderPage(<IssueTypePage />, {
      path: '/report/issue-type',
    });

    act(() =>
      emit(container.querySelector('goa-radio-group')!, '_change', {
        name: 'issueType',
        value: 'STREETLIGHT_OUT',
      }),
    );
    act(() => emit(continueButton(), '_click'));

    expect(screen.getByTestId('path')).toHaveTextContent('/report/location');
    expect(
      JSON.parse(sessionStorage.getItem('road-report-answers')!),
    ).toMatchObject({
      issueType: 'STREETLIGHT_OUT',
    });
  });

  it('returns to check answers when changing an answer', () => {
    renderPage(<IssueTypePage />, {
      path: '/report/issue-type',
      url: '/report/issue-type?change=1',
      answers: { issueType: 'POTHOLE' },
    });

    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/report/check-answers',
    );
    act(() => emit(continueButton(), '_click'));
    expect(screen.getByTestId('path')).toHaveTextContent(
      '/report/check-answers',
    );
  });
});
