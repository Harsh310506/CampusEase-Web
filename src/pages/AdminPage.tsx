import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/supabase/supabaseClient';
import { useUser } from '@/UserContext';
import {
  Calendar,
  Users,
  BookOpen,
  Settings,
  TrendingUp,
  FileText,
  BarChart3,
  UserPlus,
  GraduationCap,
  Building2,
  Megaphone,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface DashboardStats {
  totalStudents: number;
  totalFaculty: number;
  totalClasses: number;
  pendingReports: number;
  upcomingEvents: number;
  activeAnnouncements: number;
}

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userData } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalFaculty: 0,
    totalClasses: 0,
    pendingReports: 0,
    upcomingEvents: 0,
    activeAnnouncements: 0,
  });

  const [formData, setFormData] = useState({
    Ename: '',
    Etype: '',
    Date: '',
    Time: '',
    Location: '',
    Ephoto: null as File | null,
  });

  useEffect(() => {
    // Redirect if not admin
    if (!userData || userData.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'This page is only accessible to administrators.',
        variant: 'destructive',
      });
      navigate('/Index');
      return;
    }
    loadDashboardStats();
  }, [userData, navigate]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);

      // Get student count
      const { count: studentCount } = await supabase
        .from('student_records')
        .select('*', { count: 'exact', head: true });

      // Get faculty count
      const { count: facultyCount } = await supabase
        .from('faculty')
        .select('*', { count: 'exact', head: true });

      // Get class count
      const { count: classCount } = await supabase
        .from('class_details')
        .select('*', { count: 'exact', head: true });

      // Get pending reports count
      const { count: reportCount } = await supabase
        .from('report')
        .select('*', { count: 'exact', head: true })
        .eq('resolved', false);

      // Get upcoming events count
      const today = new Date().toISOString().split('T')[0];
      const { count: eventCount } = await supabase
        .from('event')
        .select('*', { count: 'exact', head: true })
        .gte('Date', today);

      // Get active announcements count
      const { count: announcementCount } = await supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      setStats({
        totalStudents: studentCount || 0,
        totalFaculty: facultyCount || 0,
        totalClasses: classCount || 0,
        pendingReports: reportCount || 0,
        upcomingEvents: eventCount || 0,
        activeAnnouncements: announcementCount || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.Ename || !formData.Etype || !formData.Date || !formData.Time || !formData.Location) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.Ephoto) {
      toast({
        title: 'Validation Error',
        description: 'Please upload an event photo',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      const imagePath = `event/${Date.now()}_${formData.Ephoto.name}`;
      const { error: uploadError } = await supabase.storage
        .from('profile-pic')
        .upload(imagePath, formData.Ephoto, { upsert: true });

      if (uploadError) throw new Error('Image upload failed');

      const { data: publicUrlData } = supabase.storage
        .from('profile-pic')
        .getPublicUrl(imagePath);

      const { error: insertError } = await supabase
        .from('event')
        .insert([
          {
            Ename: formData.Ename,
            Etype: formData.Etype,
            Date: formData.Date,
            Time: formData.Time,
            Location: formData.Location,
            Ephoto: publicUrlData.publicUrl,
          },
        ]);

      if (insertError) throw new Error('Event creation failed');

      toast({
        title: 'Success',
        description: 'Event created successfully',
      });

      // Reset form
      setFormData({
        Ename: '',
        Etype: '',
        Date: '',
        Time: '',
        Location: '',
        Ephoto: null,
      });

      // Refresh stats
      loadDashboardStats();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create event',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: UserPlus,
      title: 'Student Management',
      description: 'Add or manage student records',
      color: 'bg-blue-500',
      path: '/class-management',
    },
    {
      icon: GraduationCap,
      title: 'Faculty Management',
      description: 'Manage faculty members and assignments',
      color: 'bg-purple-500',
      path: '/faculty-management',
    },
    {
      icon: Building2,
      title: 'Class Management',
      description: 'Configure classes and schedules',
      color: 'bg-green-500',
      path: '/class-management',
    },
    {
      icon: BookOpen,
      title: 'Subject Management',
      description: 'Manage subjects and curriculum',
      color: 'bg-orange-500',
      path: '/subject-management',
    },
    {
      icon: Megaphone,
      title: 'Announcements',
      description: 'Create and manage announcements',
      color: 'bg-pink-500',
      path: '/announcement-management',
    },
    {
      icon: FileText,
      title: 'Reports Dashboard',
      description: 'View and manage campus reports',
      color: 'bg-red-500',
      path: '/problems',
    },
    {
      icon: BarChart3,
      title: 'Data Analysis',
      description: 'View analytics and problem insights',
      color: 'bg-teal-500',
      path: '/data-analysis',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {userData?.fname}! Manage your campus operations here.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="events">Create Event</TabsTrigger>
            <TabsTrigger value="quick-actions">Quick Actions</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
                  <Users className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stats.totalStudents}</div>
                  <p className="text-xs text-gray-500 mt-1">Enrolled students</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Faculty Members</CardTitle>
                  <GraduationCap className="h-5 w-5 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stats.totalFaculty}</div>
                  <p className="text-xs text-gray-500 mt-1">Active faculty</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Classes</CardTitle>
                  <Building2 className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stats.totalClasses}</div>
                  <p className="text-xs text-gray-500 mt-1">Active classes</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Pending Reports</CardTitle>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stats.pendingReports}</div>
                  <p className="text-xs text-gray-500 mt-1">Needs attention</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Upcoming Events</CardTitle>
                  <Calendar className="h-5 w-5 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stats.upcomingEvents}</div>
                  <p className="text-xs text-gray-500 mt-1">Scheduled events</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Active Announcements</CardTitle>
                  <Megaphone className="h-5 w-5 text-pink-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stats.activeAnnouncements}</div>
                  <p className="text-xs text-gray-500 mt-1">Currently visible</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quick Access
                </CardTitle>
                <CardDescription>Frequently used management tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4"
                    onClick={() => navigate('/class-management')}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <UserPlus className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold">Manage Students</div>
                        <div className="text-xs text-gray-500">Add or edit student records</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4"
                    onClick={() => navigate('/problems')}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <FileText className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold">View Reports</div>
                        <div className="text-xs text-gray-500">{stats.pendingReports} pending</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4"
                    onClick={() => navigate('/announcement-management')}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <Megaphone className="h-5 w-5 text-pink-600" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold">Announcements</div>
                        <div className="text-xs text-gray-500">Create new announcement</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4"
                    onClick={() => navigate('/data-analysis')}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-teal-600" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold">Analytics</div>
                        <div className="text-xs text-gray-500">View insights and trends</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Event Tab */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-6 w-6" />
                  Create New Event
                </CardTitle>
                <CardDescription>Organize campus events for students and faculty</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-w-2xl">
                  <div>
                    <Label htmlFor="Ename">Event Name<span className="text-red-500">*</span></Label>
                    <Input
                      id="Ename"
                      name="Ename"
                      value={formData.Ename}
                      onChange={handleChange}
                      placeholder="Enter event name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="Etype">Event Type<span className="text-red-500">*</span></Label>
                    <Select value={formData.Etype} onValueChange={(val) => setFormData({ ...formData, Etype: val })}>
                      <SelectTrigger id="Etype">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Academic
                          </div>
                        </SelectItem>
                        <SelectItem value="social">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Social
                          </div>
                        </SelectItem>
                        <SelectItem value="career">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Career
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="Date">Date<span className="text-red-500">*</span></Label>
                      <Input
                        id="Date"
                        name="Date"
                        type="date"
                        value={formData.Date}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="Time">Start Time<span className="text-red-500">*</span></Label>
                      <Input
                        id="Time"
                        name="Time"
                        type="time"
                        value={formData.Time}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="Location">Location<span className="text-red-500">*</span></Label>
                    <Input
                      id="Location"
                      name="Location"
                      value={formData.Location}
                      onChange={handleChange}
                      placeholder="Enter event location"
                    />
                  </div>

                  <div>
                    <Label htmlFor="Ephoto">Event Photo<span className="text-red-500">*</span></Label>
                    <Input
                      id="Ephoto"
                      name="Ephoto"
                      type="file"
                      accept="image/*"
                      onChange={handleChange}
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload a banner or poster for the event</p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFormData({
                          Ename: '',
                          Etype: '',
                          Date: '',
                          Time: '',
                          Location: '',
                          Ephoto: null,
                        });
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="bg-campusblue-500 hover:bg-campusblue-600"
                    >
                      {loading ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Create Event
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quick Actions Tab */}
          <TabsContent value="quick-actions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-6 w-6" />
                  Management Tools
                </CardTitle>
                <CardDescription>Access all administrative functions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Card
                        key={index}
                        className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
                        onClick={() => navigate(action.path)}
                      >
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div className={`p-4 ${action.color} rounded-full`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{action.title}</h3>
                              <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPage;
