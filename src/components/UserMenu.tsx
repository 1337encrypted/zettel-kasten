import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Trash2, Archive, Keyboard, Camera, Shield, Users, KeyRound, BookOpen } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Link } from 'react-router-dom';
import { ProfileAvatar } from './ProfileAvatar';
import { useAvatarHandler } from '@/hooks/useAvatarHandler';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { AdminSettingsDialog } from './AdminSettingsDialog';
import { ChangePasswordDialog } from './auth/ChangePasswordDialog';
import { ProfileVisibilityToggle } from './ProfileVisibilityToggle';

const UNTOUCHABLE_USER_ID = '0c90fe7b-b66d-44fa-8a35-3ee7a2c39001';

interface UserMenuProps {
  onExportAllNotes?: () => void;
  onCheatSheetOpenChange?: (open: boolean) => void;
}

export const UserMenu = ({
  onExportAllNotes,
  onCheatSheetOpenChange,
}: UserMenuProps) => {
  const { user, signOut } = useAuth();
  const { fileInputRef, handleAvatarClick, handleAvatarUpload, isUploading } = useAvatarHandler();
  const { isAdmin } = useIsAdmin();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase.functions.invoke('delete-user');
      if (error) throw error;
      toast.success("Your account has been successfully deleted.");
      signOut();
    } catch (error: any) {
      toast.error(`Failed to delete account: ${error.message}`);
    }
  };

  if (!user) {
    return null;
  }
  
  const isUntouchableUser = user.id === UNTOUCHABLE_USER_ID;

  return (
    <>
      <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarUpload}
          className="hidden"
          accept="image/png, image/jpeg, image/gif"
      />
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ProfileAvatar uploading={isUploading} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ProfileVisibilityToggle />
             <DropdownMenuItem onClick={handleAvatarClick} className="cursor-pointer">
              <Camera className="mr-2 h-4 w-4" />
              <span>Change Avatar</span>
            </DropdownMenuItem>
            {isAdmin && (
              <>
                <AdminSettingsDialog>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin Settings</span>
                  </DropdownMenuItem>
                </AdminSettingsDialog>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/admin">
                    <Users className="mr-2 h-4 w-4" />
                    <span>User Management</span>
                  </Link>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem onClick={() => onCheatSheetOpenChange?.(true)} className="cursor-pointer" disabled={!onCheatSheetOpenChange}>
              <Keyboard className="mr-2 h-4 w-4" />
              <span>Keyboard Shortcuts</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportAllNotes} className="cursor-pointer" disabled={!onExportAllNotes}>
              <Archive className="mr-2 h-4 w-4" />
              <span>Export All Notes</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setIsChangePasswordOpen(true)} className="cursor-pointer">
              <KeyRound className="mr-2 h-4 w-4" />
              <span>Change Password</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                disabled={isUntouchableUser}
                onSelect={(e) => {
                  if (isUntouchableUser) {
                    e.preventDefault();
                  }
                }}
                title={isUntouchableUser ? "This account cannot be deleted." : "Delete Account"}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Account</span>
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove all of your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ChangePasswordDialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen} />
    </>
  );
};
