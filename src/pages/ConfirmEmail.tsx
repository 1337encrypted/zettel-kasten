
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';

const ConfirmEmailPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    toast.success("Thank you for confirming your email. You can now log in.");
    const timer = setTimeout(() => {
      navigate('/auth');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <h1 className="text-5xl font-bold tracking-wide mb-8">Zet</h1>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Email Confirmed</CardTitle>
          <CardDescription>
            Your email has been successfully confirmed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">You will be redirected to the login page shortly. If you are not redirected, please <a href="/auth" className="underline">click here</a>.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmEmailPage;
