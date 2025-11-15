import { useNavigate } from 'react-router';
import { useOnboardingStore, STEP_TITLES } from './store';
import {
  completeLinkRobinhood,
  completeGoal,
  completeRisk,
  completePeriod,
  completeExclusions,
} from './service';
import {
  LinkRobinhoodStep,
  GoalStep,
  RiskStep,
  PeriodStep,
  ExclusionsStep,
} from './steps';

export function OnboardingFlow() {
  const navigate = useNavigate();
  const { currentStep, data, nextStep, updateData, setLoading, setError } = useOnboardingStore();

  const handleLinkRobinhood = async (stepData: { email: string; code: string }) => {
    setLoading(true);
    setError(null);
    try {
      await completeLinkRobinhood(stepData);
      updateData({ linkRobinhood: stepData });
      nextStep();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to link account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleGoal = async (stepData: { goal: any }) => {
    setLoading(true);
    setError(null);
    try {
      await completeGoal(stepData);
      updateData({ goal: stepData.goal });
      nextStep();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to set goal');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRisk = async (stepData: { riskLevel: any }) => {
    setLoading(true);
    setError(null);
    try {
      await completeRisk(stepData);
      updateData({ riskLevel: stepData.riskLevel });
      nextStep();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to set risk level');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handlePeriod = async (stepData: { months: any }) => {
    setLoading(true);
    setError(null);
    try {
      await completePeriod(stepData);
      updateData({ period: stepData.months });
      nextStep();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to set period');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleExclusions = async (stepData: { exclusions: string[] }) => {
    setLoading(true);
    setError(null);
    try {
      await completeExclusions(stepData);
      updateData({ exclusions: stepData.exclusions });
      // Onboarding complete, redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to complete onboarding');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            Step {currentStep + 1} of {STEP_TITLES.length}
          </h2>
          <span className="text-sm font-medium text-muted-foreground">
            {Math.round(((currentStep + 1) / STEP_TITLES.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / STEP_TITLES.length) * 100}%` }}
          />
        </div>
        <h1 className="text-2xl font-bold mt-4">{STEP_TITLES[currentStep]}</h1>
      </div>

      {/* Step Components */}
      {currentStep === 0 && (
        <LinkRobinhoodStep
          onComplete={handleLinkRobinhood}
          initialData={data.linkRobinhood}
        />
      )}
      {currentStep === 1 && (
        <GoalStep
          onComplete={handleGoal}
          initialData={data.goal ? { goal: data.goal } : undefined}
        />
      )}
      {currentStep === 2 && (
        <RiskStep
          onComplete={handleRisk}
          initialData={data.riskLevel ? { riskLevel: data.riskLevel } : undefined}
        />
      )}
      {currentStep === 3 && (
        <PeriodStep
          onComplete={handlePeriod}
          initialData={data.period ? { months: data.period } : undefined}
        />
      )}
      {currentStep === 4 && (
        <ExclusionsStep
          onComplete={handleExclusions}
          initialData={data.exclusions ? { exclusions: data.exclusions } : undefined}
        />
      )}
    </div>
  );
}
