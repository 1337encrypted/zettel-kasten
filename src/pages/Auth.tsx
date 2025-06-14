
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

const AuthPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'tabs' | 'forgotPassword'>('tabs');

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Logged in successfully!');
      navigate('/');
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: validationData, error: validationError } = await supabase.functions.invoke('validate-email', {
        body: { email },
      });

      if (validationError) throw validationError;
      if (validationData.error) throw new Error(validationData.error);

      if (!validationData.isValid) {
        toast.error(validationData.message || 'This email address does not seem to be valid.');
        return;
      }
      
      const { data, error: functionError } = await supabase.functions.invoke('check-user-exists', {
        body: { email },
      });

      if (functionError) {
        throw functionError;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.exists) {
        toast.error('An account with this email already exists.');
        return;
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/confirm-email`,
        },
      });
      if (signUpError) {
        throw signUpError;
      }
      toast.info('Check your email to confirm your account!');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign up.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Check your email for a password reset link.');
      setView('tabs');
    }
    setLoading(false);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <h1 className="text-5xl font-bold text-primary tracking-wide mb-8">Zet</h1>
      {view === 'tabs' ? (
        <Tabs defaultValue="login" className="w-full max-w-sm" onValueChange={() => { setPassword(''); }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm
              handleLogin={handleLogin}
              loading={loading}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              onForgotPassword={() => setView('forgotPassword')}
            />
          </TabsContent>
          <TabsContent value="signup">
            <SignupForm
              handleSignup={handleSignup}
              loading={loading}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <ForgotPasswordForm
          handleForgotPassword={handleForgotPassword}
          loading={loading}
          email={email}
          setEmail={setEmail}
          onBackToLogin={() => setView('tabs')}
        />
      )}
    </div>
  );
};

export default AuthPage;
