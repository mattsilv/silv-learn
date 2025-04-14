import React from 'react';
import {
  Dialog, 
  DialogTitle, 
  DialogBody, 
  DialogActions 
} from '../catalyst/dialog';
import { Button } from '../catalyst/button';
import { Text } from '../catalyst/text';
import { FaGoogle } from 'react-icons/fa6';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  
  const handleGoogleLogin = () => {
    const loginUrl = import.meta.env.VITE_WORKER_LOGIN_URL;
    if (loginUrl) {
      window.location.href = loginUrl;
    } else {
      console.error('VITE_WORKER_LOGIN_URL is not defined in .env.local');
      // Optionally, show an error message within the modal
    }
    onClose(); // Close modal after initiating redirect (optional)
  };

  return (
    <Dialog open={isOpen} onClose={onClose} size="sm">
      <div className="relative p-6 sm:p-8">
        <DialogTitle>Login / Sign Up</DialogTitle>
        <DialogBody>
          <Text className="mb-6">
            Choose your preferred method to continue.
          </Text>
          <Button 
            color="light"
            onClick={handleGoogleLogin} 
            className="w-full justify-center"
          >
            <FaGoogle className="mr-2 size-4" />
            Continue with Google
          </Button>
          {/* Add other login method buttons here later */}
        </DialogBody>
        <DialogActions>
          <Button plain onClick={onClose}>Cancel</Button>
        </DialogActions>
      </div>
    </Dialog>
  );
}; 