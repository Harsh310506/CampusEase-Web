# Announcement System Guide

## Overview
The Announcement System allows administrators to create, manage, and publish professional announcements that are displayed to all users on the home page.

## Features

### 1. Multi-Theme Support (6 Themes)
- **Default** 🎨 - Clean slate design with gray tones
- **Information** ℹ️ - Blue informational style for general updates
- **Success** ✅ - Green celebratory theme for achievements
- **Warning** ⚠️ - Amber cautionary style for important notices
- **Danger** 🚨 - Red alert theme for urgent matters
- **Gradient** ✨ - Colorful gradient design for special announcements

### 2. Multi-Language Support (6 Languages)
- **English** 🇬🇧 - en
- **हिंदी (Hindi)** 🇮🇳 - hi
- **ગુજરાતી (Gujarati)** 🇮🇳 - gu
- **Español (Spanish)** 🇪🇸 - es
- **Français (French)** 🇫🇷 - fr
- **Deutsch (German)** 🇩🇪 - de

### 3. Priority Levels
- **Low Priority** - Standard announcements
- **Medium Priority** - Important updates (default)
- **High Priority** - Critical information
- **Urgent** - Emergency alerts (animated pulse effect)

### 4. Target Audience
- **Everyone** 👥 - Visible to all users
- **Students Only** 🎓 - Only visible to students
- **Faculty Only** 👨‍🏫 - Only visible to faculty members
- **Admins Only** 👔 - Only visible to administrators

### 5. Optional Features
- **Expiry Date** - Set automatic expiration for time-sensitive announcements
- **Live Preview** - See how your announcement will look before publishing
- **Active/Inactive Toggle** - Control visibility without deleting

## How to Use

### For Administrators

#### Creating an Announcement
1. Navigate to **Announcement Management** from the admin menu
2. Click **Create Announcement** button
3. Fill in the required fields:
   - **Title**: Short, descriptive headline
   - **Content**: Detailed message (supports multi-line text)
4. Select visual theme (choose from 6 options)
5. Select content language (choose from 6 languages)
6. Set priority level (low, medium, high, urgent)
7. Choose target audience (all, students, faculty, admin)
8. Optionally set an expiry date/time
9. Preview your announcement
10. Click **Create Announcement**

#### Managing Announcements
- **View All**: See all announcements with status indicators
- **Edit**: Click edit icon to modify title, content, or settings
- **Toggle Status**: Use eye icon to activate/deactivate
- **Delete**: Permanently remove announcements
- **Search**: Filter announcements by title or content

#### Dashboard Stats
Monitor announcement metrics:
- Total announcements
- Active announcements
- Inactive announcements
- Urgent announcements

### For All Users (Students, Faculty, Staff)

#### Viewing Announcements
- **Home Page**: Latest announcements appear at the top
- **Automatic Filtering**: Only see announcements relevant to your role
- **Navigation**: Use arrow buttons to browse through multiple announcements
- **Expired Filter**: Automatically hides expired announcements

#### Announcement Display
Each announcement card shows:
- Priority badge (colored indicator)
- Language indicator
- Target audience (if specific)
- Full content with proper formatting
- Posted date/time
- Expiry date (if applicable)

## Database Schema

```sql
CREATE TABLE announcements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'default',
  language TEXT NOT NULL DEFAULT 'en',
  priority TEXT NOT NULL DEFAULT 'medium',
  target_audience TEXT NOT NULL DEFAULT 'all',
  is_active BOOLEAN DEFAULT true,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NULL
);
```

Run the provided `announcements_schema.sql` file to create the table.

## Professional Design Features

### Theme-Based Styling
Each theme provides:
- Gradient background colors
- Matching border colors
- Themed icons
- Consistent badge styling
- Hover animations

### Responsive Layout
- Grid layout adjusts to screen size
- Mobile-friendly card design
- Touch-optimized controls

### Visual Feedback
- Hover effects on cards
- Animated urgent priority badges
- Loading states
- Success/error toast notifications

### Accessibility
- High contrast ratios
- Clear typography
- Icon indicators
- Screen reader support

## Best Practices

### For Administrators

1. **Choose Appropriate Themes**
   - Use "Info" for general updates
   - Use "Success" for achievements
   - Use "Warning" for important changes
   - Use "Danger" for emergencies

2. **Set Correct Priority**
   - Reserve "Urgent" for true emergencies
   - Use "High" for time-sensitive matters
   - Use "Medium" for standard updates

3. **Target Correctly**
   - Use specific audiences to avoid notification fatigue
   - Use "Everyone" sparingly

4. **Content Guidelines**
   - Keep titles concise (under 50 characters)
   - Write clear, actionable content
   - Use proper grammar and formatting
   - Set expiry dates for time-sensitive info

5. **Regular Maintenance**
   - Archive old announcements
   - Update expired information
   - Review and deactivate outdated content

## Integration Points

- **Home Page**: `/Index` - Displays latest 3 announcements
- **Admin Panel**: `/announcement-management` - Full CRUD interface
- **Service Layer**: `announcementService.ts` - API functions
- **Components**: 
  - `AnnouncementCard.tsx` - Display component
  - `AnnouncementDisplay.tsx` - Home page widget

## API Functions

```typescript
// Fetch all active announcements
fetchAllAnnouncements(): Promise<Announcement[]>

// Fetch announcements by user role
fetchAnnouncementsByAudience(role: string): Promise<Announcement[]>

// Create new announcement
createAnnouncement(data): Promise<Announcement>

// Update existing announcement
updateAnnouncement(id, updates): Promise<boolean>

// Delete announcement
deleteAnnouncement(id): Promise<boolean>

// Toggle active status
toggleAnnouncementStatus(id, status): Promise<boolean>
```

## Troubleshooting

### Announcements not showing on home page
- Check if announcements are marked as active
- Verify target_audience matches user role
- Ensure not expired (check expires_at)

### Can't create announcements
- Verify user has admin role
- Check database connection
- Ensure all required fields are filled

### Theme not displaying correctly
- Clear browser cache
- Check theme value is valid
- Verify CSS classes are loaded

## Future Enhancements

Potential additions:
- Rich text editor
- Image attachments
- Push notifications
- Email distribution
- Template library
- Scheduled publishing
- Draft mode
- Version history
- Analytics tracking

## Support

For technical issues or feature requests, contact the development team.
