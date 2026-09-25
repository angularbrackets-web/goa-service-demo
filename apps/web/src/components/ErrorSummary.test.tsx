import { render, screen } from '@testing-library/react';
import { ErrorSummary } from './ErrorSummary.tsx';

describe('ErrorSummary', () => {
  it('renders nothing when there are no errors', () => {
    const { container } = render(<ErrorSummary errors={{}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('links each message to its field and takes focus', () => {
    render(
      <ErrorSummary
        errors={{
          location: 'Enter where the issue is',
          description: 'Describe the issue',
        }}
      />,
    );

    expect(
      screen.getByRole('link', { name: 'Enter where the issue is' }),
    ).toHaveAttribute('href', '#location');
    expect(
      screen.getByRole('link', { name: 'Describe the issue' }),
    ).toHaveAttribute('href', '#description');
    expect(screen.getByTestId('error-summary')).toHaveFocus();
  });
});
