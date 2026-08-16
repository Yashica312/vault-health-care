import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, BadgeCheck, Star, Building2 } from 'lucide-react';
import { listDoctors } from '@/lib/api/doctors';
import type { Doctor } from '@/lib/api/types';

const initials = (name: string) => name.replace('Dr. ', '').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

const Doctors = () => {
  const [query, setQuery] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchDoctors = async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await listDoctors();
        if (!active) return;
        setDoctors(rows);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load doctors.');
        setDoctors([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDoctors();
    return () => { active = false; };
  }, []);

  const filteredDoctors = useMemo(() => {
    const q = query.toLowerCase();
    return doctors.filter(d =>
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.specialization.toLowerCase().includes(q) ||
      d.hospital.toLowerCase().includes(q)
    );
  }, [query, doctors]);

  if (loading) {
    return (
      <div className="px-4 lg:px-10 py-6 lg:py-10 max-w-5xl mx-auto space-y-5">
        <div><h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Verified Doctors</h1><p className="text-sm text-muted-foreground mt-1">All clinicians are license-verified</p></div>
        <Card className="p-10 text-center border-dashed"><Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" /><div className="font-semibold">Loading doctors…</div></Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 lg:px-10 py-6 lg:py-10 max-w-5xl mx-auto space-y-5">
        <div><h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Verified Doctors</h1><p className="text-sm text-muted-foreground mt-1">All clinicians are license-verified</p></div>
        <Card className="p-10 text-center border-dashed"><Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" /><div className="font-semibold">Unable to load doctors</div><div className="text-sm text-muted-foreground">{error}</div></Card>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-10 py-6 lg:py-10 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Verified Doctors</h1>
        <p className="text-sm text-muted-foreground mt-1">All clinicians are license-verified</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, specialty, hospital…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-12 bg-card border-border"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {filteredDoctors.map(d => (
          <Link key={d.id} to={`/app/doctors/${d.id}`}>
            <Card className="p-5 border-border shadow-soft hover-lift h-full">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shrink-0" style={{ background: d.avatarColor }}>
                  {initials(d.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="font-bold truncate">{d.name}</h3>
                    {d.verificationStatus === 'verified' && <BadgeCheck className="w-4 h-4 text-primary shrink-0" fill="hsl(var(--primary))" stroke="white" />}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">{d.specialization}</div>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><Building2 className="w-3 h-3" /> {d.hospital}</div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1"><Star className="w-3 h-3 fill-warning text-warning" /> <span className="font-semibold text-foreground">{d.rating}</span></span>
                  <span>{d.yearsExperience} yrs exp</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4 font-semibold">View Profile</Button>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Doctors;