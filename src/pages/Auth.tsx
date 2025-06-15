import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { useNavigationShortcuts } from '@/hooks/useNavigationShortcuts';

const AuthPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  useNavigationShortcuts();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'tabs' | 'forgotPassword'>('tabs');

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error: functionError } = await supabase.functions.invoke('get-login-email', {
        body: { identifier: email },
      });

      if (functionError) {
        const errorBody = await functionError.context?.json();
        throw new Error(errorBody?.error || functionError.message);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }

      const loginEmail = data.email;

      const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Logged in successfully!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const { data: validationData, error: validationError } = await supabase.functions.invoke('validate-email', {
        body: { email },
      });

      if (validationError) throw validationError;
      if (validationData.error) throw new Error(validationData.error);

      if (!validationData.isValid) {
        toast.error(validationData.message || 'This email address does not seem to be valid.');
        setLoading(false);
        return;
      }

      const { data: usernameCheckData, error: usernameCheckError } = await supabase.functions.invoke('check-username-exists', {
        body: { username },
      });

      if (usernameCheckError) throw usernameCheckError;
      if (usernameCheckData.error) throw new Error(usernameCheckData.error);

      if (usernameCheckData.exists) {
        toast.error('This username is already taken. Please choose another one.');
        setLoading(false);
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
        setLoading(false);
        return;
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
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

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-background p-4 md:p-8" style={{ fontFamily: "Inter, sans-serif" }}>
      <AppHeader />
      <main className="flex-grow flex flex-col items-center justify-center">
        {view === 'tabs' ? (
          <Tabs defaultValue="login" className="w-full max-w-sm" onValueChange={() => { setPassword(''); setUsername(''); setConfirmPassword(''); }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm
                handleLogin={handleLogin}
                handleGoogleLogin={handleGoogleLogin}
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
                handleGoogleLogin={handleGoogleLogin}
                loading={loading}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                username={username}
                setUsername={setUsername}
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
      </main>
    </div>
  );
};

export default AuthPage;
