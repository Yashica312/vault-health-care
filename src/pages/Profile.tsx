import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Lock, Activity, LogOut, Shield, Smartphone, ChevronRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { Relation } from '@/types';
import { toast } from 'sonner';

const initials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const relations: Relation[] = ['spouse', 'parent', 'child', 'sibling', 'other'];

const Profile = () => {
  const { auth, profiles, activeProfile, setActiveProfileId, addProfile, logout } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', age: '', bloodGroup: 'O+', relation: 'child' as Relation, emergencyContact: '' });

  const submit = () => {
    if (!form.name || !form.age) { toast.error('Name and age required'); return; }
    addProfile({
      name: form.name,
      age: Number(form.age),
      bloodGroup: form.bloodGroup,
      relation: form.relation,
      emergencyContact: form.emergencyContact,
      allergies: [],
      avatarColor: ['hsl(262 83% 58%)', 'hsl(330 81% 60%)', 'hsl(38 92% 50%)', 'hsl(173 80% 36%)'][profiles.length % 4],
    });
    setOpen(false);
    setForm({ name: '', age: '', bloodGroup: 'O+', relation: 'child', emergencyContact: '' });
    toast.success('Profile added');
  };

  return (
    <div className="px-4 lg:px-10 py-6 lg:py-10 max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Profile & Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">{auth.userPhone}</p>
      </div>

      {/* Family profiles */}
      <Card className="p-5 border-border shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold">Family profiles</h3>
            <p className="text-xs text-muted-foreground">Manage records for everyone in your family</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-primary border-0 font-semibold">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add family member</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">FULL NAME</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">AGE</Label>
                    <Input type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">RELATION</Label>
                    <Select value={form.relation} onValueChange={(v) => setForm({ ...form, relation: v as Relation })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {relations.map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">BLOOD GROUP</Label>
                  <Select value={form.bloodGroup} onValueChange={(v) => setForm({ ...form, bloodGroup: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">EMERGENCY CONTACT</Label>
                  <Input value={form.emergencyContact} onChange={e => setForm({ ...form, emergencyContact: e.target.value })} placeholder="+91 …" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={submit} className="gradient-primary border-0 font-semibold">Add profile</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-2">
          {profiles.map(p => (
            <button
              key={p.id}
              onClick={() => setActiveProfileId(p.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-smooth text-left ${
                p.id === activeProfile.id ? 'bg-primary-light border border-primary/30' : 'bg-secondary/50 hover:bg-secondary'
              }`}
            >
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ background: p.avatarColor }}>
                {initials(p.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{p.name}</div>
                <div className="text-xs text-muted-foreground capitalize">
                  {p.relation === 'self' ? 'You' : p.relation} · {p.age} yrs · {p.bloodGroup}
                </div>
              </div>
              {p.id === activeProfile.id && <Badge className="bg-primary text-primary-foreground border-0 font-semibold">Active</Badge>}
            </button>
          ))}
        </div>
      </Card>

      {/* Security */}
      <Card className="p-5 border-border shadow-soft">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Security</h3>
        <div className="space-y-1">
          <Row icon={Lock} title="Your data is encrypted" subtitle="AES-256 end-to-end · only you have keys" />
          <Row icon={Activity} title="Activity log" subtitle="Last access: 2 minutes ago · Mumbai" trailing={<ChevronRight className="w-4 h-4 text-muted-foreground" />} />
          <Row icon={Smartphone} title="Trusted devices" subtitle="2 devices · iPhone, MacBook" trailing={<ChevronRight className="w-4 h-4 text-muted-foreground" />} />
        </div>
      </Card>

      <Button
        variant="outline"
        className="w-full text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive font-semibold"
        onClick={() => { logout(); navigate('/'); }}
      >
        <LogOut className="w-4 h-4 mr-2" /> Sign out
      </Button>
    </div>
  );
};

const Row = ({ icon: Icon, title, subtitle, trailing }: { icon: any; title: string; subtitle: string; trailing?: any }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/60 transition-smooth">
    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-muted-foreground" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-semibold text-sm">{title}</div>
      <div className="text-xs text-muted-foreground">{subtitle}</div>
    </div>
    {trailing}
  </div>
);

export default Profile;