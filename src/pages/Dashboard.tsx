import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText, Pill, Stethoscope, Upload as UploadIcon, ChevronRight,
  Activity, AlertCircle, TrendingUp, Calendar, Sparkles,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { daysAgo, formatDateShort } from '@/lib/format';
import { listRecords } from '@/lib/api/records';
import { listPrescriptions } from '@/lib/api/prescriptions';
import { listDoctors } from '@/lib/api/doctors';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const Dashboard = () => {
  const { activeProfile, notifications } = useApp();
  const [records, setRecords] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [doctorCount, setDoctorCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const familyMemberId = activeProfile.relation !== 'self' ? activeProfile.id : null;
        const [recordRows, rxRows, doctorRows] = await Promise.all([
          listRecords(familyMemberId),
          listPrescriptions(familyMemberId),
          listDoctors(),
        ]);
        if (!active) return;

        const normalizedRecords = (recordRows || []).map((r) => ({
          id: r.id,
          title: r.title,
          doctorName: r.doctor_name,
          date: r.record_date,
          thumbnailColor: r.thumbnail_color || 'hsl(221 83% 53%)',
        }));

        setRecords(normalizedRecords);
        setPrescriptions(rxRows || []);
        setDoctorCount(doctorRows.length || 0);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load your dashboard.');
        setRecords([]);
        setPrescriptions([]);
        setDoctorCount(0);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, [activeProfile.id, activeProfile.relation]);

  const activeMeds = prescriptions.flatMap(p => p.medications || []).filter(m => m.days_completed < m.duration_days);
  const lastRecord = records[0];
  const lastRx = prescriptions[0];

  const actions = [
    { to: '/app/records', icon: FileText, label: 'View Records', count: records.length, color: 'hsl(221 83% 53%)' },
    { to: '/app/prescriptions', icon: Pill, label: 'Prescriptions', count: prescriptions.length, color: 'hsl(173 80% 36%)' },
    { to: '/app/doctors', icon: Stethoscope, label: 'Doctors', count: doctorCount, color: 'hsl(262 83% 58%)' },
    { to: '/app/upload', icon: UploadIcon, label: 'Upload Report', count: null, color: 'hsl(38 92% 50%)' },
  ];

  if (loading) {
    return <div className="px-4 lg:px-10 py-6 lg:py-10 max-w-6xl mx-auto"><Card className="p-10 text-center border-dashed"><div className="font-semibold">Loading dashboard…</div></Card></div>;
  }

  if (error) {
    return <div className="px-4 lg:px-10 py-6 lg:py-10 max-w-6xl mx-auto"><Card className="p-10 text-center border-dashed"><div className="font-semibold">Unable to load dashboard</div><div className="text-sm text-muted-foreground">{error}</div></Card></div>;
  }

  return (
    <div className="px-4 lg:px-10 py-6 lg:py-10 max-w-6xl mx-auto space-y-6 lg:space-y-8">
      {/* Greeting */}
      <div>
        <p className="text-sm text-muted-foreground font-medium">{greeting()},</p>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mt-1">
          {activeProfile.name.split(' ')[0]} 👋
        </h1>
      </div>

      {/* Health summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
        <Card className="p-5 border-border shadow-soft hover-lift">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
              <Pill className="w-5 h-5 text-primary" />
            </div>
            <Badge variant="secondary" className="text-[10px] font-semibold">LAST</Badge>
          </div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Last prescription</div>
          <div className="font-bold text-base">{lastRx?.diagnosis || 'None yet'}</div>
          {lastRx && <div className="text-xs text-muted-foreground mt-0.5">{daysAgo(lastRx.prescribedDate)} · {lastRx.doctorName}</div>}
        </Card>

        <Card className="p-5 border-border shadow-soft hover-lift">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center">
              <Activity className="w-5 h-5 text-accent" />
            </div>
            <Badge className="bg-success-light text-success border-0 text-[10px] font-semibold">ACTIVE</Badge>
          </div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Active medications</div>
          <div className="font-bold text-base">{activeMeds.length} ongoing</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {activeMeds.slice(0, 2).map(m => m.name).join(', ') || 'No active meds'}
          </div>
        </Card>

        <Card className="p-5 border-border shadow-soft hover-lift">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-warning-light flex items-center justify-center">
              <Calendar className="w-5 h-5 text-warning" />
            </div>
            <Badge variant="secondary" className="text-[10px] font-semibold">CHECKUP</Badge>
          </div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Last checkup</div>
          <div className="font-bold text-base">{lastRecord ? formatDateShort(lastRecord.date) : 'Never'}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{lastRecord ? daysAgo(lastRecord.date) : 'Schedule one'}</div>
        </Card>
      </div>

      {/* Main actions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold tracking-tight">Quick actions</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map(a => (
            <Link key={a.to} to={a.to}>
              <Card className="p-5 border-border shadow-soft hover-lift cursor-pointer h-full">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: `${a.color}15` }}>
                  <a.icon className="w-5 h-5" style={{ color: a.color }} strokeWidth={2.2} />
                </div>
                <div className="font-semibold text-sm mb-0.5">{a.label}</div>
                {a.count !== null && <div className="text-xs text-muted-foreground">{a.count} items</div>}
                {a.count === null && <div className="text-xs text-muted-foreground">PDF, image, scan</div>}
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Smart insights */}
      <Card className="p-5 lg:p-6 border-border shadow-soft bg-gradient-to-br from-primary-light to-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <h2 className="font-bold tracking-tight">Smart insights</h2>
        </div>
        <div className="space-y-3">
          {activeMeds.length > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border">
              <Pill className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-semibold">You have {activeMeds.length} active medication{activeMeds.length > 1 ? 's' : ''}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{activeMeds[0].name} · Day {activeMeds[0].days_completed} of {activeMeds[0].duration_days}</div>
              </div>
              <Link to="/app/prescriptions"><Button variant="ghost" size="sm" className="h-8 text-xs">View</Button></Link>
            </div>
          )}
          {lastRecord && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border">
              <TrendingUp className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-semibold">Last report uploaded {daysAgo(lastRecord.date).toLowerCase()}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{lastRecord.title}</div>
              </div>
              <Link to={`/app/records/${lastRecord.id}`}><Button variant="ghost" size="sm" className="h-8 text-xs">Open</Button></Link>
            </div>
          )}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border">
            <AlertCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-semibold">Annual checkup recommended</div>
              <div className="text-xs text-muted-foreground mt-0.5">It's been a while since your last full panel</div>
            </div>
            <Link to="/app/doctors"><Button variant="ghost" size="sm" className="h-8 text-xs">Book</Button></Link>
          </div>
        </div>
      </Card>

      {/* Recent records */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold tracking-tight">Recent records</h2>
          <Link to="/app/records" className="text-xs text-primary font-semibold inline-flex items-center gap-0.5">
            See all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {records.length === 0 ? (
            <Card className="p-10 text-center border-dashed">
              <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <div className="font-semibold">No recent records</div>
            </Card>
          ) : records.slice(0, 3).map(r => (
            <Link key={r.id} to={`/app/records/${r.id}`}>
              <Card className="p-4 border-border shadow-soft hover-lift flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${r.thumbnailColor}18` }}>
                  <FileText className="w-5 h-5" style={{ color: r.thumbnailColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{r.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{r.doctorName} · {formatDateShort(r.date)}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;