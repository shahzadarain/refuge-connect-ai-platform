
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
import { User } from '@/utils/adminApi';

interface UserActionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  action: 'activate' | 'deactivate' | null;
  onConfirm: (userId: string) => void;
}

const UserActionsDialog: React.FC<UserActionsDialogProps> = ({
  isOpen,
  onClose,
  user,
  action,
  onConfirm,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      await onConfirm(user.id);
      onClose();
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

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            variant={action === 'deactivate' ? 'destructive' : 'default'}
          >
            {isLoading ? 'Processing...' : 
             action === 'activate' ? 'Activate' : 'Deactivate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserActionsDialog;
