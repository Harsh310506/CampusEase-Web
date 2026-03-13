import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import {
  CalendarDays,
  BookOpen,
  Bell,
  ShieldAlert,
  Users,
  FileText,
  ArrowRight,
  Copy,
  CheckCircle2,
  GraduationCap,
  LayoutDashboard,
  ChartBar,
} from 'lucide-react';
import { useState } from 'react';

/* ──────────────────────────────────────────────
   Feature data – mirrors what Index shows
────────────────────────────────────────────── */
const features = [
  {
    icon: <CalendarDays className="h-8 w-8 text-campusblue-500" />,
    title: 'Class Schedule',
    description: 'View your timetable, track upcoming classes and never miss a lecture.',
    bg: 'bg-campusblue-100',
  },
  {
    icon: <BookOpen className="h-8 w-8 text-campusteal-500" />,
    title: 'Study Resources',
    description: 'Access notes, assignments and subject materials organised by semester.',
    bg: 'bg-campusteal-100',
  },
  {
    icon: <Bell className="h-8 w-8 text-campusorange-500" />,
    title: 'Announcements',
    description: 'Stay updated with real-time campus announcements from administration.',
    bg: 'bg-campusorange-100',
  },
  {
    icon: <ShieldAlert className="h-8 w-8 text-red-500" />,
    title: 'Emergency Alerts',
    description: 'Receive instant emergency notifications for campus safety updates.',
    bg: 'bg-red-100',
  },
  {
    icon: <Users className="h-8 w-8 text-purple-500" />,
    title: 'Campus Events',
    description: 'Explore academic, career and social events happening around campus.',
    bg: 'bg-purple-100',
  },
  {
    icon: <FileText className="h-8 w-8 text-campusblue-500" />,
    title: 'Reports & Issues',
    description: 'Raise and track campus facility issues with real-time status updates.',
    bg: 'bg-campusblue-100',
  },
];

/* ──────────────────────────────────────────────
   Copyable credential row
────────────────────────────────────────────── */
const DemoCredential = ({ label, value }: { label: string; value: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
      <span className="text-gray-500 text-sm font-medium min-w-[80px]">{label}</span>
      <code className="text-campusblue-700 font-bold tracking-wide text-sm flex-1">{value}</code>
      <button
        onClick={handleCopy}
        className="text-gray-400 hover:text-campusblue-500 transition-colors"
        title="Copy to clipboard"
      >
        {copied
          ? <CheckCircle2 className="h-4 w-4 text-green-500" />
          : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
};

/* ──────────────────────────────────────────────
   Demo card (student / admin)
────────────────────────────────────────────── */
interface DemoCardProps {
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
  idLabel: string;
  idValue: string;
  password: string;
  buttonLabel: string;
  buttonClass: string;
  icon: React.ReactNode;
  iconBg: string;
}

const DemoCard = ({
  badge, badgeColor, title, description,
  idLabel, idValue, password,
  buttonLabel, buttonClass,
  icon, iconBg,
}: DemoCardProps) => {
  const navigate = useNavigate();
  return (
    <div className="campus-card flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className={`${iconBg} rounded-xl p-3 flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <span className={`inline-block text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${badgeColor} mb-1`}>
            {badge}
          </span>
          <p className="text-gray-900 font-semibold text-base leading-tight">{title}</p>
        </div>
      </div>
      <p className="text-gray-500 text-sm mb-5 leading-relaxed">{description}</p>
      <div className="space-y-2.5 flex-1">
        <DemoCredential label={idLabel} value={idValue} />
        <DemoCredential label="Password" value={password} />
      </div>
      <Button
        className={`mt-5 w-full font-semibold ${buttonClass}`}
        onClick={() => navigate('/login')}
      >
        {buttonLabel}
      </Button>
    </div>
  );
};

/* ──────────────────────────────────────────────
   Landing Page
────────────────────────────────────────────── */
const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ── NAVBAR (matches app header style) ── */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm backdrop-blur-md bg-white/90">
        <div className="container flex items-center justify-between h-16 mx-auto px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-campusblue-600">
              Campus<span className="text-gradient">Ease</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <a href="#features" className="px-3 py-2 text-sm font-medium hover:text-campusblue-500 rounded-md hover:bg-campusblue-50 transition-colors">
              Features
            </a>
            <a href="#demo" className="px-3 py-2 text-sm font-medium hover:text-campusblue-500 rounded-md hover:bg-campusblue-50 transition-colors">
              Try Demo
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="hover:text-campusblue-500 hover:bg-campusblue-50"
              onClick={() => navigate('/login')}
            >
              Log In
            </Button>
            <Button
              className="campus-button"
              onClick={() => navigate('/login')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ── HERO (same gradient as Index.tsx) ── */}
        <section className="bg-gradient-to-r from-campusblue-600 to-campusblue-800 text-white py-20">
          <div className="container mx-auto px-4 md:px-6 flex flex-col items-center text-center">
            <span className="inline-block mb-4 text-sm font-semibold bg-white/15 border border-white/30 rounded-full px-4 py-1.5 tracking-wide">
              🎓 Charusat University · Student Portal
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
              Welcome to CampusEase
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mb-10 animate-slide-up opacity-90">
              Your complete campus management platform — schedules, resources,
              events, announcements and more, all in one place.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-campusblue-600 hover:bg-gray-100 font-bold px-8 group"
                onClick={() => navigate('/login')}
              >
                Log In to Portal
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 px-8 font-semibold"
                onClick={() => { document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                View Demo Credentials
              </Button>
            </div>
          </div>
        </section>

        {/* ── STATS STRIP ── */}
        <section className="bg-campusblue-800 text-white">
          <div className="container mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: 'Students', value: '1,000+' },
              { label: 'Courses', value: '50+' },
              { label: 'Faculty Members', value: '100+' },
              { label: 'Features', value: '12+' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-campusblue-200 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURE CARDS ── */}
        <section id="features" className="py-16 container mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
            Discover What CampusEase Offers
          </h2>
          <p className="text-gray-500 text-center mb-10">
            Designed for students, faculty and administrators at Charusat University.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <div className={`${f.bg} rounded-xl p-3 inline-flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── DEMO CREDENTIALS ── */}
        <section id="demo" className="py-16 bg-gray-50 border-t border-gray-100">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
              Try a Live Demo
            </h2>
            <p className="text-gray-500 text-center mb-10">
              Use the credentials below to explore CampusEase — no sign-up required!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">

              {/* Student */}
              <DemoCard
                badge="Student Role"
                badgeColor="bg-campusblue-100 text-campusblue-700"
                title="Student Demo Account"
                description="Access your class schedule, study resources, campus events, announcements, attendance records and raise facility issues."
                idLabel="Student ID"
                idValue="23DIT068"
                password="12345678"
                buttonLabel="Login as Student"
                buttonClass="campus-button"
                icon={<GraduationCap className="h-6 w-6 text-campusblue-600" />}
                iconBg="bg-campusblue-100"
              />

              {/* Admin */}
              <DemoCard
                badge="Admin Role"
                badgeColor="bg-campusorange-100 text-campusorange-700"
                title="Admin Demo Account"
                description="Manage students, faculty, classes, subjects, announcements, faculty assignments and explore data analytics dashboards."
                idLabel="Admin ID"
                idValue="admin001"
                password="12345678"
                buttonLabel="Login as Admin"
                buttonClass="bg-campusorange-500 hover:bg-campusorange-600 text-white font-medium rounded-md px-4 py-2 transition-all duration-300 shadow-sm hover:shadow-md"
                icon={<LayoutDashboard className="h-6 w-6 text-campusorange-600" />}
                iconBg="bg-campusorange-100"
              />

            </div>
          </div>
        </section>

        {/* ── CTA (same teal bar as Index.tsx) ── */}
        <section className="py-16 bg-campusteal-500 text-white">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
              Sign in and discover a smarter way to manage your academic journey at Charusat.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-campusteal-600 hover:bg-gray-100 font-bold px-8"
                onClick={() => navigate('/login')}
              >
                Log In Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 px-8 font-semibold"
                onClick={() => navigate('/signup')}
              >
                Create Account
              </Button>
            </div>
          </div>
        </section>

      </main>

      {/* reuse the app's own Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
