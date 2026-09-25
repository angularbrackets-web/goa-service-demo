import { Route, Routes } from 'react-router';
import { Layout } from './components/Layout.tsx';
import { CheckAnswersPage } from './pages/CheckAnswersPage.tsx';
import { ConfirmationPage } from './pages/ConfirmationPage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';
import { PrivacyPage } from './pages/PrivacyPage.tsx';
import { ContactPage } from './pages/questions/ContactPage.tsx';
import { DatePage } from './pages/questions/DatePage.tsx';
import { DescriptionPage } from './pages/questions/DescriptionPage.tsx';
import { IssueTypePage } from './pages/questions/IssueTypePage.tsx';
import { LocationPage } from './pages/questions/LocationPage.tsx';
import { StaffPage } from './pages/StaffPage.tsx';
import { StartPage } from './pages/StartPage.tsx';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<StartPage />} />
        <Route path="report">
          <Route path="issue-type" element={<IssueTypePage />} />
          <Route path="location" element={<LocationPage />} />
          <Route path="description" element={<DescriptionPage />} />
          <Route path="date" element={<DatePage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="check-answers" element={<CheckAnswersPage />} />
          <Route path="confirmation" element={<ConfirmationPage />} />
        </Route>
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route element={<Layout width="1200px" />}>
        <Route path="staff" element={<StaffPage />} />
      </Route>
    </Routes>
  );
}
