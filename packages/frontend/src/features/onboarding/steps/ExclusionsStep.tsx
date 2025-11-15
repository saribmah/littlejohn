import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';

interface ExclusionsStepProps {
  onComplete: (data: { exclusions: string[] }) => Promise<void>;
  initialData?: { exclusions: string[] };
}

export function ExclusionsStep({ onComplete, initialData }: ExclusionsStepProps) {
  const [exclusions, setExclusions] = useState<string[]>(initialData?.exclusions || []);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = () => {
    const trimmed = currentInput.trim();
    if (trimmed && !exclusions.includes(trimmed)) {
      setExclusions([...exclusions, trimmed]);
      setCurrentInput('');
    }
  };

  const handleRemove = (index: number) => {
    setExclusions(exclusions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setIsLoading(true);
    try {
      await onComplete({ exclusions });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set exclusions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Exclusions</CardTitle>
        <CardDescription>
          Add sectors, companies, or industries you want to avoid (optional)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exclusion">Add Exclusion</Label>
            <div className="flex gap-2">
              <Input
                id="exclusion"
                type="text"
                placeholder="e.g., tobacco, weapons, oil"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
                disabled={isLoading}
              />
              <Button type="button" onClick={handleAdd} disabled={isLoading || !currentInput.trim()}>
                Add
              </Button>
            </div>
          </div>

          {exclusions.length > 0 && (
            <div className="space-y-2">
              <Label>Current Exclusions:</Label>
              <div className="flex flex-wrap gap-2">
                {exclusions.map((exclusion, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm"
                  >
                    <span>{exclusion}</span>
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="hover:text-destructive"
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Completing...' : 'Complete Onboarding'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
