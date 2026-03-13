import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  CalendarDays,
  BookOpen,
  Bell,
  ShieldAlert,
  Users,
  FileText,
  GraduationCap,
  ArrowRight,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: <CalendarDays className="h-7 w-7 text-blue-500" />,
    title: 'Class Schedule',
    description: 'View your timetable, track upcoming classes and never miss a lecture.',
  },
  {
    icon: <BookOpen className="h-7 w-7 text-purple-500" />,
    title: 'Study Resources',
    description: 'Access notes, assignments and subject materials in one place.',
  },
  {
    icon: <Bell className="h-7 w-7 text-yellow-500" />,
    title: 'Announcements',
    description: 'Stay updated with real-time campus announcements and alerts.',
  },
  {
    icon: <ShieldAlert className="h-7 w-7 text-red-500" />,
    title: 'Emergency Alerts',
    description: 'Receive instant emergency notifications for campus safety.',
  },
  {
    icon: <Users className="h-7 w-7 text-green-500" />,
    title: 'Events',
    description: 'Explore academic, career and social events happening around campus.',
  },
  {
    icon: <FileText className="h-7 w-7 text-teal-500" />,
    title: 'Reports & Issues',
    description: 'Raise and track campus facility issues with ease.',
  },
];

const DemoCredential = ({ label, value }: { label: string; value: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-lg px-4 py-2">
      <span className="text-white/70 text-sm font-medium min-w-[70px]">{label}</span>
      <code className="text-white font-bold tracking-wide text-sm flex-1">{value}</code>
      <button
        onClick={handleCopy}
        className="text-white/60 hover:text-white transition-colors"
        title="Copy"
      >
        {copied ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 font-sans">
      {/* ── NAVBAR ── */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 rounded-xl p-2">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-white text-xl font-bold tracking-tight">CampusEase</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => navigate('/login')}
          >
            Log In
          </Button>
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/30"
            onClick={() => navigate('/login')}
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden px-6 md:px-16 pt-20 pb-24 text-center">
        {/* Glow blobs */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-10 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="inline-block mb-4 text-sm font-semibold text-blue-400 bg-blue-400/10 border border-blue-400/20 rounded-full px-4 py-1.5 tracking-wide">
            🎓 Student Portal · Charusat University
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            Your Campus,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Simplified
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10">
            CampusEase brings schedules, resources, events, announcements and issue reporting
            together — in one elegant platform.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 shadow-xl shadow-blue-500/30 group"
              onClick={() => navigate('/login')}
            >
              Log In to Portal
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 px-8"
              onClick={() => navigate('/login')}
            >
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* ── DEMO CREDENTIALS CARDS ── */}
      <section className="px-6 md:px-16 pb-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-white/50 text-sm mb-6">
            🚀 Try a live demo — no sign-up needed
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Student Card */}
            <div className="bg-gradient-to-br from-blue-600/30 to-blue-900/20 border border-blue-400/20 rounded-2xl p-6 shadow-2xl backdrop-blur-sm flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-blue-300 text-xs font-bold uppercase tracking-widest">Student Role</span>
              </div>
              <p className="text-white font-semibold text-base mb-1">Student Demo Account</p>
              <p className="text-white/50 text-xs mb-5">
                Access schedules, resources, events, announcements and raise issues.
              </p>
              <div className="space-y-3 flex-1">
                <DemoCredential label="Student ID" value="23DIT068" />
                <DemoCredential label="Password" value="12345678" />
              </div>
              <Button
                className="mt-5 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30"
                onClick={() => navigate('/login')}
              >
                Login as Student
              </Button>
            </div>

            {/* Admin Card */}
            <div className="bg-gradient-to-br from-amber-600/30 to-orange-900/20 border border-amber-400/20 rounded-2xl p-6 shadow-2xl backdrop-blur-sm flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-300 text-xs font-bold uppercase tracking-widest">Admin Role</span>
              </div>
              <p className="text-white font-semibold text-base mb-1">Admin Demo Account</p>
              <p className="text-white/50 text-xs mb-5">
                Manage students, faculty, classes, announcements and view data analytics.
              </p>
              <div className="space-y-3 flex-1">
                <DemoCredential label="Admin ID" value="admin001" />
                <DemoCredential label="Password" value="12345678" />
              </div>
              <Button
                className="mt-5 w-full bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-500/30"
                onClick={() => navigate('/login')}
              >
                Login as Admin
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="px-6 md:px-16 py-16 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">
            Everything You Need, In One Place
          </h2>
          <p className="text-white/50 text-center mb-12">
            Designed for students, faculty and administrators at Charusat University.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-200 group cursor-default"
              >
                <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 md:px-16 py-16 border-t border-white/10 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to streamline your campus life?
          </h2>
          <p className="text-white/50 mb-8">
            Sign in and discover a smarter way to manage your academic journey.
          </p>
          <Button
            size="lg"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-10 shadow-xl shadow-blue-500/30"
            onClick={() => navigate('/login')}
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 px-6 md:px-16 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-white/50 text-sm">
          <GraduationCap className="h-4 w-4" />
          <span>CampusEase © 2025 · Charusat University</span>
        </div>
        <p className="text-white/30 text-xs">
          For demo purposes only · Credentials are pre-filled for evaluation
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
