# GitHub Setup Guide for Mentorium Backend

## 🚀 Quick Setup

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click "New repository"
3. Repository name: `mentorium-backend` (or your preferred name)
4. Description: `Complete backend implementation for Mentorium educational platform with adaptive learning`
5. Choose Public/Private (recommend Private for development)
6. Click "Create repository"

### 2. Connect Local Repository to GitHub

#### Option A: HTTPS (Recommended)
```bash
# Add remote repository (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git push -u origin main
```

#### Option B: SSH (More secure)
```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your-email@example.com"

# Add SSH key to GitHub account
# Copy content of ~/.ssh/id_ed25519.pub and add to GitHub > Settings > SSH and GPG keys

# Add remote repository
git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git push -u origin main
```

### 3. Push Commands

#### First Time Setup:
```bash
# Push main branch and set upstream
git push -u origin main

# Set upstream branch (optional)
git branch --set-upstream-to=origin/main
```

#### Subsequent Pushes:
```bash
# Simple push
git push origin main

# Force push if needed (use carefully)
git push --force-with-lease origin main
```

### 4. Verify Setup

#### Check Remote Configuration:
```bash
# List remotes
git remote -v

# Check current branch
git branch

# Check status
git status
```

#### Verify on GitHub:
- Visit your repository on GitHub
- Check that all files are present
- Verify the commit message is displayed correctly

## 📋 What's Being Pushed

### Backend Implementation:
- ✅ Complete database schema with 18 tables
- ✅ Row Level Security (RLS) policies
- ✅ Gamification system with badges/leaderboards
- ✅ Concept mastery with BKT adaptive learning
- ✅ Analytics dashboard for founders
- ✅ Security fixes (OpenAI key protection)

### API Layer:
- ✅ Leaderboard API (`src/api/leaderboard.ts`)
- ✅ Achievements API (`src/api/achievements.ts`)
- ✅ Concepts API (`src/api/concepts.ts`)
- ✅ Analytics API (`src/api/analytics.ts`)

### Database & Infrastructure:
- ✅ Migration files with complete schema
- ✅ Seed data for educational content
- ✅ Environment configuration templates
- ✅ Comprehensive documentation

### Security:
- ✅ RLS documentation (`infra/supabase/RLS.md`)
- ✅ Security vulnerability fixes
- ✅ Proper API key management

## 🔄 Workflow Recommendations

### Development Workflow:
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "Add new feature"

# 3. Push to remote
git push origin feature/new-feature

# 4. Create pull request on GitHub
```

### Branch Protection:
- Set up branch protection rules on GitHub
- Require pull requests for main branch
- Require status checks to pass
- Require code review approval

## 🚨 Troubleshooting

### Authentication Issues:
```bash
# If HTTPS asks for password every time:
git config --global credential.helper store

# Or use SSH key authentication
```

### Push Rejected:
```bash
# Check if remote exists
git remote -v

# Force push (if necessary)
git push --force-with-lease origin main
```

### Large Files:
```bash
# Check GitHub file size limits (100MB per file)
# Use Git LFS for large files if needed
git lfs track "*.largefile"
```

## 🎯 Next Steps

1. **Set up GitHub repository** using the instructions above
2. **Push the current commit** to get your code on GitHub
3. **Set up GitHub Actions** for CI/CD (optional)
4. **Configure branch protection** for main branch
5. **Invite collaborators** if working with a team

Your complete backend implementation is ready to be shared with the world or your team! 🚀
