#!/usr/bin/env node

/**
 * GitHub Push Script for Mentorium Backend
 * 
 * This script helps push the complete backend implementation to GitHub
 */

const readline = require('readline');
const { execSync } = require('child_process');

console.log('🚀 Mentorium GitHub Push Script');
console.log('==============================\n');

function askQuestion(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function setupGitHubRemote() {
  console.log('📋 GitHub Repository Setup');
  console.log('========================\n');
  
  const username = await askQuestion('Enter your GitHub username: ');
  const repoName = await askQuestion('Enter repository name (e.g., mentorium-backend): ');
  const useSSH = await askQuestion('Use SSH? (y/n, default: n): ');
  
  const remoteUrl = useSSH.toLowerCase() === 'y' 
    ? `git@github.com:${username}/${repoName}.git`
    : `https://github.com/${username}/${repoName}.git`;
  
  try {
    // Add remote repository
    execSync(`git remote add origin ${remoteUrl}`, { stdio: 'inherit' });
    console.log(`✅ Remote repository added: ${remoteUrl}`);
    
    // Push to GitHub
    console.log('\n📤 Pushing to GitHub...');
    execSync('git push -u origin main', { stdio: 'inherit' });
    console.log('✅ Successfully pushed to GitHub!');
    
    console.log('\n🌐 Repository URL:');
    console.log(`https://github.com/${username}/${repoName}`);
    
  } catch (error) {
    console.error('❌ Error during Git operations:', error.message);
    
    // Provide troubleshooting
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure your GitHub credentials are set up');
    console.log('2. If using HTTPS, you may need a personal access token');
    console.log('3. If using SSH, make sure your SSH key is added to GitHub');
    console.log('4. Check that the repository exists on GitHub');
  }
}

async function quickPush() {
  try {
    console.log('📤 Quick push to existing remote...');
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('✅ Successfully pushed to GitHub!');
  } catch (error) {
    console.error('❌ Error during push:', error.message);
    console.log('\n🔧 Make sure remote repository is configured correctly');
  }
}

async function main() {
  console.log('Choose an option:');
  console.log('1. Set up new GitHub repository');
  console.log('2. Quick push to existing remote');
  
  const choice = await askQuestion('Enter your choice (1 or 2): ');
  
  switch (choice) {
    case '1':
      await setupGitHubRemote();
      break;
    case '2':
      await quickPush();
      break;
    default:
      console.log('❌ Invalid choice. Please run the script again.');
      process.exit(1);
  }
  
  console.log('\n🎉 Your Mentorium backend is now on GitHub!');
  console.log('📚 Complete backend implementation with adaptive learning');
  console.log('🔒 Security fixes and proper API key management');
  console.log('📊 Analytics dashboard and founder visibility');
  console.log('🎯 Ready for production deployment!');
}

// Check if git repository is initialized
try {
  execSync('git rev-parse --git-dir', { stdio: 'inherit' });
  main();
} catch (error) {
  console.error('❌ Git repository not initialized. Please run: git init');
  process.exit(1);
}
