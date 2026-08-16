import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertCircle, Heart, Pill, Phone, Share2, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { listPrescriptions } from '@/lib/api/prescriptions';
import { getEmergencyProfile } from '@/lib/api/emergency';

const Emergency = () => {
  const navigate = useNavigate();
  const { activeProfile } = useApp();
  const [meds, setMeds] = useState<any[]>([]);
  const [emergencyData, setEmergencyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const familyMemberId = activeProfile.relation !== 'self' ? activeProfile.id : null;
        const [rxes, profile] = await Promise.all([
          listPrescriptions(familyMemberId),
          familyMemberId ? getEmergencyProfile(familyMemberId) : Promise.resolve(null),
        ]);
        if (!active) return;

        const nextMeds = (rxes || []).flatMap((rx) => (rx.medications || [])).filter((m) => m.days_completed < m.duration_days);
        setMeds(nextMeds);
        setEmergencyData(profile ?? {
          full_name: activeProfile.name,
          blood_group: activeProfile.bloodGroup,
          allergies: activeProfile.allergies,
          emergency_contact: activeProfile.emergencyContact,
          critical_conditions: [],
        });
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load emergency info.');
        setMeds([]);
        setEmergencyData({
          full_name: activeProfile.name,
          blood_group: activeProfile.bloodGroup,
          allergies: activeProfile.allergies,
          emergency_contact: activeProfile.emergencyContact,
          critical_conditions: [],
        });
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, [activeProfile.id, activeProfile.relation, activeProfile.name, activeProfile.bloodGroup, activeProfile.allergies, activeProfile.emergencyContact]);

  const link = `https://vault.health/emergency/${activeProfile.id}`;

  if (loading) {
    return <div className="px-4 lg:px-10 py-6 lg:py-10 max-w-3xl mx-auto"><Card className="p-10 text-center border-dashed"><div className="font-semibold">Loading emergency profile…</div></Card></div>;
  }

  if (error && !emergencyData) {
    return <div className="px-4 lg:px-10 py-6 lg:py-10 max-w-3xl mx-auto"><Card className="p-10 text-center border-dashed"><div className="font-semibold">Unable to load emergency info</div><div className="text-sm text-muted-foreground">{error}</div></Card></div>;
  }

  return (
    <div className="px-4 lg:px-10 py-6 lg:py-10 max-w-3xl mx-auto space-y-5">
      <button onClick={() => navigate(-1)} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <Card className="p-6 border-destructive/30 shadow-soft bg-gradient-to-br from-destructive/5 to-card">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Emergency Access</h1>
            <p className="text-xs text-muted-foreground">Critical health info, instantly shareable</p>
          </div>
        </div>
      </Card>

      {/* QR */}
      <Card className="p-6 border-border shadow-soft text-center">
        <div className="inline-block p-4 bg-card rounded-2xl border border-border">
          <QRCodeSVG value={link} size={180} bgColor="#ffffff" fgColor="hsl(222 47% 11%)" level="M" />
        </div>
        <div className="mt-4 font-bold">Scan to view emergency profile</div>
        <div className="text-xs text-muted-foreground mt-1">Anyone with this code sees your critical info</div>
        <div className="flex gap-2 mt-4 justify-center">
          <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(link); toast.success('Link copied'); }}>
            <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy link
          </Button>
          <Button size="sm" className="gradient-primary border-0" onClick={() => toast.success('Share opened')}>
            <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share
          </Button>
        </div>
      </Card>

      {/* Critical info */}
      <Card className="p-5 border-border shadow-soft">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Heart className="w-4 h-4 text-destructive" /> Critical info</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Stat label="Patient Name" value={emergencyData?.full_name || activeProfile.name} />
          <Stat label="Blood Group" value={emergencyData?.blood_group || activeProfile.bloodGroup} highlight />
          <Stat label="Emergency Contact" value={emergencyData?.emergency_contact || activeProfile.emergencyContact} icon={Phone} />
          <Stat label="Allergies" value={(emergencyData?.allergies || activeProfile.allergies || []).join(', ') || 'None'} highlight={((emergencyData?.allergies || activeProfile.allergies || []).length > 0)} />
        </div>
      </Card>

      <Card className="p-5 border-border shadow-soft">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Pill className="w-4 h-4 text-primary" /> Current medications</h3>
        {meds.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active medications</p>
        ) : (
          <div className="space-y-2">
            {meds.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div>
                  <div className="font-semibold text-sm">{m.name} · {m.dosage}</div>
                  <div className="text-xs text-muted-foreground capitalize">{(m.timing || ['morning']).join(', ')}</div>
                </div>
                <Badge variant="secondary" className="font-semibold">Day {m.days_completed}/{m.duration_days}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5 border-border shadow-soft">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Heart className="w-4 h-4 text-destructive" /> Critical conditions</h3>
        {(emergencyData?.critical_conditions || []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No critical conditions on file.</p>
        ) : (
          <div className="space-y-2">
            {(emergencyData?.critical_conditions || []).map((c: string) => (
              <div key={c} className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm font-medium text-destructive">{c}</div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

const Stat = ({ label, value, highlight, icon: Icon }: { label: string; value: string; highlight?: boolean; icon?: any }) => (
  <div className={`p-3 rounded-xl ${highlight ? 'bg-destructive/10 border border-destructive/20' : 'bg-secondary/50'}`}>
    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</div>
    <div className={`font-bold flex items-center gap-1.5 ${highlight ? 'text-destructive' : ''}`}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {value}
    </div>
  </div>
);

export default Emergency;