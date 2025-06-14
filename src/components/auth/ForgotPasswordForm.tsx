
import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ForgotPasswordFormProps {
  handleForgotPassword: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
  email: string;
  setEmail: (email: string) => void;
  onBackToLogin: () => void;
}

export const ForgotPasswordForm = ({ handleForgotPassword, loading, email, setEmail, onBackToLogin }: ForgotPasswordFormProps) => {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>We'll send a recovery link to your email.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-forgot">Email</Label>
            <Input id="email-forgot" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Link'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          <Button variant="link" onClick={onBackToLogin}>
            Back to Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
