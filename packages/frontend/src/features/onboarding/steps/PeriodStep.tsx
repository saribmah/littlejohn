import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import type { Period } from '../service';

interface PeriodStepProps {
  onComplete: (data: { months: Period }) => Promise<void>;
  initialData?: { months: Period };
}

const PERIODS: { value: Period; label: string; description: string }[] = [
  { value: '6', label: '6 Months', description: 'Short-term investment horizon' },
  { value: '24', label: '2 Years', description: 'Medium-term investment horizon' },
  { value: '48', label: '4 Years', description: 'Long-term investment horizon' },
];

export function PeriodStep({ onComplete, initialData }: PeriodStepProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(initialData?.months || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedPeriod) {
      setError('Please select an investment period');
      return;
    }

    setIsLoading(true);
    try {
      await onComplete({ months: selectedPeriod });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set investment period');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose Your Investment Period</CardTitle>
        <CardDescription>
          How long do you plan to invest for?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3">
            {PERIODS.map((period) => (
              <button
                key={period.value}
                type="button"
                onClick={() => setSelectedPeriod(period.value)}
                className={`text-left p-4 border rounded-lg transition-colors ${
                  selectedPeriod === period.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-semibold">{period.label}</div>
                <div className="text-sm text-muted-foreground">{period.description}</div>
              </button>
            ))}
          </div>

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          <Button type="submit" disabled={isLoading || !selectedPeriod} className="w-full">
            {isLoading ? 'Saving...' : 'Continue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
