import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { emptyAnswers, type Answers } from './answers.ts';

const STORAGE_KEY = 'road-report-answers';

interface ReportForm {
  answers: Answers;
  update: (changes: Partial<Answers>) => void;
  reset: () => void;
}

const ReportFormContext = createContext<ReportForm | null>(null);

/**
 * Holds answers across the question pages. Uses sessionStorage (not
 * localStorage) so a refresh keeps progress but nothing outlives the tab -
 * a small privacy-by-design choice for a shared/public computer.
 */
export function ReportFormProvider({
  children,
  initial,
}: {
  children: ReactNode;
  initial?: Partial<Answers>;
}) {
  const [answers, setAnswers] = useState<Answers>(() => ({
    ...emptyAnswers,
    ...load(),
    ...initial,
  }));

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }, [answers]);

  const value: ReportForm = {
    answers,
    update: (changes) => setAnswers((current) => ({ ...current, ...changes })),
    reset: () => {
      sessionStorage.removeItem(STORAGE_KEY);
      setAnswers(emptyAnswers);
    },
  };

  return <ReportFormContext value={value}>{children}</ReportFormContext>;
}

// eslint-disable-next-line react/only-export-components
export function useReportForm(): ReportForm {
  const context = useContext(ReportFormContext);
  if (!context)
    throw new Error('useReportForm must be used inside ReportFormProvider');
  return context;
}

function load(): Partial<Answers> {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}
