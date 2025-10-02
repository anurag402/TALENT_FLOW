import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/Login'
import DashboardPage from './pages/Dashboard'
import JobsListPage from '././pages/JobsList'
import JobCreatePage from '././pages/JobCreate'
import JobEditPage from '././pages/JobEdit'
import JobDetailPage from '././pages/JobDetail'
import CandidatesListPage from '././pages/CandidatesList'
import CandidateCreatePage from '././pages/CandidateCreate'
import CandidateDetailPage from '././pages/CandidateDetail'
import CandidateTimelinePage from '././pages/CandidateTimeline'
import AssessmentsPage from '././pages/Assessments'
import AssessmentsCreatePage from '././pages/AssessmentsCreate'
import AssessmentSubmitPage from '././pages/AssessmentSubmit'
import NotFoundPage from './pages/NotFound'
import './index.css'
import createMjsServer from "./server/Server";
import Layout from './components/layout';
import { Toaster } from "react-hot-toast"
import { useEffect,useState } from 'react'
import LoadingScreen from './pages/LoadingScreen';

// createMjsServer();

function App() {
  const [mirageReady, setMirageReady] = useState(false);

  useEffect(() => {
    createMjsServer().then(() => setMirageReady(true));
  }, []);

if (!mirageReady) return <LoadingScreen />;
  return (
    <> 
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<Layout />}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Jobs */}
          <Route path="/jobs" element={<JobsListPage />} />
          <Route path="/jobs/create" element={<JobCreatePage />} />
          <Route path="/jobs/:jobId" element={<JobDetailPage />} />
          <Route path="/jobs/:id/edit" element={<JobEditPage />} />

          {/* Candidates */}
          <Route path="/candidates" element={<CandidatesListPage />} />
          <Route path="/candidates/create" element={<CandidateCreatePage />} />
          <Route path="/candidates/:id" element={<CandidateDetailPage />} />
          <Route path="/candidates/:id/timeline" element={<CandidateTimelinePage />} />

          {/* Assessments */}
          <Route path="/assessments" element={<AssessmentsPage />} />
          <Route path="/assessments/new/:jobId" element={<AssessmentsCreatePage />} />
          <Route path="/assessments/edit/:jobId/:assessmentId" element={<AssessmentsCreatePage />} />
          <Route path="/assessments/preview/:jobId/:assessmentId" element={<AssessmentSubmitPage />}/>
        </Route>
        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App
