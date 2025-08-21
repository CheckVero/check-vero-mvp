// Check Vero ICP dApp Frontend
// This is a demo implementation - in production, replace with proper ICP agent integration

class CheckVeroApp {
    constructor() {
        this.currentUser = null;
        this.currentView = 'home';
        this.mockActor = new MockICPActor();
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.showView('home');
        this.updateNavigation();
        
        // Check for existing user session (mock)
        const userData = localStorage.getItem('checkVeroUser');
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.updateNavigation();
            } catch (e) {
                localStorage.removeItem('checkVeroUser');
            }
        }
        
        // Initialize sample data
        this.mockActor.initializeSampleData();
    }
    
    bindEvents() {
        // Navigation
        document.getElementById('home-btn').addEventListener('click', () => this.showView('home'));
        document.getElementById('verify-btn').addEventListener('click', () => this.showView('verify'));
        document.getElementById('report-btn').addEventListener('click', () => this.showView('report'));
        document.getElementById('register-phone-btn').addEventListener('click', () => this.showView('register-phone'));
        document.getElementById('dashboard-btn').addEventListener('click', () => this.showView('dashboard'));
        document.getElementById('login-btn').addEventListener('click', () => this.showView('login'));
        document.getElementById('register-user-btn').addEventListener('click', () => this.showView('register'));
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());
        
        // Hero buttons
        document.getElementById('hero-verify-btn').addEventListener('click', () => this.showView('verify'));
        document.getElementById('hero-register-btn').addEventListener('click', () => this.showView('register'));
        
        // Auth switching
        document.getElementById('switch-to-register').addEventListener('click', () => this.showView('register'));
        document.getElementById('switch-to-login').addEventListener('click', () => this.showView('login'));
        
        // Forms
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('verify-form').addEventListener('submit', (e) => this.handleVerify(e));
        document.getElementById('report-form').addEventListener('submit', (e) => this.handleReport(e));
        
        // Role selection
        document.getElementById('register-role').addEventListener('change', (e) => {
            const companyGroup = document.getElementById('company-name-group');
            companyGroup.style.display = e.target.value === 'business' ? 'block' : 'none';
        });
        
        // Report type selection
        document.getElementById('report-type').addEventListener('change', (e) => {
            const phoneField = document.getElementById('phone-field');
            const emailField = document.getElementById('email-field');
            
            phoneField.style.display = e.target.value === 'call' ? 'block' : 'none';
            emailField.style.display = e.target.value === 'email' ? 'block' : 'none';
        });
        
        // Sample number buttons
        document.querySelectorAll('.sample-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const phoneNumber = btn.getAttribute('data-number');
                document.getElementById('phone-input').value = phoneNumber;
                document.getElementById('verification-result').style.display = 'none';
            });
        });
    }
    
    showView(viewName) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.style.display = 'none';
        });
        
        // Show selected view
        const targetView = document.getElementById(viewName + '-view');
        if (targetView) {
            targetView.style.display = 'block';
            this.currentView = viewName;
        }
        
        // Special handling for dashboard
        if (viewName === 'dashboard' && this.currentUser) {
            this.loadDashboard();
        }
        
        // Auth protection
        if (['report', 'register-phone', 'dashboard'].includes(viewName) && !this.currentUser) {
            this.showView('login');
            this.showMessage('Please sign in to access this feature', 'error');
            return;
        }
    }
    
    updateNavigation() {
        const loggedOut = document.querySelector('.auth-logged-out');
        const loggedIn = document.querySelector('.auth-logged-in');
        const reportBtn = document.getElementById('report-btn');
        const registerPhoneBtn = document.getElementById('register-phone-btn');
        
        if (this.currentUser) {
            loggedOut.style.display = 'none';
            loggedIn.style.display = 'flex';
            document.getElementById('username-display').textContent = this.currentUser.username;
            
            // Show role-specific navigation
            reportBtn.style.display = this.currentUser.role === 'citizen' ? 'block' : 'none';
            registerPhoneBtn.style.display = ['business', 'admin'].includes(this.currentUser.role) ? 'block' : 'none';
        } else {
            loggedOut.style.display = 'flex';
            loggedIn.style.display = 'none';
            reportBtn.style.display = 'none';
            registerPhoneBtn.style.display = 'none';
        }
    }
    
    async handleLogin(e) {
        e.preventDefault();
        const submitBtn = document.getElementById('login-submit');
        const btnText = submitBtn.querySelector('.btn-text');
        const spinner = submitBtn.querySelector('.loading-spinner');
        
        const username = document.getElementById('login-username').value;
        const email = document.getElementById('login-email').value;
        
        // Show loading
        btnText.textContent = 'Signing in...';
        spinner.style.display = 'inline-block';
        submitBtn.disabled = true;
        
        try {
            // Mock login - in real implementation, use ICP authentication
            const user = await this.mockActor.authenticateUser(username, email);
            
            this.currentUser = user;
            localStorage.setItem('checkVeroUser', JSON.stringify(user));
            
            this.updateNavigation();
            this.showView('dashboard');
            this.showMessage('Login successful!', 'success');
            
        } catch (error) {
            this.showMessage('Login failed: ' + error.message, 'error');
        } finally {
            btnText.textContent = 'Sign In';
            spinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    }
    
    async handleRegister(e) {
        e.preventDefault();
        const submitBtn = document.getElementById('register-submit');
        const btnText = submitBtn.querySelector('.btn-text');
        const spinner = submitBtn.querySelector('.loading-spinner');
        
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const role = document.getElementById('register-role').value;
        const companyName = document.getElementById('register-company').value || null;
        
        // Show loading
        btnText.textContent = 'Creating Account...';
        spinner.style.display = 'inline-block';
        submitBtn.disabled = true;
        
        try {
            const result = await this.mockActor.registerUser(username, email, role, companyName);
            
            if (result.Ok) {
                this.currentUser = result.Ok;
                localStorage.setItem('checkVeroUser', JSON.stringify(this.currentUser));
                
                this.updateNavigation();
                this.showView('dashboard');
                this.showMessage('Account created successfully!', 'success');
                
                // Reset form
                e.target.reset();
            } else {
                throw new Error(result.Err);
            }
            
        } catch (error) {
            this.showMessage('Registration failed: ' + error.message, 'error');
        } finally {
            btnText.textContent = 'Create Account';
            spinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    }
    
    async handleVerify(e) {
        e.preventDefault();
        const submitBtn = document.getElementById('verify-submit');
        const btnText = submitBtn.querySelector('.btn-text');
        const spinner = submitBtn.querySelector('.loading-spinner');
        const resultDiv = document.getElementById('verification-result');
        
        const phoneNumber = document.getElementById('phone-input').value.trim();
        
        if (!phoneNumber) {
            this.showMessage('Please enter a phone number', 'error');
            return;
        }
        
        // Show loading
        btnText.textContent = 'Verifying...';
        spinner.style.display = 'inline-block';
        submitBtn.disabled = true;
        resultDiv.style.display = 'none';
        
        try {
            const result = await this.mockActor.verifyPhoneNumber(phoneNumber);
            
            if (result.Ok) {
                const data = result.Ok;
                this.displayVerificationResult(data);
                this.showMessage('Verification completed!', 'success');
            } else {
                throw new Error(result.Err);
            }
            
        } catch (error) {
            this.showMessage('Verification failed: ' + error.message, 'error');
        } finally {
            btnText.textContent = 'Verify Number';
            spinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    }
    
    displayVerificationResult(data) {
        const resultDiv = document.getElementById('verification-result');
        const isVerified = data.is_verified;
        
        resultDiv.className = isVerified ? 'verification-success' : 'verification-fail';
        
        const content = `
            <div class="result-icon">${isVerified ? '✅' : '❌'}</div>
            <div class="result-content">
                <div class="result-title">${isVerified ? 'Verified by Check Vero' : 'Not Verified'}</div>
                ${isVerified ? `
                    <div class="result-company">${data.company_name}</div>
                    ${data.description ? `<div class="result-description">${data.description}</div>` : ''}
                    <div class="result-meta">
                        Verified since: ${new Date(Number(data.verified_since) / 1000000).toLocaleDateString()}
                        ${data.verification_count ? ` • Verified ${data.verification_count} times` : ''}
                    </div>
                ` : `
                    <div class="result-company">This number is not registered with Check Vero</div>
                    <div class="result-description">Proceed with caution. This may be a legitimate business not yet registered, or a potential scammer.</div>
                `}
            </div>
        `;
        
        resultDiv.innerHTML = content;
        resultDiv.style.display = 'block';
    }
    
    async handleReport(e) {
        e.preventDefault();
        const submitBtn = document.getElementById('report-submit');
        const btnText = submitBtn.querySelector('.btn-text');
        const spinner = submitBtn.querySelector('.loading-spinner');
        const resultDiv = document.getElementById('analysis-result');
        
        if (!this.currentUser) {
            this.showMessage('Please sign in to submit reports', 'error');
            return;
        }
        
        const reportType = document.getElementById('report-type').value;
        const phoneNumber = document.getElementById('report-phone').value || null;
        const emailAddress = document.getElementById('report-email').value || null;
        const description = document.getElementById('report-description').value;
        
        // Show loading
        btnText.textContent = 'Analyzing Report...';
        spinner.style.display = 'inline-block';
        submitBtn.disabled = true;
        resultDiv.style.display = 'none';
        
        try {
            const result = await this.mockActor.submitFraudReport(reportType, phoneNumber, emailAddress, description);
            
            if (result.Ok) {
                const data = result.Ok;
                this.displayAnalysisResult(data.ai_analysis);
                this.showMessage('Report submitted successfully!', 'success');
                
                // Reset form
                e.target.reset();
                document.getElementById('phone-field').style.display = 'block';
                document.getElementById('email-field').style.display = 'none';
            } else {
                throw new Error(result.Err);
            }
            
        } catch (error) {
            this.showMessage('Report submission failed: ' + error.message, 'error');
        } finally {
            btnText.textContent = 'Submit Report';
            spinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    }
    
    displayAnalysisResult(analysis) {
        const resultDiv = document.getElementById('analysis-result');
        const riskLevel = analysis.risk_level.toLowerCase();
        
        const content = `
            <div class="analysis-title">🤖 AI Analysis Result</div>
            <div class="risk-indicator risk-${riskLevel}">
                <span style="font-size: 18px;">
                    ${analysis.risk_level === 'HIGH' ? '🚨' : 
                      analysis.risk_level === 'MEDIUM' ? '⚠️' : '✅'}
                </span>
                <div>
                    <div class="risk-level">Risk Level: ${analysis.risk_level}</div>
                    <div class="risk-recommendation">${analysis.recommendation}</div>
                </div>
            </div>
            <div class="analysis-meta">
                <div class="confidence">Confidence: ${analysis.confidence_score}%</div>
                <div class="points-badge">+${analysis.points_awarded} Points Earned</div>
            </div>
            ${analysis.reasons && analysis.reasons.length > 0 ? `
                <div>
                    <p style="font-weight: 600; color: var(--gray-700); margin-bottom: 8px;">Analysis Reasons:</p>
                    <ul style="color: var(--gray-600); padding-left: 20px; margin: 0;">
                        ${analysis.reasons.map(reason => `<li>${reason}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        `;
        
        resultDiv.innerHTML = content;
        resultDiv.style.display = 'block';
    }
    
    async loadDashboard() {
        if (!this.currentUser) return;
        
        const usernameSpan = document.getElementById('dashboard-username');
        const subtitleP = document.getElementById('dashboard-subtitle');
        const statsGrid = document.getElementById('stats-grid');
        const sectionTitle = document.getElementById('dashboard-section-title');
        const content = document.getElementById('dashboard-content');
        
        usernameSpan.textContent = this.currentUser.username;
        
        // Set role-specific subtitle
        const subtitles = {
            citizen: 'Your fraud protection dashboard',
            business: 'Your business verification dashboard',
            admin: 'Admin control dashboard'
        };
        subtitleP.textContent = subtitles[this.currentUser.role] || 'Your dashboard';
        
        try {
            // Load dashboard stats
            const statsResult = await this.mockActor.getDashboardStats(this.currentUser.id);
            
            if (statsResult.Ok) {
                this.renderDashboardStats(statsResult.Ok, statsGrid);
                this.renderDashboardContent(this.currentUser.role, sectionTitle, content);
            }
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            this.showMessage('Failed to load dashboard data', 'error');
        }
    }
    
    renderDashboardStats(stats, container) {
        const role = this.currentUser.role;
        let statsHTML = '';
        
        if (role === 'citizen') {
            statsHTML = `
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-value">${stats.total_reports || 0}</div>
                    <div class="stat-label">Reports Submitted</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-value">${stats.points_earned || 0}</div>
                    <div class="stat-label">Points Earned</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🚨</div>
                    <div class="stat-value">${stats.high_risk_reports || 0}</div>
                    <div class="stat-label">High Risk Detected</div>
                </div>
            `;
        } else if (role === 'business') {
            statsHTML = `
                <div class="stat-card">
                    <div class="stat-icon">📞</div>
                    <div class="stat-value">${stats.registered_numbers || 0}</div>
                    <div class="stat-label">Registered Numbers</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">✅</div>
                    <div class="stat-value">${stats.verification_checks || 0}</div>
                    <div class="stat-label">Verification Requests</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📋</div>
                    <div class="stat-value">${stats.reports_mentioning || 0}</div>
                    <div class="stat-label">Related Reports</div>
                </div>
            `;
        } else if (role === 'admin') {
            statsHTML = `
                <div class="stat-card">
                    <div class="stat-icon">👥</div>
                    <div class="stat-value">${stats.total_users || 0}</div>
                    <div class="stat-label">Total Users</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-value">${stats.total_reports || 0}</div>
                    <div class="stat-label">Total Reports</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📞</div>
                    <div class="stat-value">${stats.total_phone_numbers || 0}</div>
                    <div class="stat-label">Verified Numbers</div>
                </div>
            `;
        }
        
        container.innerHTML = statsHTML;
    }
    
    renderDashboardContent(role, titleEl, contentEl) {
        const titles = {
            citizen: 'Your Recent Reports',
            business: 'Your Registered Numbers',
            admin: 'Recent System Activity'
        };
        
        titleEl.textContent = titles[role] || 'Recent Activity';
        
        // For now, show placeholder content
        if (role === 'citizen') {
            contentEl.innerHTML = `
                <div class="empty-state">
                    <p>No reports submitted yet. Start by reporting suspicious communications!</p>
                </div>
            `;
        } else if (role === 'business') {
            contentEl.innerHTML = `
                <div class="empty-state">
                    <p>No phone numbers registered yet. Register your business numbers to get verified.</p>
                </div>
            `;
        } else {
            contentEl.innerHTML = `
                <div class="empty-state">
                    <p>System running smoothly. Monitor user activity and fraud reports here.</p>
                </div>
            `;
        }
    }
    
    logout() {
        this.currentUser = null;
        localStorage.removeItem('checkVeroUser');
        this.updateNavigation();
        this.showView('home');
        this.showMessage('Logged out successfully!', 'success');
    }
    
    showMessage(text, type = 'success') {
        const container = document.getElementById('message-container');
        const content = document.getElementById('message-content');
        const textEl = document.getElementById('message-text');
        const iconEl = content.querySelector('.message-icon');
        
        // Update content
        textEl.textContent = text;
        
        // Update styling based on type
        content.className = `message-${type}`;
        iconEl.textContent = type === 'error' ? '❌' : type === 'info' ? 'ℹ️' : '✅';
        
        // Show message
        container.style.display = 'block';
        
        // Hide after 5 seconds
        setTimeout(() => {
            container.style.display = 'none';
        }, 5000);
    }
}

// Mock ICP Actor for demo purposes
// In production, replace with actual IC agent and canister integration
class MockICPActor {
    constructor() {
        this.users = new Map();
        this.phoneNumbers = new Map();
        this.reports = new Map();
        this.userCounter = 1;
        this.phoneCounter = 1;
        this.reportCounter = 1;
    }
    
    initializeSampleData() {
        // Initialize with sample phone numbers
        const samplePhones = [
            {
                id: 'phone1',
                phone_number: '+31612345678',
                company_name: 'Acme Bank',
                description: 'Customer Service Line',
                registered_by: 'system',
                verified: true,
                verification_date: Date.now() * 1000000, // Convert to nanoseconds for IC compatibility
                verification_count: 0,
                is_active: true
            },
            {
                id: 'phone2',
                phone_number: '+61298765432',
                company_name: 'Gov Australia',
                description: 'Government Services',
                registered_by: 'system',
                verified: true,
                verification_date: Date.now() * 1000000,
                verification_count: 0,
                is_active: true
            },
            {
                id: 'phone3',
                phone_number: '+14155552020',
                company_name: 'TechCorp Support',
                description: 'Technical Support Hotline',
                registered_by: 'system',
                verified: true,
                verification_date: Date.now() * 1000000,
                verification_count: 0,
                is_active: true
            },
            {
                id: 'phone4',
                phone_number: '+442071234567',
                company_name: 'British Telecom',
                description: 'Customer Services',
                registered_by: 'system',
                verified: true,
                verification_date: Date.now() * 1000000,
                verification_count: 0,
                is_active: true
            }
        ];
        
        samplePhones.forEach(phone => {
            this.phoneNumbers.set(phone.phone_number, phone);
        });
    }
    
    async authenticateUser(username, email) {
        // Mock authentication - find existing user or create demo user
        for (let [_, user] of this.users) {
            if (user.username === username || user.email === email) {
                return user;
            }
        }
        
        // Create demo user if not found
        return this.registerUser(username, email, 'citizen', null).then(result => {
            if (result.Ok) {
                return result.Ok;
            } else {
                throw new Error(result.Err);
            }
        });
    }
    
    async registerUser(username, email, role, companyName) {
        // Check if username exists
        for (let [_, user] of this.users) {
            if (user.username === username) {
                return { Err: "Username already exists" };
            }
        }
        
        const userId = `user${this.userCounter++}`;
        const newUser = {
            id: userId,
            username,
            email,
            role,
            company_name: companyName,
            points: 0,
            created_at: Date.now() * 1000000, // Convert to nanoseconds
            is_active: true
        };
        
        this.users.set(userId, newUser);
        return { Ok: newUser };
    }
    
    async verifyPhoneNumber(phoneNumber) {
        await this.delay(1000); // Simulate network delay
        
        const phone = this.phoneNumbers.get(phoneNumber);
        if (phone) {
            // Update verification count
            phone.verification_count += 1;
            this.phoneNumbers.set(phoneNumber, phone);
            
            return {
                Ok: {
                    company_name: phone.company_name,
                    description: phone.description,
                    is_verified: true,
                    message: `✅ This number is verified and belongs to ${phone.company_name}`,
                    verified_since: phone.verification_date,
                    verification_count: phone.verification_count
                }
            };
        } else {
            return {
                Ok: {
                    company_name: "",
                    description: null,
                    is_verified: false,
                    message: "❌ This number is not registered. Proceed with caution.",
                    verified_since: 0,
                    verification_count: 0
                }
            };
        }
    }
    
    async submitFraudReport(reportType, phoneNumber, emailAddress, description) {
        await this.delay(1500); // Simulate AI analysis delay
        
        const reportId = `report${this.reportCounter++}`;
        const analysis = this.analyzeReport(description);
        
        const report = {
            id: reportId,
            user_id: 'current_user', // In real implementation, get from context
            report_type: reportType,
            phone_number: phoneNumber,
            email_address: emailAddress,
            description,
            risk_level: analysis.risk_level,
            recommendation: analysis.recommendation,
            points_awarded: analysis.points_awarded,
            created_at: Date.now() * 1000000
        };
        
        this.reports.set(reportId, report);
        
        return {
            Ok: {
                report,
                ai_analysis: {
                    risk_level: analysis.risk_level,
                    recommendation: analysis.recommendation,
                    confidence_score: analysis.confidence_score,
                    points_awarded: analysis.points_awarded,
                    reasons: analysis.reasons
                }
            }
        };
    }
    
    analyzeReport(description) {
        const suspiciousWords = ['urgent', 'click now', 'verify account', 'suspended', 'prize', 'winner', 'lottery', 'limited time', 'act fast', 'congratulations'];
        let riskScore = 0;
        const lowerDesc = description.toLowerCase();
        const foundWords = [];
        
        suspiciousWords.forEach(word => {
            if (lowerDesc.includes(word)) {
                riskScore += 1;
                foundWords.push(word);
            }
        });
        
        if (riskScore >= 2) {
            return {
                risk_level: "HIGH",
                recommendation: "🚨 HIGH RISK - This appears to be a scam. Do not provide personal information.",
                confidence_score: 85,
                points_awarded: 30,
                reasons: [
                    "Multiple suspicious keywords detected",
                    "Pattern matches known scam techniques",
                    `Suspicious terms found: ${foundWords.join(', ')}`
                ]
            };
        } else if (riskScore === 1) {
            return {
                risk_level: "MEDIUM",
                recommendation: "⚠️ MEDIUM RISK - Exercise caution. Verify through official channels.",
                confidence_score: 60,
                points_awarded: 20,
                reasons: [
                    "Some suspicious language detected",
                    `Found suspicious term: ${foundWords[0]}`
                ]
            };
        } else {
            return {
                risk_level: "LOW",
                recommendation: "✅ LOW RISK - No obvious red flags detected.",
                confidence_score: 30,
                points_awarded: 10,
                reasons: [
                    "No obvious red flags identified",
                    "Content appears legitimate"
                ]
            };
        }
    }
    
    async getDashboardStats(userId) {
        await this.delay(500);
        
        // Mock stats based on role
        return {
            Ok: {
                total_reports: Math.floor(Math.random() * 20),
                points_earned: Math.floor(Math.random() * 500),
                high_risk_reports: Math.floor(Math.random() * 5),
                registered_numbers: Math.floor(Math.random() * 10),
                verification_checks: Math.floor(Math.random() * 100),
                reports_mentioning: Math.floor(Math.random() * 15),
                total_users: this.users.size + 250, // Add some base users
                total_phone_numbers: this.phoneNumbers.size
            }
        };
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.checkVeroApp = new CheckVeroApp();
});