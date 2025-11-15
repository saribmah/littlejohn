import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import type { Goal } from '../service';

interface GoalStepProps {
  onComplete: (data: { goal: Goal }) => Promise<void>;
  initialData?: { goal: Goal };
}

const GOALS: { value: Goal; label: string; description: string }[] = [
  { value: 'fast', label: 'Fast Growth', description: 'Maximize returns quickly with aggressive strategies' },
  { value: 'steady', label: 'Steady Growth', description: 'Consistent, reliable returns over time' },
  { value: 'experiment', label: 'Experimental', description: 'Try new investment strategies and learn' },
  { value: 'risk', label: 'High Risk/Reward', description: 'Take calculated risks for higher potential gains' },
  { value: 'balanced', label: 'Balanced', description: 'Mix of growth and stability' },
];

export function GoalStep({ onComplete, initialData }: GoalStepProps) {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(initialData?.goal || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedGoal) {
      setError('Please select an investment goal');
      return;
    }

    setIsLoading(true);
    try {
      await onComplete({ goal: selectedGoal });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set investment goal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose Your Investment Goal</CardTitle>
        <CardDescription>
          Select the investment strategy that best matches your objectives
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3">
            {GOALS.map((goal) => (
              <button
                key={goal.value}
                type="button"
                onClick={() => setSelectedGoal(goal.value)}
                className={`text-left p-4 border rounded-lg transition-colors ${
                  selectedGoal === goal.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-semibold">{goal.label}</div>
                <div className="text-sm text-muted-foreground">{goal.description}</div>
              </button>
            ))}
          </div>

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          <Button type="submit" disabled={isLoading || !selectedGoal} className="w-full">
            {isLoading ? 'Saving...' : 'Continue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
