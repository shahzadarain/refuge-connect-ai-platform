
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/useSession';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_CONFIG, buildApiUrl } from '.../config/api'; // ✅ fixed import

import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { sendUserInvitation } from '@/utils/userInvitationApi';

interface CreateUserForm {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
}

interface CreateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const { toast } = useToast();
  const { currentUser } = useSession();
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<CreateUserForm>({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

  const handleClose = () => {
    setForm({ email: '', first_name: '', last_name: '', phone: '' });
    onClose();
  };

  const generateTemporaryPassword = (): string => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const createUser = async () => {
    if (!form.email || !form.first_name) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (email, first name)",
        variant: "destructive",
      });
      return;
    }

    if (!currentUser?.company_id) {
      toast({
        title: "Error",
        description: "Company information not found. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    const temporaryPassword = generateTemporaryPassword();
    
    try {
      const token = localStorage.getItem('access_token');
      console.log('Creating user with data:', form);
      
      const requestBody: {
        email: string;
        first_name: string;
        last_name: string;
        password: string;
        role: string;
        phone?: string;
      } = {
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        password: temporaryPassword,
        role: 'company_user'
      };

      // Only include phone if it's not empty
      if (form.phone.trim()) {
        requestBody.phone = form.phone;
      }

const response = await fetch(buildApiUrl('/company/users'), 
                             {method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Create user response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('User created successfully:', responseData);

        // Send invitation email after successful user creation
        try {
          await sendUserInvitation({
            email: form.email,
            name: `${form.first_name} ${form.last_name}`.trim(),
            temporary_password: temporaryPassword,
            company_id: currentUser.company_id,
            company_name: 'Your Company', // You might want to get this from user context
            invited_by: `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || currentUser.email
          });

          toast({
            title: "Success",
            description: `User created successfully! An invitation email has been sent to ${form.email} with login instructions.`,
          });
        } catch (emailError) {
          console.error('Failed to send invitation email:', emailError);
          toast({
            title: "User Created",
            description: "User created successfully, but failed to send invitation email. Please share the login details manually.",
            variant: "destructive",
          });
        }

        handleClose();
        onUserCreated();
      } else {
        const errorData = await response.json();
        console.error('Failed to create user:', response.status, errorData);
        
        // Special handling for company_id related errors
        if (response.status === 400 && errorData.detail && 
            (errorData.detail.includes('No company associated') || 
             errorData.detail.includes('company_id'))) {
          toast({
            title: "Session Error",
            description: "Your session is missing company information. Please log out and log in again to refresh your permissions.",
            variant: "destructive",
          });
          
          // Optionally auto-logout after a delay
          setTimeout(() => {
            const shouldLogout = confirm('Would you like to log out now to refresh your session?');
            if (shouldLogout) {
              localStorage.removeItem('access_token');
              localStorage.removeItem('current_log_user');
              window.location.href = '/';
            }
          }, 3000);
          
        } else if (response.status === 409) {
          toast({
            title: "Error",
            description: "Email already exists",
            variant: "destructive",
          });
        } else if (response.status === 403) {
          toast({
            title: "Error",
            description: "Company admin privileges required",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: errorData.detail || "Failed to create user. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "An error occurred while creating the user",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Company User</DialogTitle>
          <DialogDescription>
            Add a new user to your company. They will receive an email invitation with login instructions and can set their own password.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@company.com"
              value={form.email}
              onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name *</Label>
            <Input
              id="first_name"
              placeholder="John"
              value={form.first_name}
              onChange={(e) => setForm(prev => ({ ...prev, first_name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              placeholder="Doe"
              value={form.last_name}
              onChange={(e) => setForm(prev => ({ ...prev, last_name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="+962791234567"
              value={form.phone}
              onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                <span className="text-white text-xs">📧</span>
              </div>
              <div>
                <p className="text-small-mobile font-medium text-blue-800 mb-1">
                  Email Invitation
                </p>
                <p className="text-xs text-blue-700">
                  The user will receive an email with a temporary password and instructions to activate their account. They can change their password after logging in.
                </p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={createUser}
            disabled={isCreating}
            className="btn-primary"
          >
            {isCreating ? 'Creating & Sending...' : 'Create User & Send Invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
