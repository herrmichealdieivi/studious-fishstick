#!/usr/bin/env node

/**
 * Backend Setup Script for Mentorium
 * 
 * This script helps set up the complete backend infrastructure:
 * 1. Creates environment files from templates
 * 2. Validates configuration
 * 3. Provides instructions for Supabase setup
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.dirname(__dirname);
const MENTORIUM_APP = path.join(PROJECT_ROOT, 'mentorium-app');
const MENTORIUM_WEB = path.join(PROJECT_ROOT, 'mentorium-web');
const MARE = path.join(PROJECT_ROOT, 'MARE');

console.log('🚀 Mentorium Backend Setup Script');
console.log('==================================\n');

function createEnvFiles() {
    console.log('📝 Creating environment files...');

    // Create .env for mentorium-app
    const appEnvPath = path.join(MENTORIUM_APP, '.env');
    if (!fs.existsSync(appEnvPath)) {
        const appEnvExample = fs.readFileSync(path.join(MENTORIUM_APP, '.env.example'), 'utf8');
        fs.writeFileSync(appEnvPath, appEnvExample);
        console.log('✅ Created mentorium-app/.env');
    } else {
        console.log('ℹ️  mentorium-app/.env already exists');
    }

    // Create .env for mentorium-web
    const webEnvPath = path.join(MENTORIUM_WEB, '.env');
    if (!fs.existsSync(webEnvPath)) {
        const webEnvExample = fs.readFileSync(path.join(MENTORIUM_WEB, '.env.example'), 'utf8');
        fs.writeFileSync(webEnvPath, webEnvExample);
        console.log('✅ Created mentorium-web/.env');
    } else {
        console.log('ℹ️  mentorium-web/.env already exists');
    }

    // Create .env for MARE
    const mareEnvPath = path.join(MARE, '.env');
    if (!fs.existsSync(mareEnvPath)) {
        const mareEnvExample = fs.readFileSync(path.join(MARE, '.env.example'), 'utf8');
        fs.writeFileSync(mareEnvPath, mareEnvExample);
        console.log('✅ Created MARE/.env');
    } else {
        console.log('ℹ️  MARE/.env already exists');
    }
}

function checkSupabaseCLI() {
    console.log('\n🔍 Checking Supabase CLI...');
    try {
        execSync('supabase --version', { stdio: 'pipe' });
        console.log('✅ Supabase CLI is installed');
        return true;
    } catch (error) {
        console.log('❌ Supabase CLI not found');
        console.log('💡 Install it with: npm install -g supabase');
        return false;
    }
}

function showSetupInstructions() {
    console.log('\n📋 Setup Instructions:');
    console.log('======================');
    console.log('\n1. Create a Supabase Project:');
    console.log('   - Go to https://supabase.com/dashboard');
    console.log('   - Create a new project');
    console.log('   - Copy the Project URL and Anon Key');

    console.log('\n2. Configure Environment Variables:');
    console.log('   - Edit mentorium-app/.env');
    console.log('   - Edit mentorium-web/.env');
    console.log('   - Edit MARE/.env');
    console.log('   - Replace placeholder values with your Supabase credentials');

    console.log('\n3. Set up OpenAI API (for RAG):');
    console.log('   - Get API key from https://platform.openai.com');
    console.log('   - Add OPENAI_API_KEY to all .env files');

    console.log('\n4. Apply Database Migrations:');
    console.log('   - cd mentorium-app/infra/supabase');
    console.log('   - supabase login');
    console.log('   - supabase link --project-ref your-project-ref');
    console.log('   - supabase db push');

    console.log('\n5. Seed Initial Data:');
    console.log('   - supabase db reset'); // This will apply seeds

    console.log('\n6. Start the Applications:');
    console.log('   - cd mentorium-app && npm start');
    console.log('   - cd mentorium-web && npm start');
    console.log('   - cd MARE && npm start');
}

function validateSetup() {
    console.log('\n🔧 Validating Setup...');

    const envFiles = [
        path.join(MENTORIUM_APP, '.env'),
        path.join(MENTORIUM_WEB, '.env'),
        path.join(MARE, '.env')
    ];

    let allValid = true;

    envFiles.forEach(envPath => {
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            if (content.includes('your-project.supabase.co') || content.includes('your-anon-key')) {
                console.log(`⚠️  ${path.basename(path.dirname(envPath))}/.env needs configuration`);
                allValid = false;
            } else {
                console.log(`✅ ${path.basename(path.dirname(envPath))}/.env configured`);
            }
        } else {
            console.log(`❌ ${path.basename(path.dirname(envPath))}/.env missing`);
            allValid = false;
        }
    });

    return allValid;
}

// Main execution
createEnvFiles();

const hasSupabaseCLI = checkSupabaseCLI();

if (!hasSupabaseCLI) {
    console.log('\n❌ Cannot proceed without Supabase CLI');
    process.exit(1);
}

showSetupInstructions();

const isValid = validateSetup();

if (isValid) {
    console.log('\n🎉 Setup is complete! You can now run the applications.');
} else {
    console.log('\n⚠️  Please complete the configuration steps above.');
    console.log('   After configuration, run this script again to validate.');
}