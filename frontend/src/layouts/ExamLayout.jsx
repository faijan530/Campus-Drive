import { Outlet, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button.jsx";

export default function ExamLayout() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="text-sm font-extrabold text-slate-900 tracking-tight">CampusDrive AI • Exam Mode</div>
          <Button variant="secondary" size="sm" onClick={() => navigate("/app/profile")}>
            Exit
          </Button>
        </div>
      </div>
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-3xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

