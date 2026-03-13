  import { Toaster } from "@/components/ui/toaster";
  import { Toaster as Sonner } from "@/components/ui/sonner";
  import { TooltipProvider } from "@/components/ui/tooltip";
  import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
  import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
  import { useEffect } from "react";
  import { useUser } from './UserContext';

  import Login from "./pages/Login";
  import LandingPage from "./pages/LandingPage";
  import SignupForm from "./pages/signuph";
  import Index from "./pages/Index";
  import Schedule from "./pages/Schedule";
  import Resources from "./pages/Resources";
  import Events from "./pages/Events";
  import Profile from "./pages/Profile";
  import NotFound from "./pages/NotFound";
  import Reports from "./pages/Reports";
  import EmergencyAlerts from "./pages/EmergencyAlerts";
  import ProblemDashboard from "./pages/problem";
  import { UserProvider } from "./UserContext";
  import MyReports from './pages/MyReports';
  import AdminPage from './pages/AdminPage';
  import DataAnalysis from './pages/DataAnalysis';
  import SubjectManagement from './pages/SubjectManagement';
import AcademicEve from './pages/academic_eve';
import CareerEve from './pages/career_eve';
import SocialEve from './pages/social_eve';
import AllEve from './pages/all_eve';
import Sem4 from './pages/sam_4';
import Attendance from './pages/Attendance';
import ClassManagement from './pages/ClassManagement';
import FacultyManagement from './pages/FacultyManagement';
import FacultySchedule from './pages/FacultySchedule';
import ViewAttendance from './pages/ViewAttendance';
import FacultyClassAssignment from './pages/FacultyClassAssignment';
import AnnouncementManagement from './pages/AnnouncementManagement';
import ReportConfiguration from './pages/ReportConfiguration';
import ServiceHeadDashboard from './pages/ServiceHeadDashboard';
  const queryClient = new QueryClient();

  const SessionRedirectHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
      const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
      const publicPaths = ["/", "/login", "/signup"];

      // If logged in, redirect away from public pages to /Index
      if (isLoggedIn && publicPaths.includes(location.pathname)) {
        navigate("/Index", { replace: true });

        // Replace current history entry with /Index to prevent going back
        window.history.replaceState(null, "", "/Index");

        // Ensure that whenever the back button is clicked, the user is redirected to /Index
        window.onpopstate = () => {
          window.history.pushState(null, "", "/Index");
          navigate("/Index", { replace: true });
        };
      }
      
      // If not logged in and trying to access protected routes, redirect to landing
      if (!isLoggedIn && !publicPaths.includes(location.pathname)) {
        navigate("/", { replace: true });
      }
    }, [navigate, location]);

    return null;
  };

  function ProblemsOrMyReports() {
    const { userData } = useUser();
    if (userData?.role === 'admin' || userData?.role === 'service_head') {
      return <ProblemDashboard />;
    } else {
      return <MyReports />;
    }
  }

  function FacultyRoute({ children }) {
    const { userData } = useUser();
    if (userData?.role === 'faculty') {
      return children;
    } else {
      return <Navigate to="/Index" replace />;
    }
  }

  function AdminRoute({ children }) {
    const { userData } = useUser();
    if (userData?.role === 'admin') {
      return children;
    } else {
      return <Navigate to="/Index" replace />;
    }
  }

  function ServiceHeadRoute({ children }) {
    const { userData } = useUser();
    if (userData?.role === 'service_head') {
      return children;
    } else {
      return <Navigate to="/Index" replace />;
    }
  }

  function ServiceHeadOrAdminRoute({ children }) {
    const { userData } = useUser();
    if (userData?.role === 'service_head' || userData?.role === 'admin') {
      return children;
    } else {
      return <Navigate to="/Index" replace />;
    }
  }

  const App = () => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <UserProvider>
        <SessionRedirectHandler />

        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login/>} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/Index" element={<Index />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/events" element={<Events />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/emergency" element={<EmergencyAlerts />} />
            <Route path="/problems" element={<ProblemsOrMyReports />} />
            <Route path="/my-reports" element={<MyReports />} />
            <Route path="/all_eve" element={<AllEve />} />
            <Route path="/AdminPage" element={<AdminPage />} />
            <Route path="/academic_eve" element={<AcademicEve />} />
            <Route path="/career_eve" element={<CareerEve />} />
            <Route path="/social_eve" element={<SocialEve />} />
            <Route path="/sem_4" element={<Sem4 />} /> {/* Added route for Semester 4 */}
            <Route path="/attendance" element={<FacultyRoute><Attendance /></FacultyRoute>} />
            <Route path="/faculty-schedule" element={<FacultyRoute><FacultySchedule /></FacultyRoute>} />
            <Route path="/class-management" element={<AdminRoute><ClassManagement /></AdminRoute>} />
            <Route path="/faculty-management" element={<AdminRoute><FacultyManagement /></AdminRoute>} />
            <Route path="/subject-management" element={<AdminRoute><SubjectManagement /></AdminRoute>} />
            <Route path="/faculty-class-assignment" element={<AdminRoute><FacultyClassAssignment /></AdminRoute>} />
            <Route path="/announcement-management" element={<AdminRoute><AnnouncementManagement /></AdminRoute>} />
            <Route path="/report-configuration" element={<ServiceHeadRoute><ReportConfiguration /></ServiceHeadRoute>} />
            <Route path="/service-head-dashboard" element={<ServiceHeadRoute><ServiceHeadDashboard /></ServiceHeadRoute>} />
            <Route path="/view-attendance" element={<ViewAttendance />} />
            <Route path="/data-analysis" element={<AdminRoute><DataAnalysis /></AdminRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>

        </UserProvider>
          
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );

  export default App;
