
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
      <img src="/lovable-uploads/3d4105c3-8713-4c19-b696-105b36d2928e.png" alt="Zet Logo" className="w-32 h-32 mb-8" />
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
