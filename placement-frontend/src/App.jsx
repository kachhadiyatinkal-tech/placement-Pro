import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'

import AppLoader from './components/AppLoader'
import Chatbot from './components/chatbot/Chatbot'
import ProtectedRoute from './components/ProtectedRoute'
import SidebarLayout from './components/SidebarLayout'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

import StudentDashboard from './pages/student/StudentDashboard'
import Jobs from './pages/student/Jobs'
import Applications from './pages/student/Applications'

import TpoDashboard from './pages/tpo/TpoDashboard'
import PostJob from './pages/tpo/PostJob'
import Applicants from './pages/tpo/Applicants'
import TpoNotices from './pages/tpo/TpoNotices'

import AdminDashboard from './pages/management/AdminDashboard'
import AdminCompanies from './pages/management/AdminCompanies'
import AdminTpo from './pages/management/AdminTpo'
import AdminAddUser from './pages/management/AdminAddUser'
import AdminNotices from './pages/management/AdminNotices'
import AdminChatbotSettings from './pages/management/AdminChatbotSettings'
import ContactPageSettings from './pages/management/ContactPageSettings'
import AdminStudents from './pages/management/AdminStudents'
import AdminApplications from './pages/management/AdminApplications'
import AdminJobs from './pages/management/AdminJobs'
import AdminSmtpSettings from './pages/management/AdminSmtpSettings'
import CompanyDashboard from './pages/company/CompanyDashboard'
import CompanyJobs from './pages/company/CompanyJobs'
import CompanyApplicants from './pages/company/Applicants'
import StudentNotices from './pages/student/StudentNotices'
import PracticeTest from './pages/student/PracticeTest'
import TestResults from './pages/student/TestResults'
import Profile from './pages/common/Profile'
import { About } from './pages/common/About'
import { Home } from './pages/common/Home'
import { Contact } from './pages/common/Contact'
import { Layout } from './layout/Layout'
import { BrowseJobs, FAQ, LegalPage, PlacementStats } from './components/Footer'

function HomeRedirect() {
  const role = localStorage.getItem('role')
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/home" replace />

  if (role === 'tpo') return <Navigate to="/tpo/dashboard" replace />
  if (role === 'admin' || role === 'management' || role === 'superuser') return <Navigate to="/admin/dashboard" replace />
  if (role === 'company') return <Navigate to="/company/dashboard" replace />
  return <Navigate to="/student/dashboard" replace />
}

export default function App() {
  const toastTheme = useSelector((s) => (s.theme.mode === 'dark' ? 'dark' : 'light'))

  return (
    <AppLoader>
      <>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="jobs" element={<BrowseJobs />} />
            <Route path="stats" element={<PlacementStats />} />
            <Route path="faq" element={<FAQ type="Student" />} />
            <Route path="help" element={<FAQ type="Support" />} />
            <Route path="privacy" element={<LegalPage title="Privacy Policy" />} />
            <Route path="terms" element={<LegalPage title="Terms of Service" />} />
          </Route>
          <Route path="/" element={<HomeRedirect />} />

          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<SidebarLayout />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/jobs" element={<Jobs />} />
              <Route path="/student/applications" element={<Applications />} />
              <Route path="/student/notices" element={<StudentNotices />} />
              <Route path="/student/practice-test" element={<PracticeTest />} />
              <Route path="/student/test-results" element={<TestResults />} />
              <Route path="/student/profile" element={<Profile />} />

              <Route path="/tpo/dashboard" element={<TpoDashboard />} />
              <Route path="/tpo/post-job" element={<PostJob />} />
              <Route path="/tpo/applicants" element={<Applicants />} />
              <Route path="/tpo/notices" element={<TpoNotices />} />
              <Route path="/tpo/contact-page" element={<ContactPageSettings />} />
              <Route path="/tpo/profile" element={<Profile />} />

              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/companies" element={<AdminCompanies />} />
              <Route path="/admin/tpo" element={<AdminTpo />} />
              <Route path="/admin/students" element={<AdminStudents />} />
              <Route path="/admin/applications" element={<AdminApplications />} />
              <Route path="/admin/jobs" element={<AdminJobs />} />
              <Route path="/admin/add-user" element={<AdminAddUser />} />
              <Route path="/admin/notices" element={<AdminNotices />} />
              <Route path="/admin/chatbot-settings" element={<AdminChatbotSettings />} />
              <Route path="/admin/contact-page" element={<ContactPageSettings />} />
              <Route path="/admin/smtp-settings" element={<AdminSmtpSettings />} />
              <Route path="/admin/profile" element={<Profile />} />

              <Route path="/company/dashboard" element={<CompanyDashboard />} />
              <Route path="/company/jobs" element={<CompanyJobs />} />
              <Route
                path="/company/applicants"
                element={<CompanyApplicants />}
              />
              <Route path="/company/profile" element={<Profile />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <ToastContainer
          position="top-right"
          theme={toastTheme}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          toastClassName="text-[11px] font-bold uppercase tracking-wider rounded-xl backdrop-blur-md"
        />
        <Chatbot />
      </>
    </AppLoader>
  )
}
