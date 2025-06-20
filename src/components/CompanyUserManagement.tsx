
import React, { useState, useEffect } from 'react';
import { useSession } from '@/hooks/useSession';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, UserPlus, Trash2, Power, PowerOff } from 'lucide-react';

interface CompanyUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: 'company_admin' | 'company_user';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

interface CreateUserForm {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  phone: string;
}

const CompanyUserManagement: React.FC = () => {
  const { currentUser } = useSession();
  const { toast } = useToast();
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [createForm, setCreateForm] = useState<CreateUserForm>({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    phone: '',
  });

  useEffect(() => {
    fetchCompanyUsers();
  }, []);

  const fetchCompanyUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      console.log('Fetching company users...');
      
      const response = await fetch('https://ab93e9536acd.ngrok.app/api/company/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      console.log('Company users API response status:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('Company users data received:', userData);
        setUsers(Array.isArray(userData) ? userData : []);
      } else {
        const errorData = await response.text();
        console.error('Failed to fetch company users:', response.status, errorData);
        toast({
          title: "Error",
          description: "Failed to load company users",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching company users:', error);
      toast({
        title: "Error",
        description: "An error occurred while loading users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createUser = async () => {
    if (!createForm.email || !createForm.first_name || !createForm.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (email, first name, password)",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingUser(true);
    try {
      const token = localStorage.getItem('access_token');
      console.log('Creating user with data:', createForm);
      
      const requestBody = {
        email: createForm.email,
        first_name: createForm.first_name,
        last_name: createForm.last_name,
        password: createForm.password,
        role: 'company_user'
      };

      // Only include phone if it's not empty
      if (createForm.phone.trim()) {
        requestBody.phone = createForm.phone;
      }

      const response = await fetch('https://ab93e9536acd.ngrok.app/api/company/users', {
        method: 'POST',
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
        toast({
          title: "Success",
          description: "Company user created successfully",
        });
        setIsCreateDialogOpen(false);
        setCreateForm({ email: '', first_name: '', last_name: '', password: '', phone: '' });
        fetchCompanyUsers();
      } else {
        const errorData = await response.json();
        console.error('Failed to create user:', response.status, errorData);
        
        if (response.status === 409) {
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
      setIsCreatingUser(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('access_token');
      console.log('Toggling user status for:', userId, 'current status:', currentStatus);
      
      const response = await fetch(`https://ab93e9536acd.ngrok.app/api/company/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          is_active: !currentStatus
        })
      });

      console.log('Toggle status response:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('Status updated successfully:', responseData);
        toast({
          title: "Success",
          description: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
        });
        fetchCompanyUsers();
      } else {
        const errorData = await response.json();
        console.error('Failed to update user status:', response.status, errorData);
        
        if (response.status === 400) {
          toast({
            title: "Error",
            description: "Cannot deactivate your own account",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: errorData.detail || "Failed to update user status",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "An error occurred while updating user status",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      console.log('Deleting user:', userId);
      
      const response = await fetch(`https://ab93e9536acd.ngrok.app/api/company/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      console.log('Delete user response:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('User deleted successfully:', responseData);
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        fetchCompanyUsers();
      } else {
        const errorData = await response.json();
        console.error('Failed to delete user:', response.status, errorData);
        
        if (response.status === 400) {
          toast({
            title: "Error",
            description: "Cannot delete your own account",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: errorData.detail || "Failed to delete user",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the user",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-un-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-h2-mobile font-bold text-neutral-gray">
              User Management
            </h2>
            <p className="text-body-mobile text-neutral-gray/70">
              Manage your company users and their permissions
            </p>
          </div>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary">
              <UserPlus className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Company User</DialogTitle>
              <DialogDescription>
                Add a new user to your company. They will have access to the company dashboard.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@company.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  placeholder="John"
                  value={createForm.first_name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, first_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  placeholder="Doe"
                  value={createForm.last_name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, last_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+962791234567"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={createForm.password}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                />
                <p className="text-xs text-neutral-gray/70">
                  Minimum 6 characters recommended
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isCreatingUser}
              >
                Cancel
              </Button>
              <Button
                onClick={createUser}
                disabled={isCreatingUser}
                className="btn-primary"
              >
                {isCreatingUser ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="w-8 h-8 text-neutral-gray/50" />
                    <p className="text-body-mobile text-neutral-gray/70">
                      No company users found. Create your first user to get started.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-neutral-gray/70">
                        {user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-neutral-gray/70">
                    {user.phone || 'Not provided'}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'company_admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'company_admin' ? 'Admin' : 'User'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.is_verified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.is_verified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-neutral-gray/70">
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.role !== 'company_admin' && user.id !== currentUser?.id && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUserStatus(user.id, user.is_active)}
                            className={user.is_active ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                          >
                            {user.is_active ? (
                              <>
                                <PowerOff className="w-3 h-3 mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Power className="w-3 h-3 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {user.first_name} {user.last_name}? 
                                  This action will deactivate the user and mark them as unverified.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUser(user.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete User
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                      {(user.role === 'company_admin' || user.id === currentUser?.id) && (
                        <span className="text-xs text-neutral-gray/50 px-2 py-1">
                          {user.id === currentUser?.id ? 'You' : 'Admin (Protected)'}
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CompanyUserManagement;
