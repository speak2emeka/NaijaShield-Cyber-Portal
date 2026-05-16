import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { Home } from './pages/public/Home';
import { Contact } from './pages/public/Contact';
import { SimplePublicPage } from './pages/public/SimplePublicPage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword, ResetPassword, VerifyEmail } from './pages/auth/AuthRecovery';
import { ClientDashboard } from './pages/client/ClientDashboard';
import { ClientReports } from './pages/client/ClientReports';
import { ClientTickets } from './pages/client/ClientTickets';
import { ClientRequests } from './pages/client/ClientRequests';
import { ClientAccount } from './pages/client/ClientAccount';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminAuditLogs, AdminClients, AdminRequests, AdminTickets } from './pages/admin/AdminTables';
import { AdminClientDetail, AdminReportsUpload, AdminStaffManagement, AdminTicketDetail } from './pages/admin/AdminMorePages';
import {
  ClientAuditLogs,
  ClientCompanyProfile,
  ClientKnowledgeBase,
  ClientNotifications,
  ClientReportDetail,
  ClientScoreHistory,
  ClientSubscription,
  ClientTeamManagement,
  ClientTicketDetail
} from './pages/client/ClientMorePages';
import { ClientBilling, ClientSecuritySettings } from './pages/client/ClientEnterprisePages';
import {
  ClientAttackLab,
  ClientAttackRunDetail,
  ClientAttackSurface,
  ClientCompliance,
  ClientSecurityEvents,
  ClientSecurityPosture
} from './pages/client/ClientSecurityPlatformPages';
import { AdminAttackLabOverview, AdminSecurityEvents } from './pages/admin/AdminSecurityPlatformPages';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<SimplePublicPage title="About NaijaShield" subtitle="NaijaShield Technologies helps organizations across Africa build cyber resilience with assessments, training, incident response, and managed security operations." />} />
          <Route path="services" element={<SimplePublicPage title="Cybersecurity Services" subtitle="Penetration testing, cloud security audits, compliance readiness, security awareness, incident response, and SOC monitoring." />} />
          <Route path="pricing" element={<SimplePublicPage title="Pricing" subtitle="Choose ShieldStart, ShieldOps, or ShieldEnterprise depending on your security maturity and operational needs." />} />
          <Route path="blog" element={<SimplePublicPage title="Resources" subtitle="Cybersecurity guidance, threat intelligence, and awareness material for modern African organizations." />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="verify-email" element={<VerifyEmail />} />

        <Route element={<ProtectedRoute roles={['CLIENT']} />}>
          <Route path="client" element={<DashboardLayout />}>
            <Route index element={<ClientDashboard />} />
            <Route path="reports" element={<ClientReports />} />
            <Route path="reports/:id" element={<ClientReportDetail />} />
            <Route path="tickets" element={<ClientTickets />} />
            <Route path="tickets/:id" element={<ClientTicketDetail />} />
            <Route path="requests" element={<ClientRequests />} />
            <Route path="account" element={<ClientAccount />} />
            <Route path="company" element={<ClientCompanyProfile />} />
            <Route path="team" element={<ClientTeamManagement />} />
            <Route path="subscription" element={<ClientSubscription />} />
            <Route path="billing" element={<ClientBilling />} />
            <Route path="security" element={<ClientSecuritySettings />} />
            <Route path="security-posture" element={<ClientSecurityPosture />} />
            <Route path="security-events" element={<ClientSecurityEvents />} />
            <Route path="attack-surface" element={<ClientAttackSurface />} />
            <Route path="compliance" element={<ClientCompliance />} />
            <Route path="attack-lab" element={<ClientAttackLab />} />
            <Route path="attack-lab/runs/:id" element={<ClientAttackRunDetail />} />
            <Route path="notifications" element={<ClientNotifications />} />
            <Route path="audit-logs" element={<ClientAuditLogs />} />
            <Route path="knowledge-base" element={<ClientKnowledgeBase />} />
            <Route path="security-score" element={<ClientScoreHistory />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['ADMIN', 'SUPERADMIN', 'STAFF', 'ANALYST']} />}>
          <Route path="admin" element={<DashboardLayout admin />}>
            <Route index element={<AdminDashboard />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="clients/:id" element={<AdminClientDetail />} />
            <Route path="tickets" element={<AdminTickets />} />
            <Route path="tickets/:id" element={<AdminTicketDetail />} />
            <Route path="requests" element={<AdminRequests />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
            <Route path="reports-upload" element={<AdminReportsUpload />} />
            <Route path="staff" element={<AdminStaffManagement />} />
            <Route path="security-events" element={<AdminSecurityEvents />} />
            <Route path="attack-lab" element={<AdminAttackLabOverview />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
