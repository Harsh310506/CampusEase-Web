import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useUser } from '@/UserContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  fetchAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementStatus,
  type Announcement,
} from '@/services/announcementService';
import AnnouncementCard from '@/components/AnnouncementCard';
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Palette,
  Languages,
  Users,
  Calendar,
} from 'lucide-react';

const AnnouncementManagement: React.FC = () => {
  const { userData } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [previewAnnouncement, setPreviewAnnouncement] = useState<Announcement | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    theme: 'default',
    language: 'en',
    priority: 'medium',
    target_audience: 'all',
    expires_at: '',
  });

  const themes = [
    { value: 'default', label: 'Default', icon: '🎨', description: 'Clean slate design' },
    { value: 'info', label: 'Information', icon: 'ℹ️', description: 'Blue informational style' },
    { value: 'success', label: 'Success', icon: '✅', description: 'Green celebratory theme' },
    { value: 'warning', label: 'Warning', icon: '⚠️', description: 'Amber cautionary style' },
    { value: 'danger', label: 'Danger', icon: '🚨', description: 'Red alert theme' },
    { value: 'gradient', label: 'Gradient', icon: '✨', description: 'Colorful gradient design' },
  ];

  const languages = [
    { value: 'en', label: 'English', icon: '🇬🇧' },
    { value: 'hi', label: 'हिंदी (Hindi)', icon: '🇮🇳' },
    { value: 'gu', label: 'ગુજરાતી (Gujarati)', icon: '🇮🇳' },
    { value: 'es', label: 'Español (Spanish)', icon: '🇪🇸' },
    { value: 'fr', label: 'Français (French)', icon: '🇫🇷' },
    { value: 'de', label: 'Deutsch (German)', icon: '🇩🇪' },
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority', color: 'bg-gray-100' },
    { value: 'medium', label: 'Medium Priority', color: 'bg-blue-100' },
    { value: 'high', label: 'High Priority', color: 'bg-orange-100' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100' },
  ];

  const audiences = [
    { value: 'all', label: 'Everyone', icon: '👥' },
    { value: 'students', label: 'Students Only', icon: '🎓' },
    { value: 'faculty', label: 'Faculty Only', icon: '👨‍🏫' },
    { value: 'admin', label: 'Admins Only', icon: '👔' },
  ];

  useEffect(() => {
    if (!userData || userData.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'This page is only accessible to administrators.',
        variant: 'destructive',
      });
      navigate('/Index');
    } else {
      fetchAnnouncements();
    }
  }, [userData, navigate]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await fetchAllAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load announcements',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title and content are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createAnnouncement({
        title: formData.title,
        content: formData.content,
        theme: formData.theme as any,
        language: formData.language as any,
        priority: formData.priority as any,
        target_audience: formData.target_audience as any,
        is_active: true,
        created_by: userData?.user_id || 'admin',
        expires_at: formData.expires_at || undefined,
      });

      toast({
        title: 'Success',
        description: 'Announcement created successfully',
      });

      resetForm();
      setCreateDialogOpen(false);
      fetchAnnouncements();
    } catch (error: any) {
      console.error('Error creating announcement:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create announcement',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateAnnouncement = async () => {
    if (!editingAnnouncement) return;

    try {
      await updateAnnouncement(editingAnnouncement.id, {
        title: formData.title,
        content: formData.content,
        theme: formData.theme as any,
        language: formData.language as any,
        priority: formData.priority as any,
        target_audience: formData.target_audience as any,
        expires_at: formData.expires_at || undefined,
      });

      toast({
        title: 'Success',
        description: 'Announcement updated successfully',
      });

      resetForm();
      setEditingAnnouncement(null);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error updating announcement:', error);
      toast({
        title: 'Error',
        description: 'Failed to update announcement',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    try {
      await deleteAnnouncement(id);

      toast({
        title: 'Success',
        description: 'Announcement deleted successfully',
      });

      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete announcement',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await toggleAnnouncementStatus(id, !currentStatus);

      toast({
        title: 'Success',
        description: `Announcement ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });

      fetchAnnouncements();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update announcement status',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      theme: announcement.theme,
      language: announcement.language,
      priority: announcement.priority,
      target_audience: announcement.target_audience,
      expires_at: announcement.expires_at || '',
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      theme: 'default',
      language: 'en',
      priority: 'medium',
      target_audience: 'all',
      expires_at: '',
    });
  };

  const getPreviewAnnouncement = (): Announcement => ({
    id: 0,
    title: formData.title,
    content: formData.content,
    theme: formData.theme as any,
    language: formData.language as any,
    priority: formData.priority as any,
    target_audience: formData.target_audience as any,
    is_active: true,
    created_by: userData?.user_id || 'admin',
    created_at: new Date().toISOString(),
    expires_at: formData.expires_at || undefined,
  });

  const filteredAnnouncements = announcements.filter((announcement) =>
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!userData || userData.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-campusteal-100 rounded-full">
                <Megaphone className="h-8 w-8 text-campusteal-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">Announcement Management</h1>
                <p className="text-gray-600">Create and manage campus-wide announcements</p>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-campusteal-600 hover:bg-campusteal-700" onClick={resetForm}>
                  <Plus className="h-5 w-5 mr-2" />
                  Create Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Announcement</DialogTitle>
                  <DialogDescription>
                    Choose a theme, language, and compose your announcement
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Title */}
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter announcement title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  {/* Theme Selection */}
                  <div>
                    <Label className="flex items-center gap-2 mb-3">
                      <Palette className="h-4 w-4" />
                      Select Theme *
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {themes.map((theme) => (
                        <Card
                          key={theme.value}
                          className={`cursor-pointer transition-all ${
                            formData.theme === theme.value
                              ? 'ring-2 ring-campusteal-600 bg-campusteal-50'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setFormData({ ...formData, theme: theme.value as any })}
                        >
                          <CardContent className="p-4">
                            <div className="text-2xl mb-2">{theme.icon}</div>
                            <div className="font-semibold text-sm">{theme.label}</div>
                            <div className="text-xs text-gray-500">{theme.description}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Language Selection */}
                  <div>
                    <Label className="flex items-center gap-2 mb-3">
                      <Languages className="h-4 w-4" />
                      Content Language *
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {languages.map((lang) => (
                        <Button
                          key={lang.value}
                          variant={formData.language === lang.value ? 'default' : 'outline'}
                          className={`justify-start ${
                            formData.language === lang.value ? 'bg-campusteal-600' : ''
                          }`}
                          onClick={() => setFormData({ ...formData, language: lang.value as any })}
                        >
                          <span className="text-xl mr-2">{lang.icon}</span>
                          {lang.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      placeholder="Enter announcement content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="mt-1 min-h-[150px]"
                    />
                  </div>

                  {/* Priority & Audience */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Priority Level</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorities.map((priority) => (
                            <SelectItem key={priority.value} value={priority.value}>
                              {priority.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Target Audience
                      </Label>
                      <Select
                        value={formData.target_audience}
                        onValueChange={(value: any) => setFormData({ ...formData, target_audience: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {audiences.map((audience) => (
                            <SelectItem key={audience.value} value={audience.value}>
                              <span className="mr-2">{audience.icon}</span>
                              {audience.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <Label htmlFor="expires_at" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Expiry Date (Optional)
                    </Label>
                    <Input
                      id="expires_at"
                      type="datetime-local"
                      value={formData.expires_at}
                      onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  {/* Preview */}
                  {(formData.title || formData.content) && (
                    <div>
                      <Label className="mb-3 block">Preview</Label>
                      <AnnouncementCard announcement={getPreviewAnnouncement()} showFullContent />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateAnnouncement}
                      className="bg-campusteal-600 hover:bg-campusteal-700"
                    >
                      Create Announcement
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Total Announcements</div>
                <div className="text-2xl font-bold text-gray-800">{announcements.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Active</div>
                <div className="text-2xl font-bold text-green-600">
                  {announcements.filter((a) => a.is_active).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Inactive</div>
                <div className="text-2xl font-bold text-gray-600">
                  {announcements.filter((a) => !a.is_active).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Urgent</div>
                <div className="text-2xl font-bold text-red-600">
                  {announcements.filter((a) => a.priority === 'urgent').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Announcements List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-campusteal-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading announcements...</p>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Megaphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Announcements</h3>
                <p className="text-gray-500">Create your first announcement to get started</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAnnouncements.map((announcement) => (
                <div key={announcement.id} className="relative">
                  <AnnouncementCard announcement={announcement} />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(announcement.id, announcement.is_active)}
                      className="bg-white"
                    >
                      {announcement.is_active ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(announcement)}
                          className="bg-white"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Announcement</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                          <div>
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                              id="edit-title"
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-content">Content</Label>
                            <Textarea
                              id="edit-content"
                              value={formData.content}
                              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                              className="mt-1 min-h-[150px]"
                            />
                          </div>
                          <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setEditingAnnouncement(null)}>
                              Cancel
                            </Button>
                            <Button
                              onClick={handleUpdateAnnouncement}
                              className="bg-campusteal-600 hover:bg-campusteal-700"
                            >
                              Update
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="bg-white text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this announcement? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteAnnouncement(announcement.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AnnouncementManagement;
