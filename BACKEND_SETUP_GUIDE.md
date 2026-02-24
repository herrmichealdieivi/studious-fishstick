# Backend Setup Guide for Mentorium

This guide walks you through setting up the complete backend infrastructure for your Mentorium educational platform.

## 🚀 Quick Start

### 1. Install Supabase CLI

**Windows (PowerShell):**
```powershell
iwr -useb https://supabase.com/install.ps1 | iex
```

**Windows (Manual):**
1. Download from: https://github.com/supabase/cli/releases
2. Add to your PATH

**Verify Installation:**
```bash
supabase --version
```

### 2. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose organization and project name
4. Set database password (save it securely)
5. Wait for project to be created
6. Copy **Project URL** and **Anon Key** from Settings > API

### 3. Configure Environment Variables

Edit the following files with your Supabase credentials:

#### mentorium-app/.env
```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# OpenAI Configuration (for RAG functionality)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Sentry Configuration (optional)
EXPO_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id

# App Configuration
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_ENVIRONMENT=development
EXPO_PUBLIC_TUTORING_API_URL=http://localhost:8000
```

#### mentorium-web/.env
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here
```

#### MARE/.env
```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Server Configuration
PORT=8000
NODE_ENV=development
```

### 4. Set Up Database

#### Link Local Project to Supabase
```bash
cd mentorium-app/infra/supabase
supabase link --project-ref your-project-ref
```

#### Apply Migrations
```bash
supabase db push
```

#### Seed Initial Data
```bash
supabase db reset
```

This will:
- Create all tables (houses, lessons, user_progress, etc.)
- Set up Row Level Security (RLS) policies
- Add initial educational content
- Create gamification badges and achievements

### 5. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Create account or sign in
3. Navigate to API Keys
4. Create new API key
5. Add to all `.env` files

### 6. Start Applications

#### Mobile App
```bash
cd mentorium-app
npm start
```

#### Web App
```bash
cd mentorium-web
npm start
```

#### MARE (RAG Engine)
```bash
cd MARE
npm start
```

## 📊 Database Schema

### Core Tables
- **houses**: Educational categories (Mathematics, Science, etc.)
- **lessons**: Individual lessons within houses
- **user_progress**: Track user lesson completion
- **profiles**: User profiles and preferences
- **quizzes**: Assessment questions and scores

### Gamification Tables
- **user_stats**: Points, streaks, achievements
- **badges**: Available badges and requirements
- **user_badges**: Badges earned by users
- **achievement_notifications**: In-app notifications

### RAG Tables
- **lesson_chunks**: Content chunks for retrieval
- **lesson_questions**: User questions and AI responses
- **exam_attempts**: Practice exams with feedback

## 🔧 Features Implemented

### ✅ Authentication
- Supabase Auth integration
- Email/password login
- Magic link authentication
- Profile auto-creation

### ✅ Educational Content
- Houses and lessons structure
- Progress tracking
- Quiz functionality
- RAG-powered Q&A

### ✅ Gamification
- Points system
- Achievement badges
- Streak tracking
- Leaderboards (global & house-specific)
- Real-time notifications

### ✅ API Layer
- Clean separation between UI and database
- Type-safe API functions
- Real-time subscriptions
- Error handling

## 🧪 Testing the Setup

### 1. Create Test User
```bash
# In the mobile app, sign up with email/password
# Check that profile is auto-created in Supabase
```

### 2. Test Lesson Progress
```bash
# Navigate to a lesson
# Complete the lesson
# Verify progress is saved in user_progress table
```

### 3. Test Gamification
```bash
# Complete multiple lessons
# Check points accumulation in user_stats
# Verify badge awards and notifications
```

### 4. Test Leaderboard
```bash
# Navigate to leaderboard screen
# Verify rankings are calculated correctly
# Test real-time updates
```

## 🚨 Troubleshooting

### Supabase CLI Issues
```bash
# If CLI not found, restart terminal after installation
# Verify with: supabase --version
```

### Database Connection Issues
```bash
# Check environment variables are correct
# Verify Supabase project is active
# Test connection with: supabase status
```

### RAG Not Working
```bash
# Verify OpenAI API key is valid
# Check lesson content is indexed
# Look for errors in MARE server logs
```

### Real-time Features Not Working
```bash
# Verify RLS policies allow access
# Check network connection
# Test with Supabase Realtime logs
```

## 📱 Development Workflow

### Adding New Lessons
1. Insert into `lessons` table
2. Content is automatically chunked for RAG
3. Create associated quiz in `quizzes` table

### Adding New Badges
1. Insert into `badges` table
2. Define requirement type and value
3. Badge checking is automatic

### Modifying Schema
1. Create new migration file
2. Test locally with `supabase db reset`
3. Apply to staging/production

## 🔒 Security Notes

- All tables have Row Level Security (RLS) enabled
- Users can only access their own data
- Public content is read-only
- API keys should never be committed to git

## 📈 Next Steps

After initial setup:

1. **Customize Content**: Add your own educational content
2. **Configure Notifications**: Set up push notifications
3. **Add Analytics**: Implement learning analytics
4. **Scale Infrastructure**: Consider CDN for media files
5. **Monitor Performance**: Set up error tracking and monitoring

## 🆘 Support

If you encounter issues:

1. Check this guide first
2. Review Supabase documentation
3. Check application logs
4. Verify environment variables
5. Test database connection

The backend infrastructure is now complete and ready to support all your frontend features!
