import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, Mail, GraduationCap, ArrowRight } from 'lucide-react'; // Import ArrowRight

const API_BASE_URL = 'https://wegrow-backend-w4ey.onrender.com/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  // const [selectedRole, setSelectedRole] = useState<'admin' | 'user'>('user'); // Removed selectedRole
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (isRegistering) {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, email, password, id: Date.now().toString() }), // Role is now handled by backend
        });

        if (response.ok) {
          alert('Registration successful! Please log in.');
          setIsRegistering(false);
          setUsername('');
          setEmail('');
          setPassword('');
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Registration failed');
        }
      } catch (err) {
        console.error('Registration error:', err);
        setError('An error occurred during registration.');
      } finally {
        setIsLoading(false);
      }
    } else {
      const success = await login(username, password);
      if (!success) {
        setError('Invalid username or password');
      }
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: 'admin' | 'user') => {
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('student1');
      setPassword('student123');
    }
    // setSelectedRole(role); // Removed setSelectedRole
    setIsRegistering(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">WEGROW</h1>
            <p className="text-gray-600">Your Journey to Academic Excellence</p>
          </div>

          <div className="mb-6 text-center">
            <p className="text-xl font-semibold text-gray-800 mb-2">
              {isRegistering ? 'Join Our Community!' : 'Welcome Back!'}
            </p>
            <p className="text-gray-600">
              {isRegistering 
                ? 'Register now to manage your tasks and exams.'
                : 'Sign in to continue your learning journey.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (isRegistering ? 'Registering...' : 'Signing in...') : (isRegistering ? 'Register' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4">
              {isRegistering ? (
                <>Already have an account? <button onClick={() => setIsRegistering(false)} className="font-medium text-blue-600 hover:underline">Sign In</button></>
              ) : (
                <>Don't have an account? <button onClick={() => setIsRegistering(true)} className="font-medium text-blue-600 hover:underline">Register</button></>
              )}
            </p>

            <p className="text-sm text-gray-600 text-center mb-4"></p>
            <div className="space-y-2">
              <button
                onClick={() => handleDemoLogin('admin')}
                className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
              >
                <div className="font-medium text-gray-900"></div>
                <div className="text-sm text-gray-600"></div>
              </button>
              <button
                onClick={() => handleDemoLogin('user')}
                className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
              >
                <div className="font-medium text-gray-900"></div>
                <div className="text-sm text-gray-600"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}