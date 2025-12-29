import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/supabase/supabaseClient';
import { useUser } from '@/UserContext';
import {
  Settings,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  BarChart3,
  Filter,
  ArrowRight,
  Wrench,
} from 'lucide-react';

interface ServiceHeadStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  criticalReports: number;
}

const ServiceHeadDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userData } = useUser();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ServiceHeadStats>({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    criticalReports: 0,
  });

  useEffect(() => {
    // Redirect if not service head
    if (!userData || userData.role !== 'service_head') {
      toast({
        title: 'Access Denied',
        description: 'This page is only accessible to service heads.',
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

      // Get total reports
      const { count: totalCount } = await supabase
        .from('report')
        .select('*', { count: 'exact', head: true });

      // Get pending reports
      const { count: pendingCount } = await supabase
        .from('report')
        .select('*', { count: 'exact', head: true })
        .eq('resolved', false);

      // Get resolved reports
      const { count: resolvedCount } = await supabase
        .from('report')
        .select('*', { count: 'exact', head: true })
        .eq('resolved', true);

      // Get critical reports
      const { count: criticalCount } = await supabase
        .from('report')
        .select('*', { count: 'exact', head: true })
        .eq('priority_text', 'Critical')
        .eq('resolved', false);

      setStats({
        totalReports: totalCount || 0,
        pendingReports: pendingCount || 0,
        resolvedReports: resolvedCount || 0,
        criticalReports: criticalCount || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const managementTools = [
    {
      icon: FileText,
      title: 'Problem Dashboard',
      description: 'View and manage all campus reports',
      color: 'bg-red-500',
      path: '/problems',
      stat: `${stats.pendingReports} pending`,
    },
    {
      icon: Settings,
      title: 'Report Configuration',
      description: 'Configure report form fields and options',
      color: 'bg-indigo-500',
      path: '/report-configuration',
      stat: 'Manage forms',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Service Head Dashboard</h1>
          <p className="text-gray-600">Welcome back, {userData?.fname}! Manage campus reports and configurations.</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Reports</CardTitle>
                  <FileText className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stats.totalReports}</div>
                  <p className="text-xs text-gray-500 mt-1">All time submissions</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-orange-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Pending Reports</CardTitle>
                  <Clock className="h-5 w-5 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{stats.pendingReports}</div>
                  <p className="text-xs text-gray-500 mt-1">Awaiting resolution</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-green-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Resolved Reports</CardTitle>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{stats.resolvedReports}</div>
                  <p className="text-xs text-gray-500 mt-1">Successfully completed</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-red-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Critical Issues</CardTitle>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{stats.criticalReports}</div>
                  <p className="text-xs text-gray-500 mt-1">Requires immediate attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Most frequently used management tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-6"
                    onClick={() => navigate('/problems')}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="p-3 bg-red-100 rounded-lg">
                        <FileText className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold text-lg">Problem Dashboard</div>
                        <div className="text-sm text-gray-500">{stats.pendingReports} reports pending review</div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto py-6"
                    onClick={() => navigate('/report-configuration')}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="p-3 bg-indigo-100 rounded-lg">
                        <Settings className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold text-lg">Report Configuration</div>
                        <div className="text-sm text-gray-500">Manage form fields and settings</div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Resolution Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Resolution Performance
                </CardTitle>
                <CardDescription>Report resolution statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Resolution Rate</span>
                      <span className="text-sm font-bold">
                        {stats.totalReports > 0
                          ? Math.round((stats.resolvedReports / stats.totalReports) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full transition-all"
                        style={{
                          width: `${stats.totalReports > 0
                              ? (stats.resolvedReports / stats.totalReports) * 100
                              : 0
                            }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{stats.totalReports}</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{stats.pendingReports}</div>
                      <div className="text-xs text-gray-500">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.resolvedReports}</div>
                      <div className="text-xs text-gray-500">Resolved</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Management Tools Tab */}
          <TabsContent value="management">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-6 w-6" />
                  Management Tools
                </CardTitle>
                <CardDescription>Access report management and configuration tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {managementTools.map((tool, index) => {
                    const Icon = tool.icon;
                    return (
                      <Card
                        key={index}
                        className="cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 border-2"
                        onClick={() => navigate(tool.path)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`p-4 ${tool.color} rounded-xl`}>
                              <Icon className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">{tool.title}</h3>
                              <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                              <Badge variant="secondary" className="text-xs">
                                {tool.stat}
                              </Badge>
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400 mt-2" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Additional Info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-start gap-3">
                    <Filter className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Service Head Responsibilities</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Monitor and manage all campus problem reports</li>
                        <li>• Configure report form fields and dropdown options</li>
                        <li>• Track resolution status and priority levels</li>
                        <li>• Manage ML model weights for priority calculation</li>
                      </ul>
                    </div>
                  </div>
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

export default ServiceHeadDashboard;
