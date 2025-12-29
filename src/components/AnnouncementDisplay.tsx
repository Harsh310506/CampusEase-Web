import React, { useState, useEffect } from 'react';
import { fetchAnnouncementsByAudience, type Announcement } from '@/services/announcementService';
import AnnouncementCard from './AnnouncementCard';
import { Card, CardContent } from '@/components/ui/card';
import { Megaphone, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface AnnouncementDisplayProps {
  userRole?: string;
  maxDisplay?: number;
}

const AnnouncementDisplay: React.FC<AnnouncementDisplayProps> = ({ 
  userRole = 'all', 
  maxDisplay = 3 
}) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadAnnouncements();
  }, [userRole]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await fetchAnnouncementsByAudience(userRole);
      // Filter out expired announcements
      const activeAnnouncements = data.filter(announcement => {
        if (!announcement.expires_at) return true;
        return new Date(announcement.expires_at) > new Date();
      });
      setAnnouncements(activeAnnouncements);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : announcements.length - maxDisplay));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => 
      prev < announcements.length - maxDisplay ? prev + 1 : 0
    );
  };

  const visibleAnnouncements = announcements.slice(currentIndex, currentIndex + maxDisplay);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-campusteal-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Loading announcements...</p>
      </div>
    );
  }

  if (announcements.length === 0) {
    return null; // Don't show anything if no announcements
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-campusteal-600" />
          <h2 className="text-2xl font-bold text-gray-800">Latest Announcements</h2>
        </div>
        {announcements.length > maxDisplay && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleNext}
              disabled={currentIndex >= announcements.length - maxDisplay}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleAnnouncements.map((announcement) => (
          <AnnouncementCard key={announcement.id} announcement={announcement} />
        ))}
      </div>

      {announcements.length > maxDisplay && (
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Showing {currentIndex + 1}-{Math.min(currentIndex + maxDisplay, announcements.length)} of {announcements.length} announcements
          </p>
        </div>
      )}
    </div>
  );
};

export default AnnouncementDisplay;
