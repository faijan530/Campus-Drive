import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import { RequireAuth } from "./context/RequireAuth.jsx";
import ExamLayout from "./layouts/ExamLayout.jsx";
import TestPage from "./pages/student/TestPage.jsx";
import ResultPage from "./pages/student/ResultPage.jsx";
import TestAdmin from "./pages/admin/TestAdmin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminStudentsList from "./pages/admin/AdminStudentsList.jsx";
import AdminStudentSummary from "./pages/admin/AdminStudentSummary.jsx";
import AdminTestPerformance from "./pages/admin/AdminTestPerformance.jsx";
import AdminSkillsInsights from "./pages/admin/AdminSkillsInsights.jsx";
import AdminUsersList from "./pages/admin/AdminUsersList.jsx";
import AdminCreateTeacher from "./pages/admin/AdminCreateTeacher.jsx";
import TeacherDashboard from "./pages/teacher/TeacherDashboard.jsx";
import TeacherStudentsList from "./pages/teacher/TeacherStudentsList.jsx";
import TeacherStudentDetail from "./pages/teacher/TeacherStudentDetail.jsx";
import TeacherProjectsReview from "./pages/teacher/TeacherProjectsReview.jsx";
import ChangePassword from "./pages/common/ChangePassword.jsx";
import HelpCenter from "./pages/common/HelpCenter.jsx";
import { RequireRole } from "./context/RequireRole.jsx";
import ProfileOverview from "./pages/student/ProfileOverview.jsx";
import EditProfilePage from "./pages/student/EditProfilePage.jsx";
import SkillsPage from "./pages/student/SkillsPage.jsx";
import ProjectsPage from "./pages/student/ProjectsPage.jsx";
import ResumePage from "./pages/student/ResumePage.jsx";
import CollaborationHub from "./pages/collaboration/CollaborationHub.jsx";
import PartnerList from "./pages/collaboration/PartnerList.jsx";
import CreatePartnerRequest from "./pages/collaboration/CreatePartnerRequest.jsx";
import PartnerDetail from "./pages/collaboration/PartnerDetail.jsx";
import MyRequests from "./pages/collaboration/MyRequests.jsx";
import MyApplications from "./pages/collaboration/MyApplications.jsx";
import DoubtList from "./pages/collaboration/DoubtList.jsx";
import AskDoubt from "./pages/collaboration/AskDoubt.jsx";
import DoubtDetail from "./pages/collaboration/DoubtDetail.jsx";
import ChatHub from "./pages/collaboration/ChatHub.jsx";
import Documentation from "./pages/common/Documentation.jsx";
import { useAuth } from "./context/AuthContext.jsx";

// Dynamic Index for Collaboration Hub
function CollaborationIndex() {
  const { user } = useAuth();
  if (user?.role === "Student") {
    return <Navigate to="partners" replace />;
  }
  return <Navigate to="mentorship" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app/profile" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >

        {/* Unified Admin Panel */}
        <Route path="admin/analytics">
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<RequireRole allow={["Admin"]}><AdminDashboard /></RequireRole>} />
          <Route path="students" element={<RequireRole allow={["Admin"]}><AdminStudentsList /></RequireRole>} />
          <Route path="students/:id" element={<RequireRole allow={["Admin"]}><AdminStudentSummary /></RequireRole>} />
          <Route path="tests" element={<RequireRole allow={["Admin"]}><AdminTestPerformance /></RequireRole>} />
          <Route path="create-test" element={<RequireRole allow={["Admin"]}><TestAdmin /></RequireRole>} />
          <Route path="skills" element={<RequireRole allow={["Admin"]}><AdminSkillsInsights /></RequireRole>} />
          <Route path="users" element={<RequireRole allow={["Admin"]}><AdminUsersList /></RequireRole>} />
          <Route path="create-teacher" element={<RequireRole allow={["Admin"]}><AdminCreateTeacher /></RequireRole>} />
        </Route>

        {/* Unified Teacher Panel */}
        <Route path="teacher">
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<RequireRole allow={["Teacher"]}><TeacherDashboard /></RequireRole>} />
          <Route path="students" element={<RequireRole allow={["Teacher"]}><TeacherStudentsList /></RequireRole>} />
          <Route path="students/:id" element={<RequireRole allow={["Teacher"]}><TeacherStudentDetail /></RequireRole>} />
          <Route path="projects" element={<RequireRole allow={["Teacher"]}><TeacherProjectsReview /></RequireRole>} />
        </Route>

        {/* Student Identity & Profile System */}
        <Route
          path="profile"
          element={
            <RequireRole allow={["Student"]}>
              <ProfileOverview />
            </RequireRole>
          }
        />
        <Route
          path="profile/edit"
          element={
            <RequireRole allow={["Student"]}>
              <EditProfilePage />
            </RequireRole>
          }
        />
        <Route
          path="profile/skills"
          element={
            <RequireRole allow={["Student"]}>
              <SkillsPage />
            </RequireRole>
          }
        />
        <Route
          path="profile/projects"
          element={
            <RequireRole allow={["Student"]}>
              <ProjectsPage />
            </RequireRole>
          }
        />
        <Route
          path="profile/resume"
          element={
            <RequireRole allow={["Student"]}>
              <ResumePage />
            </RequireRole>
          }
        />

        {/* Global Collaboration System (Students & Teachers) */}
        <Route path="collaboration" element={<CollaborationHub />}>
           <Route index element={<CollaborationIndex />} />
           <Route path="partners" element={<PartnerList />} />
           <Route path="partners/new" element={<CreatePartnerRequest />} />
           <Route path="partners/:id" element={<PartnerDetail />} />
           <Route path="partners/my-requests" element={<MyRequests />} />
           <Route path="partners/my-applications" element={<MyApplications />} />
           <Route path="mentorship" element={<DoubtList />} />
           <Route path="mentorship/ask" element={<AskDoubt />} />
           <Route path="mentorship/:id" element={<DoubtDetail />} />
           <Route path="chats" element={<ChatHub />} />
        </Route>


        <Route
          path="security"
          element={
            <RequireAuth>
              <ChangePassword />
            </RequireAuth>
          }
        />

        <Route
          path="help-center"
          element={
            <RequireAuth>
              <HelpCenter />
            </RequireAuth>
          }
        />

        <Route
          path="documentation"
          element={
            <RequireAuth>
              <Documentation />
            </RequireAuth>
          }
        />

      </Route>

      <Route
        path="/exam"
        element={
          <RequireAuth>
            <ExamLayout />
          </RequireAuth>
        }
      >
        <Route path="test" element={<TestPage />} />
        <Route path="result" element={<ResultPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
