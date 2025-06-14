
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { ThemeToggle } from '@/components/ThemeToggle';

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
            toast.info("You can now reset your password.");
        }
    });

    return () => {
        subscription.unsubscribe();
    };
  }, []);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully! Please log in.');
      await supabase.auth.signOut();
      navigate('/auth');
    }
    setLoading(false);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <img src="/lovable-uploads/3d4105c3-8713-4c19-b696-105b36d2928e.png" alt="Zet Logo" className="w-32 h-32 mb-8" />
      <ResetPasswordForm
        handlePasswordUpdate={handlePasswordUpdate}
        loading={loading}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
      />
    </div>
  );
};

export default ResetPasswordPage;
