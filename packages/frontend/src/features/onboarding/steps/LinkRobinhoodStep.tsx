import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';

interface LinkRobinhoodStepProps {
  onComplete: (data: { email: string; code: string }) => Promise<void>;
  initialData?: { email: string; code: string };
}

export function LinkRobinhoodStep({ onComplete, initialData }: LinkRobinhoodStepProps) {
  const [email, setEmail] = useState(initialData?.email || '');
  const [code, setCode] = useState(initialData?.code || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !code) {
      setError('Please fill in all fields');
      return;
    }

    if (!/^\d{5}$/.test(code)) {
      setError('Code must be exactly 5 digits');
      return;
    }

    setIsLoading(true);
    try {
      await onComplete({ email, code });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to link Robinhood account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Link Your Robinhood Account</CardTitle>
        <CardDescription>
          Connect your Robinhood account to get started with automated investing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Robinhood Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">5-Digit Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="12345"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
              disabled={isLoading}
              maxLength={5}
              required
            />
            <p className="text-sm text-muted-foreground">
              Enter the 5-digit verification code from your Robinhood account
            </p>
          </div>

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Linking...' : 'Continue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
