import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Check } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { addFamilyMember } from '@/lib/api/family';
import { upsertProfile } from '@/lib/api/profile';
import { toast } from 'sonner';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useApp();
  const phone = (location.state as any)?.phone || '';

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [emergency, setEmergency] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (!auth.isAuthenticated) return;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active || !session) return;
      const { data, error } = await supabase.from('profiles').select('id').maybeSingle();
      if (!active) return;
      if (!error && data) {
        navigate('/app', { replace: true });
      }
    });
    return () => {
      active = false;
    };
  }, [navigate, auth.isAuthenticated]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age || !bloodGroup) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user) {
        throw new Error('No authenticated Supabase session found.');
      }

      const nextPhone = phone || session.user.phone || '';

      await upsertProfile({
        full_name: name.trim(),
        phone: nextPhone || null,
        email: session.user.email || null,
      });

      await addFamilyMember({
        name: name.trim(),
        relation: 'self',
        age: Number(age),
        blood_group: bloodGroup,
        emergency_contact: emergency || null,
        allergies: [],
        avatar_color: 'hsl(221 83% 53%)',
      });

      const { data: { session: refreshedSession } } = await supabase.auth.getSession();
      if (!refreshedSession) {
        throw new Error('Authentication was lost after onboarding.');
      }

      toast.success(`Welcome, ${name.split(' ')[0]}!`);
      navigate('/app', { replace: true });
    } catch (error) {
      console.error('Onboarding failed:', error);
      toast.error(error instanceof Error ? error.message : 'Unable to create your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl gradient-primary items-center justify-center shadow-glow mb-5">
            <Shield className="w-7 h-7 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-1.5">Tell us about yourself</h1>
          <p className="text-sm text-muted-foreground">This stays private. Only you control who sees it.</p>
        </div>

        <form onSubmit={submit} className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground">FULL NAME</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Aarav Sharma" className="h-11" autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="age" className="text-xs font-semibold text-muted-foreground">AGE</Label>
              <Input id="age" type="number" inputMode="numeric" value={age} onChange={e => setAge(e.target.value)} placeholder="32" className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">BLOOD GROUP</Label>
              <Select value={bloodGroup} onValueChange={setBloodGroup}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {bloodGroups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="emerg" className="text-xs font-semibold text-muted-foreground">EMERGENCY CONTACT (optional)</Label>
            <Input id="emerg" value={emergency} onChange={e => setEmergency(e.target.value)} placeholder="+91 98765 43210" className="h-11" />
          </div>

          <Button type="submit" className="w-full h-12 gradient-primary border-0 font-semibold mt-2" disabled={loading}>
            <Check className="w-4 h-4 mr-2" /> {loading ? 'Creating your vault…' : 'Create my vault'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;