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
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login to Check Vero</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-center mt-4 text-gray-600">
          Don't have an account? 
          <button onClick={() => setCurrentView('register')} className="text-green-600 hover:text-green-700 ml-1">
            Register here
          </button>
        </p>
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
        showMessage('Registration successful!');
      } catch (error) {
        showMessage('Registration failed: ' + error.message, 'error');
      }
      setLoading(false);
    };

    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Register for Check Vero</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="citizen">Citizen</option>
            <option value="business">Business/Government</option>
            <option value="admin">Admin</option>
          </select>
          {formData.role === 'business' && (
            <input
              type="text"
              placeholder="Company Name"
              value={formData.company_name}
              onChange={(e) => setFormData({...formData, company_name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="text-center mt-4 text-gray-600">
          Already have an account? 
          <button onClick={() => setCurrentView('login')} className="text-green-600 hover:text-green-700 ml-1">
            Login here
          </button>
        </p>
      </div>
    );
  };

  const VerificationCheck = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);

    const handleVerify = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const response = await apiCall('/api/verify-phone', {
          method: 'POST',
          body: JSON.stringify({ phone_number: phoneNumber })
        });
        setVerificationResult(response);
      } catch (error) {
        showMessage('Verification failed: ' + error.message, 'error');
      }
      setLoading(false);
    };

    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Verify Phone Number</h2>
        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="tel"
            placeholder="Enter phone number (e.g., +1234567890)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Verifying...' : 'Verify Number'}
          </button>
        </form>
        
        {verificationResult && (
          <div className={`mt-6 p-4 rounded-lg ${verificationResult.is_verified ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'} border`}>
            {verificationResult.is_verified ? (
              <div className="flex items-center">
                <span className="text-2xl mr-2">✅</span>
                <div>
                  <p className="font-semibold text-green-800">Verified Business</p>
                  <p className="text-green-700">{verificationResult.company_name}</p>
                  {verificationResult.description && (
                    <p className="text-sm text-green-600 mt-1">{verificationResult.description}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <span className="text-2xl mr-2">❌</span>
                <div>
                  <p className="font-semibold text-red-800">Not Verified</p>
                  <p className="text-red-700">This number is not registered with Check Vero</p>
                </div>
              </div>
            )}
          </div>
        )}
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
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Report Suspicious Communication</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={formData.report_type}
            onChange={(e) => setFormData({...formData, report_type: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="call">Suspicious Call</option>
            <option value="email">Suspicious Email</option>
            <option value="ai_chat">Suspicious AI Chat</option>
          </select>
          
          {formData.report_type === 'call' && (
            <input
              type="tel"
              placeholder="Phone number (optional)"
              value={formData.phone_number}
              onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          )}
          
          {formData.report_type === 'email' && (
            <input
              type="email"
              placeholder="Email address (optional)"
              value={formData.email_address}
              onChange={(e) => setFormData({...formData, email_address: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          )}
          
          <textarea
            placeholder="Describe the suspicious communication in detail..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Submitting Report...' : 'Submit Report'}
          </button>
        </form>
        
        {analysisResult && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">AI Analysis Result</h3>
            <div className={`p-3 rounded mb-3 ${
              analysisResult.risk_level === 'HIGH' ? 'bg-red-100 text-red-800' :
              analysisResult.risk_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              <p className="font-medium">Risk Level: {analysisResult.risk_level}</p>
              <p className="mt-1">{analysisResult.recommendation}</p>
            </div>
            <p className="text-sm text-gray-600">
              Confidence: {analysisResult.confidence_score}% | Points Earned: {analysisResult.points_awarded}
            </p>
            {analysisResult.reasons.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700">Analysis Reasons:</p>
                <ul className="text-sm text-gray-600 list-disc list-inside">
                  {analysisResult.reasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
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

    const StatCard = ({ title, value, icon }) => (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          </div>
          <div className="text-3xl text-green-600">{icon}</div>
        </div>
      </div>
    );

    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user.username}!
          </h1>
          <p className="text-gray-600">
            {user.role === 'citizen' ? 'Your fraud protection dashboard' :
             user.role === 'business' ? 'Your business verification dashboard' :
             'Admin control dashboard'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {user.role === 'citizen' && (
            <>
              <StatCard title="Total Reports" value={stats.total_reports || 0} icon="📊" />
              <StatCard title="Points Earned" value={stats.points_earned || 0} icon="🏆" />
              <StatCard title="High Risk Detected" value={stats.high_risk_reports || 0} icon="⚠️" />
            </>
          )}
          {user.role === 'business' && (
            <>
              <StatCard title="Registered Numbers" value={stats.registered_numbers || 0} icon="📞" />
              <StatCard title="Verification Checks" value={stats.verification_checks || 0} icon="✅" />
              <StatCard title="Reports Mentioning" value={stats.reports_mentioning || 0} icon="📋" />
            </>
          )}
          {user.role === 'admin' && (
            <>
              <StatCard title="Total Users" value={stats.total_users || 0} icon="👥" />
              <StatCard title="Total Reports" value={stats.total_reports || 0} icon="📊" />
              <StatCard title="Registered Numbers" value={stats.total_phone_numbers || 0} icon="📞" />
            </>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {user.role === 'citizen' ? 'Your Recent Reports' :
             user.role === 'business' ? 'Your Registered Numbers' :
             'Recent System Activity'}
          </h2>
          
          {user.role === 'citizen' && (
            <div className="space-y-4">
              {reports.slice(0, 5).map((report) => (
                <div key={report.report_id} className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">
                        {report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)} Report
                      </p>
                      <p className="text-sm text-gray-600">{report.description.substring(0, 100)}...</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      report.ai_analysis?.risk_level === 'HIGH' ? 'bg-red-100 text-red-800' :
                      report.ai_analysis?.risk_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {report.ai_analysis?.risk_level || 'PENDING'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {user.role === 'business' && (
            <div className="space-y-4">
              {phoneNumbers.slice(0, 5).map((phone) => (
                <div key={phone.phone_id} className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{phone.phone_number}</p>
                      <p className="text-sm text-gray-600">{phone.company_name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Registered: {new Date(phone.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      VERIFIED
                    </div>
                  </div>
                </div>
              ))}
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
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Register Phone Number</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="tel"
            placeholder="Phone number (e.g., +1234567890)"
            value={formData.phone_number}
            onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
          <input
            type="text"
            placeholder="Company name"
            value={formData.company_name}
            onChange={(e) => setFormData({...formData, company_name: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Registering...' : 'Register Number'}
          </button>
        </form>
      </div>
    );
  };

  const HomePage = () => (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          Protect Yourself from Digital Fraud
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Check Vero helps you identify legitimate calls from businesses and government agencies 
          while protecting you from scams, phishing attempts, and fraudulent communications.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setCurrentView('verify')}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-semibold text-lg"
          >
            Verify a Number
          </button>
          <button
            onClick={() => setCurrentView('register')}
            className="border border-green-600 text-green-600 px-8 py-3 rounded-lg hover:bg-green-50 font-semibold text-lg"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Instant Verification</h3>
          <p className="text-gray-600">
            Get real-time verification when receiving calls from registered businesses and government agencies.
          </p>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">AI-Powered Analysis</h3>
          <p className="text-gray-600">
            Our advanced AI analyzes suspicious communications and provides instant feedback on potential threats.
          </p>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Earn Rewards</h3>
          <p className="text-gray-600">
            Help protect the community by reporting fraud and earn points for valuable contributions.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">How Check Vero Works</h2>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
              <span className="text-green-600 font-bold text-lg">1</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Businesses Register Their Numbers</h3>
              <p className="text-gray-600">Legitimate businesses and government agencies register their phone numbers with our platform.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
              <span className="text-green-600 font-bold text-lg">2</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Real-Time Verification</h3>
              <p className="text-gray-600">When you receive a call, check the number instantly to see if it's verified.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
              <span className="text-green-600 font-bold text-lg">3</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Report Suspicious Activity</h3>
              <p className="text-gray-600">Report suspicious calls, emails, or AI chats to help protect others in the community.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Navigation = () => (
    <nav className="bg-white shadow-md mb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => setCurrentView('home')}
              className="text-2xl font-bold text-green-600"
            >
              Check Vero
            </button>
            <div className="hidden md:flex space-x-6">
              <button
                onClick={() => setCurrentView('verify')}
                className="text-gray-600 hover:text-green-600 font-medium"
              >
                Verify Number
              </button>
              {user && user.role === 'citizen' && (
                <button
                  onClick={() => setCurrentView('report')}
                  className="text-gray-600 hover:text-green-600 font-medium"
                >
                  Report Fraud
                </button>
              )}
              {user && user.role === 'business' && (
                <button
                  onClick={() => setCurrentView('register-phone')}
                  className="text-gray-600 hover:text-green-600 font-medium"
                >
                  Register Number
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="text-gray-600 hover:text-green-600 font-medium"
                >
                  Dashboard
                </button>
                <span className="text-gray-600">Welcome, {user.username}</span>
                <button
                  onClick={logout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCurrentView('login')}
                  className="text-gray-600 hover:text-green-600 font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => setCurrentView('register')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {message && (
        <div className={`max-w-6xl mx-auto mb-4 p-4 rounded-lg ${
          message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message.text}
        </div>
      )}
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {renderCurrentView()}
      </div>
    </div>
  );
}

export default App;