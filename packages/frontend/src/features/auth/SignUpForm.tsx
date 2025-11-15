import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { authClient } from './client';
import { useAuthStore } from './store';

export function SignUpForm() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        setError(result.error.message || 'Signup failed');
        setIsLoading(false);
        return;
      }

      // Update auth store with user data
      if (result.data?.user) {
        setUser({
          id: result.data.user.id,
          email: result.data.user.email,
          name: result.data.user.name || undefined,
        });
      }

      // New users always go to onboarding
      navigate('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-card border-border p-8 space-y-8">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img 
          src="/icon.png" 
          alt="Little John" 
          className="w-12 h-12 rounded-lg"
        />
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-primary">little</span>
          <span className="text-foreground">john</span>
        </h1>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Create Account</h2>
        <p className="text-sm text-muted-foreground">
          Join Little John to start intelligent trading today.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-md text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Full Name</label>
          <Input
            type="text"
            placeholder="John Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Email</label>
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11"
          disabled={isLoading}
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      {/* Terms */}
      <p className="text-xs text-muted-foreground text-center">
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </p>
    </Card>
  );
}
