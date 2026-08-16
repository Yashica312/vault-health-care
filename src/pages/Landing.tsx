import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Lock, BadgeCheck, Cloud, ArrowRight, FileText, Pill, Stethoscope, Activity } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="absolute top-0 inset-x-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Shield className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg tracking-tight">Vault Health</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
            <Link to="/login">
              <Button size="sm" className="gradient-primary border-0 shadow-glow">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="gradient-hero pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-light text-primary text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse-soft" />
            Trusted by 50,000+ patients
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] mb-5">
            All your medical records.
            <br />
            <span className="text-primary">One secure place.</span>
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Access, manage, and share your health data with verified doctors. End-to-end encrypted. Always with you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/login">
              <Button size="lg" className="gradient-primary border-0 shadow-glow h-12 px-7 text-base font-semibold">
                Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="h-12 px-7 text-base font-semibold">Login</Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 max-w-3xl mx-auto">
            {[
              { icon: Lock, label: 'End-to-end encrypted', sub: 'AES-256 security' },
              { icon: BadgeCheck, label: 'Verified doctors only', sub: 'License-checked' },
              { icon: Cloud, label: 'Secure cloud storage', sub: 'HIPAA-aligned' },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border shadow-soft">
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                  <b.icon className="w-5 h-5 text-primary" strokeWidth={2.2} />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm">{b.label}</div>
                  <div className="text-xs text-muted-foreground">{b.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-20 lg:py-28 bg-secondary/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Built for everyday care</div>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">Your personal health OS</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From prescriptions to lab reports, everything organized and accessible — exactly when you need it.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: FileText, title: 'Smart Records', desc: 'Auto-organized timeline of every report.' },
              { icon: Pill, title: 'Prescriptions', desc: 'Track meds with reminders and progress.' },
              { icon: Stethoscope, title: 'Verified Doctors', desc: 'Only license-checked clinicians.' },
              { icon: Activity, title: 'Emergency Mode', desc: 'Critical info via QR in seconds.' },
            ].map(f => (
              <div key={f.title} className="p-6 rounded-2xl bg-card border border-border shadow-soft hover-lift">
                <div className="w-11 h-11 rounded-xl bg-primary-light flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" strokeWidth={2.2} />
                </div>
                <h3 className="font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">Take control of your health story.</h2>
          <p className="text-muted-foreground text-lg mb-8">No more lost reports. No repeated tests. Just clarity.</p>
          <Link to="/login">
            <Button size="lg" className="gradient-primary border-0 shadow-glow h-12 px-8 text-base font-semibold">
              Start your vault <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>© 2026 Vault Health · Built for patients and clinicians.</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Privacy</span>
            <span>Security</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;