import { Routes, Route } from 'react-router';
import { DashboardLayout } from './components/layouts';
import { Home, Login, Signup, DashboardPage, OnboardingPage } from './pages';

function App() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />
      <Route path="onboarding" element={<OnboardingPage />} />

      <Route element={<DashboardLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="portfolio" element={<div>Portfolio Page (Coming Soon)</div>} />
        <Route path="agent" element={<div>Agent Page (Coming Soon)</div>} />
        <Route path="brokers" element={<div>Brokers Page (Coming Soon)</div>} />
      </Route>
    </Routes>
  );
}

export default App;
