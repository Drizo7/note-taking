import React, { useState } from 'react';
import { Button, Input } from '../components/form';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios'; // Make sure to import axios

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useParams(); // Get the token from the URL
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault(); // Prevent form from reloading the page

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      console.warn('Passwords do not match'); // Log a warning for this specific case
      return;
    }

    setError(null); // Clear previous errors
    setLoading(true);
    try {
      console.log('Submitting password reset request...');
      const response = await axios.post(`http://localhost:5000/auth/reset-password/${token}`, { newPassword: password });

      if (response.status === 200) {
        console.log('Password reset successfully');
        navigate('/');
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (err) {
      console.error("Error during password reset:", err); // Log full error for debugging
      setError('An error occurred during password reset. Please try again later.');
      console.log("Error details:", err.response ? err.response.data : err.message); // Additional logging if available
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2 text-black">Reset Your Password</h1>
      <h3 className="text-md font-normal mb-4 text-black">
        Please enter a new password below
      </h3>

      {error && <div className="text-red-500 mb-4">{error}</div>} {/* Display the error message */}

      <form onSubmit={handleResetPasswordSubmit}>
        <div className="mb-4">
          <label className="text-sm text-black font-medium mb-1">New Password</label>
          <Input
            name="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Enter your new password"
          />
        </div>
        <div className="mb-4">
          <label className="text-sm text-black font-medium mb-1">Confirm Password</label>
          <Input
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            placeholder="Confirm your new password"
          />
        </div>

        <div className="mt-4">
          <Button label="Reset Password" onClick={handleResetPasswordSubmit} loading={loading} />
        </div>
      </form>

      <div className="mt-4 text-center text-sm text-blue-500 cursor-pointer">
        <a href="/">Back to Login</a>
      </div>
    </div>
  );
};

export default ResetPassword;
