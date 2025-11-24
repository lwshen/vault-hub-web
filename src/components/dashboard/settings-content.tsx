import DashboardHeader from '@/components/layout/dashboard-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useAuth from '@/hooks/use-auth';
import { useState } from 'react';
import { Loader2, User, Lock, Info, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsContent() {
  const { user } = useAuth();

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
  });
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileError(null);

    if (!profileData.name.trim()) {
      setProfileError('Name is required');
      return;
    }

    if (profileData.name.length > 100) {
      setProfileError('Name must be 100 characters or less');
      return;
    }

    setIsProfileLoading(true);

    try {
      // TODO: Update user profile when API is available
      // await userApi.updateUser({ name: profileData.name.trim() });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.info('Profile update feature is coming soon! API endpoint is not yet available.');
      setProfileError('This feature is not yet available. The API endpoint will be added in a future update.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setProfileError(message);
      toast.error(message);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError(null);

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    setIsPasswordLoading(true);

    try {
      // TODO: Change password when API is available
      // await userApi.changePassword({
      //   currentPassword: passwordData.currentPassword,
      //   newPassword: passwordData.newPassword,
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.info('Password change feature is coming soon! API endpoint is not yet available.');
      setPasswordError('This feature is not yet available. The API endpoint will be added in a future update.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to change password';
      setPasswordError(message);
      toast.error(message);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <>
      <DashboardHeader
        title="Settings"
        description="Manage your account settings and preferences"
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* API Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100">Settings Page Under Development</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                The profile update and password change features are currently unavailable. These features will be enabled once the backend API endpoints are implemented.
              </p>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Account Information</h2>
              <p className="text-sm text-muted-foreground">View your account details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Email Address</Label>
                <p className="mt-1 text-sm font-medium">{user?.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Display Name</Label>
                <p className="mt-1 text-sm font-medium">{user?.name || 'Not set'}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Profile Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <User className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Profile Settings</h2>
              <p className="text-sm text-muted-foreground">Update your personal information</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={profileData.name}
                onChange={(e) => {
                  setProfileData({ name: e.target.value });
                  if (profileError) setProfileError(null);
                }}
                disabled={isProfileLoading}
                required
              />
              <p className="text-xs text-muted-foreground">
                This is the name that will be displayed throughout the application
              </p>
            </div>

            {profileError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:text-red-400 dark:bg-red-900/20 dark:border-red-800">
                {profileError}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isProfileLoading || profileData.name === user?.name}>
                {isProfileLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Password Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Lock className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Password Settings</h2>
              <p className="text-sm text-muted-foreground">Change your account password</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password *</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Enter your current password"
                value={passwordData.currentPassword}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, currentPassword: e.target.value });
                  if (passwordError) setPasswordError(null);
                }}
                disabled={isPasswordLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password *</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter your new password"
                value={passwordData.newPassword}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, newPassword: e.target.value });
                  if (passwordError) setPasswordError(null);
                }}
                disabled={isPasswordLoading}
                required
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                value={passwordData.confirmPassword}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                  if (passwordError) setPasswordError(null);
                }}
                disabled={isPasswordLoading}
                required
              />
            </div>

            {passwordError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:text-red-400 dark:bg-red-900/20 dark:border-red-800">
                {passwordError}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isPasswordLoading}>
                {isPasswordLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </>
  );
}
