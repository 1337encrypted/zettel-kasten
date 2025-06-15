
import { useState } from 'react';
import * as React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PasswordInput } from './PasswordInput';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChangePasswordDialog = ({ open, onOpenChange }: ChangePasswordDialogProps) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
        toast.error("Password should be at least 6 characters long.");
        return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
      onOpenChange(false);
    }
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setNewPassword('');
      setConfirmPassword('');
      setLoading(false);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter a new password for your account. This will log you out from all other sessions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handlePasswordChange}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-password-dialog">New Password</Label>
                <PasswordInput
                  id="new-password-dialog"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password-dialog">Confirm New Password</Label>
                <PasswordInput
                  id="confirm-password-dialog"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={loading || !newPassword || newPassword !== confirmPassword}>
                {loading ? 'Changing...' : 'Change Password'}
              </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
