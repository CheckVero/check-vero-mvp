// Check Vero ICP - Frontend JavaScript
// Mock data for demo purposes
const SAMPLE_PHONES = {
    '+31612345678': { company: 'Acme Bank', description: 'Customer Service Line' },
    '+61298765432': { company: 'Gov Australia', description: 'Government Services' },
    '+14155552020': { company: 'TechCorp Support', description: 'Technical Support Hotline' },
    '+442071234567': { company: 'British Telecom', description: 'Customer Services' }
};

// Global state
let canisterActor = null;
let isConnected = false;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Check Vero ICP - Initializing...');
    initializeApp();
});

async function initializeApp() {
    try {
        showLoading(true);
        
        // Simulate ICP connection (in real app, this would connect to actual canister)
        await simulateICPConnection();
        
        // Load dashboard stats
        await loadDashboardStats();
        
        // Set up event listeners
        setupEventListeners();
        
        showLoading(false);
        showMessage('Connected to Internet Computer Protocol', 'success');
        
        console.log('✅ Check Vero ICP - Initialized successfully');
        
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        showLoading(false);
        showMessage('Failed to connect to ICP network', 'error');
    }
}

async function simulateICPConnection() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock canister connection
    canisterActor = {
        verifyPhoneNumber: mockVerifyPhone,
        submitFraudReport: mockSubmitReport,
        getSystemStats: mockGetStats,
        initializeSampleDataPublic: () => Promise.resolve('Sample data ready')
    };
    
    isConnected = true;
    console.log('✅ Connected to Check Vero canister');
}

function setupEventListeners() {
    // Report type change handler
    const reportType = document.getElementById('report-type');
    if (reportType) {
        reportType.addEventListener('change', function() {
            const phoneGroup = document.getElementById('phone-group');
            const emailGroup = document.getElementById('email-group');
            
            if (this.value === 'email') {
                phoneGroup.style.display = 'none';
                emailGroup.style.display = 'block';
            } else {
                phoneGroup.style.display = 'block';
                emailGroup.style.display = 'none';
            }
        });
    }
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = show ? 'flex' : 'none';
    }
}

function showMessage(text, type = 'success') {
    const messageEl = document.getElementById('message');
    if (messageEl) {
        messageEl.textContent = text;
        messageEl.className = `message ${type}`;
        messageEl.style.display = 'block';
        
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }
}

function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // If we're on dashboard, load fresh stats
    if (sectionName === 'dashboard') {
        loadDashboardStats();
    }
}

function fillSampleNumber(phoneNumber) {
    const phoneInput = document.getElementById('phone-input');
    if (phoneInput) {
        phoneInput.value = phoneNumber;
        
        // Clear previous results
        const resultEl = document.getElementById('verification-result');
        if (resultEl) {
            resultEl.classList.add('hidden');
        }
    }
}

async function verifyPhone(event) {
    event.preventDefault();
    
    if (!isConnected) {
        showMessage('Not connected to ICP network', 'error');
        return;
    }
    
    const phoneInput = document.getElementById('phone-input');
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const resultEl = document.getElementById('verification-result');
    
    if (!phoneInput || !phoneInput.value.trim()) {
        showMessage('Please enter a phone number', 'error');
        return;
    }
    
    try {
        // Show loading state
        submitBtn.classList.add('loading');
        resultEl.classList.add('hidden');
        
        console.log('🔍 Verifying phone:', phoneInput.value);
        
        // Call canister method (mocked)
        const result = await canisterActor.verifyPhoneNumber(phoneInput.value.trim());
        
        // Display result
        displayVerificationResult(result, resultEl);
        
        showMessage('Phone verification completed', 'success');
        
    } catch (error) {
        console.error('Verification error:', error);
        showMessage('Verification failed: ' + error.message, 'error');
    } finally {
        submitBtn.classList.remove('loading');
    }
}

function displayVerificationResult(result, resultEl) {
    const isVerified = result.is_verified;
    
    resultEl.innerHTML = `
        <div class="verification-icon">${isVerified ? '✅' : '❌'}</div>
        <div>
            <div class="verification-title">
                ${isVerified ? 'Verified by Check Vero' : 'Not Verified'}
            </div>
            ${isVerified ? `
                <div class="verification-company">${result.company_name}</div>
                ${result.description ? `<div style="font-size: 14px; opacity: 0.8; margin-top: 4px;">${result.description}</div>` : ''}
            ` : `
                <div style="margin-top: 8px;">This number is not registered with Check Vero</div>
                <div style="font-size: 14px; opacity: 0.8; margin-top: 4px;">Proceed with caution. This may be a legitimate business not yet registered, or a potential scammer.</div>
            `}
        </div>
    `;
    
    resultEl.className = `verification-result ${isVerified ? 'verified' : 'not-verified'}`;
    resultEl.classList.remove('hidden');
}

async function submitReport(event) {
    event.preventDefault();
    
    if (!isConnected) {
        showMessage('Not connected to ICP network', 'error');
        return;
    }
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const resultEl = document.getElementById('report-result');
    
    const formData = {
        report_type: document.getElementById('report-type').value,
        phone_number: document.getElementById('report-phone').value,
        email_address: document.getElementById('report-email').value,
        description: document.getElementById('report-description').value
    };
    
    if (!formData.description.trim()) {
        showMessage('Please provide a description', 'error');
        return;
    }
    
    try {
        submitBtn.classList.add('loading');
        resultEl.classList.add('hidden');
        
        console.log('📝 Submitting report:', formData);
        
        // Call canister method (mocked)
        const result = await canisterActor.submitFraudReport(formData);
        
        // Display result
        displayReportResult(result, resultEl);
        
        // Clear form
        form.reset();
        
        showMessage('Report submitted successfully!', 'success');
        
    } catch (error) {
        console.error('Report submission error:', error);
        showMessage('Report submission failed: ' + error.message, 'error');
    } finally {
        submitBtn.classList.remove('loading');
    }
}

function displayReportResult(result, resultEl) {
    const riskClass = `risk-${result.risk_level.toLowerCase()}`;
    
    resultEl.innerHTML = `
        <div class="report-analysis ${riskClass}">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <span style="font-size: 20px;">
                    ${result.risk_level === 'HIGH' ? '🚨' : result.risk_level === 'MEDIUM' ? '⚠️' : '✅'}
                </span>
                <strong>Risk Level: ${result.risk_level}</strong>
            </div>
            <div style="margin-bottom: 16px; font-size: 16px;">
                ${result.recommendation}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 14px;">
                <span>Analysis completed via ICP</span>
                <div class="status-badge" style="background: var(--primary-green); color: white; padding: 4px 8px; border-radius: 12px;">
                    +${result.points_awarded} Points Earned
                </div>
            </div>
        </div>
    `;
    
    resultEl.classList.remove('hidden');
}

async function loadDashboardStats() {
    if (!isConnected) return;
    
    try {
        const stats = await canisterActor.getSystemStats();
        
        // Update stat cards
        document.getElementById('total-users').textContent = stats.total_users;
        document.getElementById('total-phones').textContent = stats.total_phones;
        document.getElementById('total-reports').textContent = stats.total_reports;
        document.getElementById('high-risk-reports').textContent = stats.high_risk_reports;
        
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

// Mock functions (simulate canister calls)
async function mockVerifyPhone(phoneNumber) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const sample = SAMPLE_PHONES[phoneNumber];
    if (sample) {
        return {
            is_verified: true,
            company_name: sample.company,
            description: sample.description,
            message: `✅ This number is verified and belongs to ${sample.company}`
        };
    } else {
        return {
            is_verified: false,
            company_name: '',
            description: null,
            message: '❌ This number is not registered. Proceed with caution.'
        };
    }
}

async function mockSubmitReport(reportData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simple risk analysis
    const description = reportData.description.toLowerCase();
    const suspiciousWords = ['urgent', 'click now', 'verify account', 'suspended', 'prize', 'winner', 'lottery'];
    
    let riskScore = 0;
    suspiciousWords.forEach(word => {
        if (description.includes(word)) riskScore++;
    });
    
    if (riskScore >= 2) {
        return {
            risk_level: 'HIGH',
            recommendation: '🚨 HIGH RISK - This appears to be a scam. Do not provide personal information.',
            points_awarded: 30
        };
    } else if (riskScore === 1) {
        return {
            risk_level: 'MEDIUM', 
            recommendation: '⚠️ MEDIUM RISK - Exercise caution. Verify through official channels.',
            points_awarded: 20
        };
    } else {
        return {
            risk_level: 'LOW',
            recommendation: '✅ LOW RISK - No obvious red flags detected.',
            points_awarded: 10
        };
    }
}

async function mockGetStats() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
        total_users: Math.floor(Math.random() * 1000) + 500,
        total_phones: Object.keys(SAMPLE_PHONES).length + Math.floor(Math.random() * 50),
        total_reports: Math.floor(Math.random() * 200) + 100,
        high_risk_reports: Math.floor(Math.random() * 50) + 10
    };
}

// Global functions for HTML onclick handlers
window.showSection = showSection;
window.fillSampleNumber = fillSampleNumber;
window.verifyPhone = verifyPhone;
window.submitReport = submitReport;