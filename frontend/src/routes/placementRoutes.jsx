import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Student Pages
import AvailableDrives from '../pages/placement/student/AvailableDrives';
import AppliedDrives from '../pages/placement/student/AppliedDrives';
import PlacementResults from '../pages/placement/student/PlacementResults';

// Company Pages
import CompanyJobDrives from '../pages/placement/company/CompanyJobDrives';
import CreateJobDrive from '../pages/placement/company/CreateJobDrive';
import EligibleStudents from '../pages/placement/company/EligibleStudents';
import JobDriveApplications from '../pages/placement/company/JobDriveApplications';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default function PlacementRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Student Routes */}
      <Route
        path="available"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <AvailableDrives />
          </ProtectedRoute>
        }
      />
      <Route
        path="applied"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <AppliedDrives />
          </ProtectedRoute>
        }
      />
      <Route
        path="results"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <PlacementResults />
          </ProtectedRoute>
        }
      />

      {/* Company/Recruiter Routes */}
      <Route
        path="company/jobs"
        element={
          <ProtectedRoute allowedRoles={['admin', 'recruiter', 'company']}>
            <CompanyJobDrives />
          </ProtectedRoute>
        }
      />
      <Route
        path="company/jobs/create"
        element={
          <ProtectedRoute allowedRoles={['admin', 'recruiter', 'company']}>
            <CreateJobDrive />
          </ProtectedRoute>
        }
      />
      <Route
        path="company/jobs/:jobDriveId/eligible"
        element={
          <ProtectedRoute allowedRoles={['admin', 'recruiter', 'company']}>
            <EligibleStudents />
          </ProtectedRoute>
        }
      />
      <Route
        path="company/jobs/:jobDriveId/applications"
        element={
          <ProtectedRoute allowedRoles={['admin', 'recruiter', 'company']}>
            <JobDriveApplications />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route
        path="*"
        element={
          <Navigate
            to={user?.role === 'student' ? '/placements/available' : '/placements/company/jobs'}
            replace
          />
        }
      />
    </Routes>
  );
}
