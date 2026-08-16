import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BadgeCheck, Star, Building2, Award, Calendar, MessageCircle, FileText, Clock } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { formatDateShort } from '@/lib/format';
import { toast } from 'sonner';
import { getDoctor, listDoctors } from '@/lib/api/doctors';
import { listRecords } from '@/lib/api/records';
import type { Doctor } from '@/lib/api/types';

const initials = (name: string) => name.replace('Dr. ', '').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeProfile } = useApp();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [sharedRecords, setSharedRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadDoctor = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const [doctorRow, rows] = await Promise.all([getDoctor(id), listRecords()]);
        if (!active) return;

        setDoctor(doctorRow);
        const relevant = rows.filter((r) => r.doctor_name === doctorRow?.name);
        setSharedRecords(relevant.map((r) => ({
          id: r.id,
          title: r.title,
          date: r.record_date,
          thumbnailColor: r.thumbnail_color || 'hsl(221 83% 53%)',
        })));
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load doctor details.');
        setDoctor(null);
        setSharedRecords([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDoctor();
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return <div className="p-10"><Card className="p-10 text-center border-dashed"><div className="font-semibold">Loading doctor profile…</div></Card></div>;
  }

  if (error || !doctor) return <div className="p-10"><Link to="/app/doctors">← Back</Link><Card className="p-10 text-center border-dashed mt-3"><div className="font-semibold">Doctor not found</div><div className="text-sm text-muted-foreground">{error || 'The doctor profile could not be loaded.'}</div></Card></div>;

  return (
    <div className="px-4 lg:px-10 py-6 lg:py-10 max-w-3xl mx-auto space-y-5">
      <button onClick={() => navigate(-1)} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <Card className="p-6 border-border shadow-soft">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-white text-xl font-bold shrink-0" style={{ background: doctor.avatarColor }}>
            {initials(doctor.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">{doctor.name}</h1>
              {doctor.verificationStatus === 'verified' && (
                <Badge className="bg-primary text-primary-foreground border-0 gap-1 font-semibold">
                  <BadgeCheck className="w-3 h-3" /> Verified
                </Badge>
              )}
            </div>
            <div className="text-sm font-medium text-muted-foreground mb-2">{doctor.specialization}</div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-warning text-warning" /><span className="font-semibold">{doctor.rating}</span></span>
              <span className="text-muted-foreground inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{doctor.yearsExperience} yrs experience</span>
            </div>
            {doctor.bio && <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{doctor.bio}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <Info icon={Building2} label="Hospital" value={doctor.hospital} />
          <Info icon={Award} label="License No." value={doctor.licenseNumber} />
        </div>

        <div className="grid grid-cols-2 gap-2 mt-6">
          <Button className="gradient-primary border-0 font-semibold" onClick={() => toast.success('Appointment requested')}>
            <Calendar className="w-4 h-4 mr-1.5" /> Book
          </Button>
          <Button variant="outline" className="font-semibold" onClick={() => toast.success('Message sent')}>
            <MessageCircle className="w-4 h-4 mr-1.5" /> Message
          </Button>
        </div>
      </Card>

      {sharedRecords.length > 0 && (
        <Card className="p-5 border-border shadow-soft">
          <h3 className="font-bold text-sm mb-3">Shared records</h3>
          <div className="space-y-2">
            {sharedRecords.map(r => (
              <Link key={r.id} to={`/app/records/${r.id}`} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary transition-smooth">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${r.thumbnailColor}18` }}>
                  <FileText className="w-4 h-4" style={{ color: r.thumbnailColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{r.title}</div>
                  <div className="text-xs text-muted-foreground">{formatDateShort(r.date)}</div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {sharedRecords.length === 0 && (
        <Card className="p-5 border-border shadow-soft">
          <h3 className="font-bold text-sm mb-3">Shared records</h3>
          <div className="text-sm text-muted-foreground">No shared records with this doctor yet.</div>
        </Card>
      )}
    </div>
  );
};

const Info = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50">
    <Icon className="w-4 h-4 text-muted-foreground mt-0.5" />
    <div className="min-w-0">
      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-sm font-medium truncate">{value}</div>
    </div>
  </div>
);

export default DoctorProfile;