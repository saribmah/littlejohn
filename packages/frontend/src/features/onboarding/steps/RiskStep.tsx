import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import type { RiskLevel } from '../service';

interface RiskStepProps {
  onComplete: (data: { riskLevel: RiskLevel }) => Promise<void>;
  initialData?: { riskLevel: RiskLevel };
}

const RISK_LEVELS: { value: RiskLevel; label: string; description: string }[] = [
  { value: 'low', label: 'Low Risk', description: 'Conservative approach with stable, lower returns' },
  { value: 'medium', label: 'Medium Risk', description: 'Balanced approach with moderate risk and returns' },
  { value: 'high', label: 'High Risk', description: 'Aggressive approach with higher potential returns' },
];

export function RiskStep({ onComplete, initialData }: RiskStepProps) {
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel | null>(initialData?.riskLevel || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedRisk) {
      setError('Please select a risk tolerance level');
      return;
    }

    setIsLoading(true);
    try {
      await onComplete({ riskLevel: selectedRisk });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set risk tolerance');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Your Risk Tolerance</CardTitle>
        <CardDescription>
          Choose how much risk you're comfortable with in your investments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3">
            {RISK_LEVELS.map((risk) => (
              <button
                key={risk.value}
                type="button"
                onClick={() => setSelectedRisk(risk.value)}
                className={`text-left p-4 border rounded-lg transition-colors ${
                  selectedRisk === risk.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-semibold">{risk.label}</div>
                <div className="text-sm text-muted-foreground">{risk.description}</div>
              </button>
            ))}
          </div>

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          <Button type="submit" disabled={isLoading || !selectedRisk} className="w-full">
            {isLoading ? 'Saving...' : 'Continue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
