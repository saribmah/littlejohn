import { Button } from '../../components/ui/button';
import { ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onSignUp: () => void;
}

export function LandingPage({ onSignUp }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img 
              src="/icon.png" 
              alt="Little John" 
              className="w-10 h-10 rounded-lg"
            />
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="text-primary">little</span>john
            </h1>
          </div>
          <nav className="flex gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">
              Features
            </a>
            <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition">
              About
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition">
              Pricing
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Background gradient accent */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-20 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          </div>

          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
              Invest like a hawk, <br />
              <span className="text-primary">live like a human</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Little John is your AI trading agent. Set your priorities and it manages your portfolio intelligently while you stay in control.
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-6">
            <Button
              onClick={onSignUp}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 text-base font-semibold"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20" id="features">
            {[
              {
                title: 'Conversational Setup',
                desc: 'Answer 5 simple questions about your trading goals and risk tolerance.',
              },
              {
                title: 'Intelligent Execution',
                desc: 'AI makes trades within your guardrails, instantly or with your approval.',
              },
              {
                title: 'Full Transparency',
                desc: 'See every decision, every trade, and every reason it happened.',
              },
            ].map((feature, i) => (
              <div key={i} className="space-y-3 p-6 rounded-lg border border-border/50 hover:border-border transition">
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-muted-foreground">
          <p>&copy; 2025 Little John. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:text-foreground transition">
              Privacy
            </a>
            <a href="#terms" className="hover:text-foreground transition">
              Terms
            </a>
            <a href="#contact" className="hover:text-foreground transition">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
