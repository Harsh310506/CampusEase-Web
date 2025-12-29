import React from 'react';
import { Announcement } from '@/services/announcementService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertCircle, CheckCircle, AlertTriangle, XCircle, Sparkles } from 'lucide-react';

interface AnnouncementCardProps {
  announcement: Announcement;
  showFullContent?: boolean;
}

const themeConfig = {
  default: {
    bg: 'bg-gradient-to-br from-slate-50 to-slate-100',
    border: 'border-slate-300',
    icon: Bell,
    iconColor: 'text-slate-600',
    badgeBg: 'bg-slate-200 text-slate-800',
  },
  info: {
    bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    border: 'border-blue-300',
    icon: AlertCircle,
    iconColor: 'text-blue-600',
    badgeBg: 'bg-blue-100 text-blue-800',
  },
  success: {
    bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
    border: 'border-green-300',
    icon: CheckCircle,
    iconColor: 'text-green-600',
    badgeBg: 'bg-green-100 text-green-800',
  },
  warning: {
    bg: 'bg-gradient-to-br from-amber-50 to-yellow-50',
    border: 'border-amber-300',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
    badgeBg: 'bg-amber-100 text-amber-800',
  },
  danger: {
    bg: 'bg-gradient-to-br from-red-50 to-rose-50',
    border: 'border-red-300',
    icon: XCircle,
    iconColor: 'text-red-600',
    badgeBg: 'bg-red-100 text-red-800',
  },
  gradient: {
    bg: 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50',
    border: 'border-purple-300',
    icon: Sparkles,
    iconColor: 'text-purple-600',
    badgeBg: 'bg-purple-100 text-purple-800',
  },
};

const priorityConfig = {
  low: { label: 'Low Priority', color: 'bg-gray-500' },
  medium: { label: 'Medium Priority', color: 'bg-blue-500' },
  high: { label: 'High Priority', color: 'bg-orange-500' },
  urgent: { label: 'Urgent', color: 'bg-red-500 animate-pulse' },
};

const languageLabels: Record<string, string> = {
  en: '🇬🇧 English',
  hi: '🇮🇳 हिंदी',
  gu: '🇮🇳 ગુજરાતી',
  es: '🇪🇸 Español',
  fr: '🇫🇷 Français',
  de: '🇩🇪 Deutsch',
};

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement, showFullContent = false }) => {
  const theme = themeConfig[announcement.theme] || themeConfig.default;
  const priority = priorityConfig[announcement.priority] || priorityConfig.medium;
  const Icon = theme.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className={`${theme.bg} ${theme.border} border-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-3 rounded-full ${theme.bg} ${theme.border} border`}>
              <Icon className={`h-6 w-6 ${theme.iconColor}`} />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-bold text-gray-800 mb-2">
                {announcement.title}
              </CardTitle>
              <div className="flex flex-wrap gap-2 items-center">
                <Badge className={`${priority.color} text-white text-xs`}>
                  {priority.label}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {languageLabels[announcement.language] || announcement.language}
                </Badge>
                {announcement.target_audience !== 'all' && (
                  <Badge className={theme.badgeBg}>
                    {announcement.target_audience.charAt(0).toUpperCase() + announcement.target_audience.slice(1)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <p className={`text-gray-700 ${showFullContent ? '' : 'line-clamp-3'} whitespace-pre-wrap`}>
            {announcement.content}
          </p>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            Posted: {formatDate(announcement.created_at || '')}
          </span>
          {announcement.expires_at && (
            <span className="text-xs text-red-500 font-medium">
              Expires: {formatDate(announcement.expires_at)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnnouncementCard;
