import DashboardHeader from '@/components/layout/dashboard-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useAuth from '@/hooks/use-auth';
import { User, Mail, Key, Info } from 'lucide-react';
import { useState } from 'react';

export default function SettingsContent() {
  const { user, requestPasswordReset } = useAuth();
  const [isRequestingReset, setIsRequestingReset] = useState(false);

  const handlePasswordReset = async () => {
    if (!user?.email) return;

    setIsRequestingReset(true);
    try {
      await requestPasswordReset(user.email);
    } catch (error) {
      // Error already handled by requestPasswordReset
    } finally {
      setIsRequestingReset(false);
    }
  };

  return (
    <>
      <DashboardHeader
        title="Settings"
        description="Manage your account settings and preferences"
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Account Information - Read Only */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <User className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Account Information</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                  Email Address
                </Label>
                <div className="mt-1 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user?.email || 'Not available'}</span>
                </div>
              </div>

              {user?.name && (
                <div>
                  <Label htmlFor="display-name" className="text-sm font-medium text-muted-foreground">
                    Display Name
                  </Label>
                  <div className="mt-1 flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.name}</span>
                  </div>
                </div>
              )}

              {user?.avatar && (
                <div>
                  <Label htmlFor="avatar" className="text-sm font-medium text-muted-foreground">
                    Avatar
                  </Label>
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt="User avatar"
                      className="h-12 w-12 rounded-full border border-border"
                    />
                    <span className="text-sm text-muted-foreground truncate max-w-md">
                      {user.avatar}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Profile Settings - Coming Soon */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <User className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Profile Settings</h3>
            </div>

            {/* Info Banner */}
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-start gap-2 dark:bg-blue-900/20 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Profile editing will be available soon. Contact your administrator if you need to update your profile information.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={user?.name || ''}
                  disabled
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="avatar-url">Avatar URL</Label>
                <Input
                  id="avatar-url"
                  type="text"
                  value={user?.avatar || ''}
                  disabled
                  className="mt-1"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>
          </Card>

          {/* Password Management */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Key className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Password</h3>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                For security reasons, you can request a password reset email to change your password.
              </p>

              <Button
                onClick={handlePasswordReset}
                disabled={isRequestingReset}
                variant="outline"
              >
                {isRequestingReset ? 'Sending...' : 'Request Password Reset Email'}
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
