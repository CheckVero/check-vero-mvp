import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || 'https://b175beef-7ded-4a3d-8fd1-e5ba7a9ba148.preview.emergentagent.com';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const apiCall = async (endpoint, options = {}) => {
    console.log('Making API call to:', `${API_URL}${endpoint}`);
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error:', errorData);
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  const showMessage = (msg, type = 'success') => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(''), 5000);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentView('home');
    showMessage('Logged out successfully!');
  };

  const LoginForm = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const response = await apiCall('/api/login', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('user', JSON.stringify({
          user_id: response.user_id,
          username: formData.username,
          role: response.role
        }));
        
        setUser({
          user_id: response.user_id,
          username: formData.username,
          role: response.role
        });
        setCurrentView('dashboard');
        showMessage('Login successful!');
      } catch (error) {
        showMessage('Login failed: ' + error.message, 'error');
      }
      setLoading(false);
    };

    return (
      <div className="container">
        <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div className="logo-container" style={{ justifyContent: 'center', marginBottom: '32px' }}>
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '40px', height: '40px', marginRight: '12px' }}>
              <path d="M16 2L25 6V14C25 21 20 26 16 28C12 26 7 21 7 14V6L16 2Z" fill="#00C853"/>
              <circle cx="16" cy="16" r="8" fill="#ffffff" opacity="0.9"/>
              <path d="M13 16L15 18L19 14" stroke="#00C853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="logo-text">Check Vero</div>
          </div>
          <h2 className="dashboard-title" style={{ fontSize: '24px', textAlign: 'center', marginBottom: '32px' }}>
            Welcome Back
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="form-input"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--gray-600)' }}>
            Don't have an account? 
            <button 
              onClick={() => setCurrentView('register')} 
              style={{ color: 'var(--primary-green)', marginLeft: '4px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    );
  };

  const RegisterForm = () => {
    const [formData, setFormData] = useState({
      username: '',
      email: '',
      password: '',
      role: 'citizen',
      company_name: ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const response = await apiCall('/api/register', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('user', JSON.stringify({
          user_id: response.user_id,
          username: formData.username,
          role: response.role
        }));
        
        setUser({
          user_id: response.user_id,
          username: formData.username,
          role: response.role
        });
        setCurrentView('dashboard');
        showMessage('Account created successfully!');
      } catch (error) {
        showMessage('Registration failed: ' + error.message, 'error');
      }
      setLoading(false);
    };

    return (
      <div className="container">
        <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div className="logo-container" style={{ justifyContent: 'center', marginBottom: '32px' }}>
            <div className="logo-icon">✓</div>
            <div className="logo-text">Check Vero</div>
          </div>
          <h2 className="dashboard-title" style={{ fontSize: '24px', textAlign: 'center', marginBottom: '32px' }}>
            Create Your Account
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Account Type</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="form-select"
              >
                <option value="citizen">Citizen</option>
                <option value="business">Business/Government</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {formData.role === 'business' && (
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--gray-600)' }}>
            Already have an account? 
            <button 
              onClick={() => setCurrentView('login')} 
              style={{ color: 'var(--primary-green)', marginLeft: '4px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    );
  };

  const VerificationCheck = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);

    const handleVerify = async (e) => {
      e.preventDefault();
      if (!phoneNumber.trim()) {
        showMessage('Please enter a phone number', 'error');
        return;
      }

      setIsVerifying(true);
      setVerificationResult(null); // Clear previous result
      
      try {
        console.log('Verifying phone number:', phoneNumber);
        const response = await apiCall('/api/verify-phone', {
          method: 'POST',
          body: JSON.stringify({ phone_number: phoneNumber.trim() })
        });
        console.log('Verification response:', response);
        
        // Force state update with a small delay to ensure proper rendering
        setTimeout(() => {
          setVerificationResult(response);
          console.log('State updated with verification result:', response);
        }, 100);
        
      } catch (error) {
        console.error('Verification error:', error);
        showMessage('Verification failed: ' + error.message, 'error');
        setTimeout(() => {
          setVerificationResult({
            is_verified: false,
            message: '❌ Unable to verify number. Please try again.',
            error: true
          });
        }, 100);
      }
      setIsVerifying(false);
    };

    const handleSampleClick = (sampleNumber) => {
      console.log('Clicking sample number:', sampleNumber);
      setPhoneNumber(sampleNumber);
      setVerificationResult(null); // Clear previous result when selecting new number
    };

    const sampleNumbers = [
      { number: '+31612345678', company: 'Acme Bank' },
      { number: '+61298765432', company: 'Gov Australia' },
      { number: '+14155552020', company: 'TechCorp Support' },
      { number: '+442071234567', company: 'British Telecom' }
    ];

    return (
      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '16px' }}>
            Verify Phone Number
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--gray-600)', marginBottom: '32px' }}>
            Check if a phone number is verified by a legitimate business or government agency
          </p>
          
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                placeholder="Enter phone number (e.g., +1234567890)"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setVerificationResult(null); // Clear result when typing
                }}
                className="form-input"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isVerifying}
              className="btn-primary"
            >
              {isVerifying ? (
                <>
                  <span className="loading-spinner"></span>
                  Verifying...
                </>
              ) : (
                'Verify Number'
              )}
            </button>
          </form>
          
          {/* Sample Numbers for Testing */}
          <div style={{ marginTop: '24px', padding: '16px', background: 'var(--gray-50)', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 12px 0', color: 'var(--gray-700)', fontSize: '14px' }}>
              🧪 Sample Numbers for Testing:
            </h4>
            <div style={{ display: 'grid', gap: '8px' }}>
              {sampleNumbers.map((sample) => (
                <button
                  key={sample.number}
                  type="button"
                  onClick={() => handleSampleClick(sample.number)}
                  style={{
                    background: 'white',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: 'var(--gray-700)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'var(--green-50)'}
                  onMouseLeave={(e) => e.target.style.background = 'white'}
                >
                  <strong>{sample.number}</strong> - {sample.company}
                </button>
              ))}
            </div>
          </div>
          
          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && verificationResult && (
            <div style={{ marginTop: '16px', padding: '12px', background: '#f0f0f0', borderRadius: '4px', fontSize: '12px' }}>
              Debug: {JSON.stringify(verificationResult, null, 2)}
            </div>
          )}
          
          {/* Verification Result */}
          {verificationResult && (
            <div 
              style={{ 
                marginTop: '24px',
                padding: '20px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                border: verificationResult.is_verified ? '2px solid var(--primary-green)' : '2px solid #f87171',
                background: verificationResult.is_verified ? 'var(--green-50)' : '#fef2f2',
                color: verificationResult.is_verified ? 'var(--green-800)' : '#dc2626'
              }}
            >
              <div style={{ fontSize: '24px', flexShrink: 0 }}>
                {verificationResult.is_verified ? '✅' : '❌'}
              </div>
              <div style={{ flex: 1 }}>
                {verificationResult.is_verified ? (
                  <div>
                    <p style={{ fontWeight: '700', margin: '0 0 8px 0', fontSize: '18px' }}>
                      Verified by Check Vero
                    </p>
                    <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
                      {verificationResult.company_name}
                    </p>
                    {verificationResult.description && (
                      <p style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: '0.9' }}>
                        {verificationResult.description}
                      </p>
                    )}
                    <p style={{ margin: '0', fontSize: '12px', opacity: '0.8' }}>
                      Verified since: {new Date(verificationResult.verified_since).toLocaleDateString()}
                      {verificationResult.verification_count && ` • Verified ${verificationResult.verification_count} times`}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontWeight: '700', margin: '0 0 8px 0', fontSize: '18px' }}>
                      Not Verified
                    </p>
                    <p style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                      This number is not registered with Check Vero
                    </p>
                    <p style={{ margin: '0', fontSize: '14px', opacity: '0.9' }}>
                      {verificationResult.warning || 'Proceed with caution. This may be a legitimate business not yet registered, or a potential scammer.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const FileUpload = ({ onFileSelect, accept = "image/*,audio/*", maxSize = 5 * 1024 * 1024 }) => {
    const [dragOver, setDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleDragOver = (e) => {
      e.preventDefault();
      setDragOver(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      setDragOver(false);
    };

    const handleDrop = (e) => {
      e.preventDefault();
      setDragOver(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    };

    const handleFileSelect = (file) => {
      if (file.size > maxSize) {
        showMessage('File size too large. Maximum size is 5MB.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target.result;
        setSelectedFile(file);
        onFileSelect(base64Data);
      };
      reader.readAsDataURL(file);
    };

    const handleFileInputChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        handleFileSelect(file);
      }
    };

    return (
      <div
        className={`file-upload-area ${dragOver ? 'dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <input
          id="file-input"
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
        <div className="file-upload-icon">📎</div>
        <div className="file-upload-text">
          {selectedFile ? selectedFile.name : 'Click or drag to upload screenshot or audio'}
        </div>
        <div className="file-upload-hint">
          Supports images and audio files (max 5MB)
        </div>
      </div>
    );
  };

  const ReportForm = () => {
    const [formData, setFormData] = useState({
      report_type: 'call',
      phone_number: '',
      email_address: '',
      description: '',
      screenshot: ''
    });
    const [analysisResult, setAnalysisResult] = useState(null);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const response = await apiCall('/api/reports/submit', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        setAnalysisResult(response.ai_analysis);
        showMessage('Report submitted successfully!');
        setFormData({
          report_type: 'call',
          phone_number: '',
          email_address: '',
          description: '',
          screenshot: ''
        });
      } catch (error) {
        showMessage('Report submission failed: ' + error.message, 'error');
      }
      setLoading(false);
    };

    return (
      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '16px' }}>
            Report Suspicious Communication
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--gray-600)', marginBottom: '32px' }}>
            Help protect others by reporting suspicious calls, emails, or AI messages
          </p>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="form-group">
              <label className="form-label">Type of Communication</label>
              <select
                value={formData.report_type}
                onChange={(e) => setFormData({...formData, report_type: e.target.value})}
                className="form-select"
              >
                <option value="call">Suspicious Call</option>
                <option value="email">Suspicious Email</option>
                <option value="ai_chat">Suspicious AI Chat</option>
              </select>
            </div>
            
            {formData.report_type === 'call' && (
              <div className="form-group">
                <label className="form-label">Phone Number (optional)</label>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  className="form-input"
                />
              </div>
            )}
            
            {formData.report_type === 'email' && (
              <div className="form-group">
                <label className="form-label">Email Address (optional)</label>
                <input
                  type="email"
                  placeholder="Email address"
                  value={formData.email_address}
                  onChange={(e) => setFormData({...formData, email_address: e.target.value})}
                  className="form-input"
                />
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                placeholder="Describe the suspicious communication in detail..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="form-input"
                rows="4"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Upload Evidence (optional)</label>
              <FileUpload
                onFileSelect={(base64Data) => setFormData({...formData, screenshot: base64Data})}
                accept="image/*,audio/*"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Analyzing Report...
                </>
              ) : (
                'Submit Report'
              )}
            </button>
          </form>
          
          {analysisResult && (
            <div className="card-compact" style={{ marginTop: '24px', background: 'var(--gray-50)' }}>
              <h3 style={{ color: 'var(--gray-800)', marginBottom: '16px', fontSize: '18px' }}>
                🤖 AI Analysis Result
              </h3>
              <div className={`risk-${analysisResult.risk_level.toLowerCase()}`} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '18px' }}>
                    {analysisResult.risk_level === 'HIGH' ? '🚨' : 
                     analysisResult.risk_level === 'MEDIUM' ? '⚠️' : '✅'}
                  </span>
                  <span style={{ fontWeight: '600' }}>Risk Level: {analysisResult.risk_level}</span>
                </div>
                <p style={{ margin: '0', fontSize: '16px' }}>{analysisResult.recommendation}</p>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '14px', color: 'var(--gray-600)' }}>
                  Confidence: {analysisResult.confidence_score}%
                </span>
                <div className="status-badge status-verified">
                  +{analysisResult.points_awarded} Points Earned
                </div>
              </div>
              
              {analysisResult.reasons && analysisResult.reasons.length > 0 && (
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)', marginBottom: '8px' }}>
                    Analysis Reasons:
                  </p>
                  <ul style={{ fontSize: '14px', color: 'var(--gray-600)', paddingLeft: '20px', margin: '0' }}>
                    {analysisResult.reasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const Dashboard = () => {
    const [stats, setStats] = useState({});
    const [reports, setReports] = useState([]);
    const [phoneNumbers, setPhoneNumbers] = useState([]);

    useEffect(() => {
      const fetchDashboardData = async () => {
        try {
          const statsResponse = await apiCall('/api/stats/dashboard');
          setStats(statsResponse);
          
          if (user.role === 'citizen') {
            const reportsResponse = await apiCall('/api/reports/my-reports');
            setReports(reportsResponse);
          } else if (user.role === 'business') {
            const phoneResponse = await apiCall('/api/phone-numbers/my-numbers');
            setPhoneNumbers(phoneResponse);
          } else if (user.role === 'admin') {
            const allReportsResponse = await apiCall('/api/reports/all');
            setReports(allReportsResponse);
          }
        } catch (error) {
          showMessage('Failed to load dashboard data', 'error');
        }
      };

      fetchDashboardData();
    }, [user.role]);

    const StatCard = ({ title, value, icon, color = 'var(--primary-green)' }) => (
      <div className="stat-card">
        <div className="stat-icon">{icon}</div>
        <div className="stat-value" style={{ color }}>{value}</div>
        <div className="stat-label">{title}</div>
      </div>
    );

    return (
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            Welcome back, {user.username}!
          </h1>
          <p className="dashboard-subtitle">
            {user.role === 'citizen' ? 'Your fraud protection dashboard' :
             user.role === 'business' ? 'Your business verification dashboard' :
             'Admin control dashboard'}
          </p>
        </div>

        <div className="stat-grid">
          {user.role === 'citizen' && (
            <>
              <StatCard title="Reports Submitted" value={stats.total_reports || 0} icon="📊" />
              <StatCard title="Points Earned" value={stats.points_earned || 0} icon="🏆" />
              <StatCard title="High Risk Detected" value={stats.high_risk_reports || 0} icon="🚨" />
            </>
          )}
          {user.role === 'business' && (
            <>
              <StatCard title="Registered Numbers" value={stats.registered_numbers || 0} icon="📞" />
              <StatCard title="Verification Requests" value={stats.verification_checks || 0} icon="✅" />
              <StatCard title="Related Reports" value={stats.reports_mentioning || 0} icon="📋" />
            </>
          )}
          {user.role === 'admin' && (
            <>
              <StatCard title="Total Users" value={stats.total_users || 0} icon="👥" />
              <StatCard title="Total Reports" value={stats.total_reports || 0} icon="📊" />
              <StatCard title="Verified Numbers" value={stats.total_phone_numbers || 0} icon="📞" />
            </>
          )}
        </div>

        <div className="card">
          <h2 className="section-title" style={{ marginBottom: '24px' }}>
            {user.role === 'citizen' ? 'Your Recent Reports' :
             user.role === 'business' ? 'Your Registered Numbers' :
             'Recent System Activity'}
          </h2>
          
          {user.role === 'citizen' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reports.slice(0, 5).map((report) => (
                <div key={report.report_id} style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '8px', borderLeft: '4px solid var(--primary-green)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: '600', color: 'var(--gray-800)', margin: '0 0 4px 0' }}>
                        {report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)} Report
                      </p>
                      <p style={{ color: 'var(--gray-600)', margin: '0 0 8px 0', fontSize: '14px' }}>
                        {report.description.substring(0, 100)}...
                      </p>
                      <p style={{ color: 'var(--gray-500)', margin: '0', fontSize: '12px' }}>
                        {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`status-badge ${
                      report.ai_analysis?.risk_level === 'HIGH' ? 'status-rejected' :
                      report.ai_analysis?.risk_level === 'MEDIUM' ? 'status-pending' :
                      'status-verified'
                    }`}>
                      {report.ai_analysis?.risk_level || 'PENDING'}
                    </div>
                  </div>
                </div>
              ))}
              {reports.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--gray-600)', padding: '40px' }}>
                  No reports submitted yet. Start by reporting suspicious communications!
                </p>
              )}
            </div>
          )}
          
          {user.role === 'business' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {phoneNumbers.slice(0, 5).map((phone) => (
                <div key={phone.phone_id} style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '8px', borderLeft: '4px solid var(--primary-green)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: '600', color: 'var(--gray-800)', margin: '0 0 4px 0' }}>
                        {phone.phone_number}
                      </p>
                      <p style={{ color: 'var(--gray-600)', margin: '0 0 8px 0', fontSize: '14px' }}>
                        {phone.company_name}
                      </p>
                      <p style={{ color: 'var(--gray-500)', margin: '0', fontSize: '12px' }}>
                        Registered: {new Date(phone.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="status-badge status-verified">
                      VERIFIED
                    </div>
                  </div>
                </div>
              ))}
              {phoneNumbers.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--gray-600)', padding: '40px' }}>
                  No phone numbers registered yet. Start by registering your business numbers!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const PhoneRegistration = () => {
    const [formData, setFormData] = useState({
      phone_number: '',
      company_name: '',
      description: ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        await apiCall('/api/phone-numbers/register', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        showMessage('Phone number registered successfully!');
        setFormData({ phone_number: '', company_name: '', description: '' });
      } catch (error) {
        showMessage('Registration failed: ' + error.message, 'error');
      }
      setLoading(false);
    };

    return (
      <div className="container">
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '16px' }}>
            Register Phone Number
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--gray-600)', marginBottom: '32px' }}>
            Register your business phone number to receive the verified checkmark
          </p>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                placeholder="Enter phone number (e.g., +1234567890)"
                value={formData.phone_number}
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input
                type="text"
                placeholder="Your company name"
                value={formData.company_name}
                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <textarea
                placeholder="Brief description of this phone line (e.g., Customer Service, Sales)"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="form-input"
                rows="3"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Registering...
                </>
              ) : (
                'Register Phone Number'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  };

  const HomePage = () => (
    <div>
      <div className="hero-section">
        <div className="hero-content">
          <div className="logo-container" style={{ justifyContent: 'center', marginBottom: '40px' }}>
            <div className="logo-icon" style={{ fontSize: '32px', width: '64px', height: '64px' }}>✓</div>
            <div className="logo-text" style={{ fontSize: '32px' }}>Check Vero</div>
          </div>
          <h1 className="hero-title">
            Verify what reaches you — voice, email & AI
          </h1>
          <p className="hero-subtitle">
            Check Vero helps you instantly verify legitimate communications from businesses and 
            government agencies, while protecting you from scams, phishing, and fraudulent AI interactions.
          </p>
          <div className="hero-buttons">
            <button
              onClick={() => setCurrentView('verify')}
              className="btn-primary"
            >
              Verify a Number
            </button>
            <button
              onClick={() => setCurrentView('register')}
              className="btn-secondary"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3 className="feature-title">Instant Verification</h3>
            <p className="feature-description">
              Get real-time verification with green checkmarks when receiving communications from 
              registered businesses and government agencies.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3 className="feature-title">AI-Powered Analysis</h3>
            <p className="feature-description">
              Our advanced AI instantly analyzes suspicious communications and provides detailed 
              feedback on potential fraud patterns and risks.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3 className="feature-title">Earn Rewards</h3>
            <p className="feature-description">
              Help protect the community by reporting fraud and earn points for valuable 
              contributions to our security database.
            </p>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '32px' }}>
            How Check Vero Works
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ background: 'var(--green-100)', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-green)', fontWeight: '700', fontSize: '20px', flexShrink: 0 }}>
                1
              </div>
              <div>
                <h3 style={{ color: 'var(--gray-800)', marginBottom: '8px' }}>Businesses Register</h3>
                <p style={{ color: 'var(--gray-600)', margin: '0' }}>
                  Legitimate businesses and government agencies register their phone numbers, email domains, and AI systems.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ background: 'var(--green-100)', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-green)', fontWeight: '700', fontSize: '20px', flexShrink: 0 }}>
                2
              </div>
              <div>
                <h3 style={{ color: 'var(--gray-800)', marginBottom: '8px' }}>Real-Time Verification</h3>
                <p style={{ color: 'var(--gray-600)', margin: '0' }}>
                  When you receive a call, email, or chat, instantly check if it's verified with our green checkmark system.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ background: 'var(--green-100)', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-green)', fontWeight: '700', fontSize: '20px', flexShrink: 0 }}>
                3
              </div>
              <div>
                <h3 style={{ color: 'var(--gray-800)', marginBottom: '8px' }}>Report & Protect</h3>
                <p style={{ color: 'var(--gray-600)', margin: '0' }}>
                  Report suspicious communications to help protect others. Our AI analyzes patterns to identify new fraud attempts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Navigation = () => (
    <div className="header">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            <button
              onClick={() => setCurrentView('home')}
              className="logo-container"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-icon" style={{ width: '32px', height: '32px', marginRight: '12px' }}>
                <path d="M16 2L25 6V14C25 21 20 26 16 28C12 26 7 21 7 14V6L16 2Z" fill="#00C853"/>
                <circle cx="16" cy="16" r="8" fill="#ffffff" opacity="0.9"/>
                <path d="M13 16L15 18L19 14" stroke="#00C853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="logo-text">Check Vero</div>
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setCurrentView('verify')}
                className="nav-link"
              >
                Verify
              </button>
              {user && user.role === 'citizen' && (
                <button
                  onClick={() => setCurrentView('report')}
                  className="nav-link"
                >
                  Report
                </button>
              )}
              {user && user.role === 'business' && (
                <button
                  onClick={() => setCurrentView('register-phone')}
                  className="nav-link"
                >
                  Register
                </button>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {user ? (
              <>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="nav-link"
                >
                  Dashboard
                </button>
                <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
                  {user.username}
                </span>
                <button
                  onClick={logout}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCurrentView('login')}
                  className="nav-link"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setCurrentView('register')}
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage />;
      case 'login':
        return <LoginForm />;
      case 'register':
        return <RegisterForm />;
      case 'verify':
        return <VerificationCheck />;
      case 'report':
        return user ? <ReportForm /> : <LoginForm />;
      case 'register-phone':
        return user && user.role === 'business' ? <PhoneRegistration /> : <LoginForm />;
      case 'dashboard':
        return user ? <Dashboard /> : <LoginForm />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="App">
      <Navigation />
      
      {message && (
        <div className="container" style={{ marginTop: '20px' }}>
          <div className={`${message.type === 'error' ? 'message-error' : 'message-success'}`}>
            <div className="message-icon">
              {message.type === 'error' ? '❌' : '✅'}
            </div>
            <div>{message.text}</div>
          </div>
        </div>
      )}
      
      <div style={{ minHeight: 'calc(100vh - 80px)' }}>
        {renderCurrentView()}
      </div>
    </div>
  );
}

export default App;