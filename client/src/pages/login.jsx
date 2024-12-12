import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios
import { Button, Input, GoogleButton } from '../components/form';

export function LoginPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login/Sign Up
  const [resetPassword, setResetPassword] = useState(false); // Toggle between Login and Reset Password
  const navigate = useNavigate();

  // Handle input changes
  const handleNameChange = (e) => setName(e.target.value);
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  // Base URL for the API
  const API_BASE_URL = 'http://localhost:5000';

  // Handle Login or Sign Up form submission
  const handleLoginSubmit = async () => {
    setLoading(true);
    const endpoint = isLogin ? '/login' : '/signup'; // Determine endpoint

    try {
      const data = isLogin ? { email, password } : { name, email };
      console.log(`Submitting ${isLogin ? 'Login' : 'Sign Up'} request...`);
      const response = await axios.post(`${API_BASE_URL}/auth${endpoint}`, data);
      console.log('Response:', response.data);

      const { token } = response.data;

        localStorage.setItem('token', token);

      if (response.status === 200) {
        console.log(`${isLogin ? 'Login' : 'Sign Up'} successful! Redirecting to dashboard.${token}`);

        navigate('/dashboard');
      }
    } catch (error) {
      alert(`Error during ${isLogin ? 'Login' : 'Sign Up'}:` + error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Login
  const handleGoogleLogin = () => {
    console.log('Redirecting to Google OAuth...');
    window.location.href = `${API_BASE_URL}/googleauth/proceed`;
  };

  // Handle Reset Password form submission
  const handleResetPasswordSubmit = async () => {
    setLoading(true);

    try {
      console.log('Submitting password reset request...');
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, { email });
      console.log('Password reset response:', response.data.message);
      setResetPassword(false); // Reset to login after password reset
    } catch (error) {
      alert('Error during password reset:' + error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle between Login and Sign Up forms
  const handleToggleForm = () => {
    setIsLogin(!isLogin);
    setShowPasswordField(false); // Reset password field visibility
  };

  // Show Forgot Password form
  const handleForgotPassword = () => {
    setResetPassword(true); // Switch to reset password view
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white text-black py-10">
      <div className="w-full max-w-xl bg-white p-6 rounded-lg">
        {resetPassword ? (
          // Reset Password Form
          <div>
            <h1 className="text-2xl font-semibold mb-2 text-black">Reset your password</h1>
            <h3 className="text-md font-normal mb-2 text-black">
              A password reset link will be sent to your email
            </h3>
            <Input
              name="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Email address"
            />
            <div className="mt-4">
              <Button label="Reset Password" onClick={handleResetPasswordSubmit} loading={loading} />
            </div>
            <div
              className="mt-4 text-center text-sm text-blue-500 cursor-pointer"
              onClick={() => setResetPassword(false)}
            >
              Back to Login
            </div>
          </div>
        ) : (
          // Login or Sign Up Form
          <div>
            <h1 className="text-2xl font-semibold mb-2 text-black">Welcome to the most loved Note-Taking App</h1>
            <h3 className="text-md font-normal mb-2 text-black">
              {isLogin ? 'Login and continue with your notes' : 'Sign up and start taking notes'}
            </h3>
            {!isLogin && (
              <Input
                name="name"
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="Name"
              />
            )}
            <Input
              name="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Email address"
            />
            {isLogin && (
              <Input
                name="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Password"
              />
            )}
            <div className="mt-4">
              <Button label={isLogin ? 'Login' : 'Sign Up'} onClick={handleLoginSubmit} loading={loading} />
            </div>
            <div className="mt-4 text-center text-sm text-gray-500">or</div>
            <div className="mt-4">
              <GoogleButton onClick={handleGoogleLogin} />
            </div>
            <div className="mt-4 text-center text-sm">
              <span className="text-black">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
              </span>
              <span className="text-blue-500 cursor-pointer" onClick={handleToggleForm}>
                {isLogin ? ' Sign up' : ' Login'}
              </span>
            </div>
            {isLogin && (
              <div
                className="mt-4 text-center text-sm text-blue-500 cursor-pointer"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
