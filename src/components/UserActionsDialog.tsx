
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@/utils/adminApi';

interface UserActionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  action: 'activate' | 'deactivate' | 'set-password' | null;
  onConfirm: (userId: string, password?: string) => void;
}

const UserActionsDialog: React.FC<UserActionsDialogProps> = ({
  isOpen,
  onClose,
  user,
  action,
  onConfirm,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;

    if (action === 'set-password') {
      if (!password || password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
    }

    setIsLoading(true);
    try {
      await onConfirm(user.id, password || undefined);
      onClose();
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error performing user action:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (action) {
      case 'activate':
        return 'Activate User';
      case 'deactivate':
        return 'Deactivate User';
      case 'set-password':
        return 'Set User Password';
      default:
        return '';
    }
  };

  const getDescription = () => {
    if (!user) return '';
    
    switch (action) {
      case 'activate':
        return `Are you sure you want to activate ${user.email}? This will allow them to access the system.`;
      case 'deactivate':
        return `Are you sure you want to deactivate ${user.email}? This will prevent them from accessing the system.`;
      case 'set-password':
        return `Set a new password for ${user.email}. The user will be able to log in with this password.`;
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        {action === 'set-password' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="mt-1"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            variant={action === 'deactivate' ? 'destructive' : 'default'}
          >
            {isLoading ? 'Processing...' : action === 'set-password' ? 'Set Password' : 
             action === 'activate' ? 'Activate' : 'Deactivate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserActionsDialog;
