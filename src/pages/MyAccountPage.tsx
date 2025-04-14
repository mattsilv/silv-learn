import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Heading } from '../components/catalyst/heading';
import { Text } from '../components/catalyst/text';
import { Button } from '../components/catalyst/button';

const MyAccountPage: React.FC = () => {
  // Get user and isLoading from context
  const { token, user, isLoading, logout } = useAuth();

  // If not logged in, redirect to home
  if (!token && !isLoading) { // Only redirect if not loading and no token
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="max-w-xl mx-auto">
      <Heading level={2} className="mb-6">My Account</Heading>
      
      <div className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 min-h-[100px]">
        {isLoading ? (
          <Text>Loading user info...</Text>
        ) : user ? (
          <>
            {/* Display user name or email */}
            <Text className="font-medium mb-2">Welcome{user.name ? `, ${user.name}` : '!'}</Text>
            <Text className="text-sm">Email: {user.email}</Text>
            <Text className="text-sm">User ID: {user.id}</Text>
          </>
        ) : (
          <Text className="text-red-600">Could not load user information.</Text>
        )}
      </div>
      
      <Button color="red" onClick={handleLogout} className="w-full sm:w-auto">
        Logout
      </Button>
    </div>
  );
};

export default MyAccountPage; 