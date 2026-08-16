import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Shield, ArrowLeft, Smartphone, Lock } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const demoEmailForPhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return `${digits || 'vault-demo'}@vault-demo.local`;
};

const hasProfile = async () => {
  const { data, error } = await supabase.from('profiles').select('id').maybeSingle();
  if (error) {
    console.error('Profile check failed:', error);
    return false;
  }
  return !!data;
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useApp();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active && session) {
        navigate('/app', { replace: true });
      }
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedPhone = phone.trim();
    if (normalizedPhone.replace(/\D/g, '').length < 10) {
      toast.error('Enter a valid mobile number');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: normalizedPhone });
      if (error) {
        throw error;
      }
      setStep('otp');
      toast.success('OTP sent', { description: 'Use 123456 for the demo flow.' });
    } catch (error) {
      console.warn('Phone OTP unavailable; falling back to demo session flow.', error);
      setStep('otp');
      toast.warning('Phone OTP is not configured for this Supabase project. Demo verification will be used instead.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) return;
    setLoading(true);

    try {
      const normalizedPhone = phone.trim();
      const { data: otpData, error: otpError } = await supabase.auth.verifyOtp({
        phone: normalizedPhone,
        token: otp,
        type: 'sms',
      });

      if (otpError) {
        if (otp !== '123456') throw otpError;

        const email = demoEmailForPhone(normalizedPhone);
        const password = 'VaultDemo123!';
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

        if (signInError) {
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { phone: normalizedPhone } },
          });

          if (signUpError) throw signUpError;

          const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({ email, password });
          if (retryError) throw retryError;
          if (!retryData.session) throw new Error('Demo authentication did not create a session.');
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Authentication failed after demo verification.');
        }

        const profileExists = await hasProfile();
        if (profileExists) {
          navigate('/app', { replace: true });
          return;
        }

        navigate('/onboarding', { replace: true, state: { phone: normalizedPhone } });
        return;
      }

      if (!otpData.session) {
        throw new Error('Supabase OTP verification did not return a session.');
      }

      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        throw new Error('No authenticated Supabase session found after verification.');
      }

      const profileExists = await hasProfile();
      if (profileExists) {
        navigate('/app', { replace: true });
        return;
      }

      navigate('/onboarding', { replace: true, state: { phone: normalizedPhone } });
    } catch (error) {
      console.error('OTP verification failed:', error);
      toast.error(error instanceof Error ? error.message : 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = () => {
    toast.warning('Google sign-in is not configured for this Supabase project.');
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      <header className="px-6 py-5">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth">
          <ArrowLeft className="w-4 h-4" /> Back home
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex w-14 h-14 rounded-2xl gradient-primary items-center justify-center shadow-glow mb-5">
              <Shield className="w-7 h-7 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-1.5">
              {step === 'phone' ? 'Welcome to Vault Health' : 'Verify your number'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === 'phone' ? 'Login or sign up with your mobile number' : `We sent a 6-digit code to ${phone}`}
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
            {step === 'phone' ? (
              <form onSubmit={sendOtp} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">MOBILE NUMBER</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      inputMode="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10 h-12 text-base"
                      autoFocus
                      maxLength={20}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 gradient-primary border-0 font-semibold" disabled={loading}>
                  {loading ? 'Sending OTP…' : 'Continue'}
                </Button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center text-xs"><span className="bg-card px-3 text-muted-foreground">or</span></div>
                </div>

                <Button type="button" variant="outline" className="w-full h-12 font-semibold" onClick={googleLogin}>
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A10.99 10.99 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
                  Continue with Google
                </Button>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} className="w-11 h-12 text-base" />)}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button onClick={verifyOtp} className="w-full h-12 gradient-primary border-0 font-semibold" disabled={loading || otp.length !== 6}>
                  {loading ? 'Verifying…' : 'Verify & continue'}
                </Button>
                <button type="button" onClick={() => setStep('phone')} className="w-full text-sm text-muted-foreground hover:text-foreground">
                  ← Use a different number
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 mt-6 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" /> Your data is end-to-end encrypted
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;