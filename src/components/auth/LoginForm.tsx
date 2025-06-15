import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordInput } from './PasswordInput';

interface LoginFormProps {
  handleLogin: (e: React.FormEvent) => Promise<void>;
  handleGoogleLogin: () => Promise<void>;
  loading: boolean;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onForgotPassword: () => void;
}

export const LoginForm = ({ handleLogin, handleGoogleLogin, loading, email, setEmail, password, setPassword, onForgotPassword }: LoginFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-identifier">Email or Username</Label>
            <Input id="login-identifier" type="text" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-login">Password</Label>
            <PasswordInput id="password-login" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Button variant="success" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
          Sign in with Google
        </Button>
        <div className="mt-4 text-center text-sm">
          <Button variant="link" onClick={onForgotPassword}>
            Forgot Password?
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
