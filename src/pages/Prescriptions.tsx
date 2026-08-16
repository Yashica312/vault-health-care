import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Pill, Sun, Moon, CloudSun, UtensilsCrossed, Stethoscope, Calendar } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { formatDate } from '@/lib/format';
import { listPrescriptions, updateMedication } from '@/lib/api/prescriptions';
import type { Medication } from '@/types';

const TimingIcon = ({ t }: { t: Medication['timing'][number] }) => {
  const map = { morning: Sun, afternoon: CloudSun, night: Moon };
  const Icon = map[t];
  return <Icon className="w-3.5 h-3.5" />;
};

const Prescriptions = () => {
  const { activeProfile } = useApp();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let active = true;

    const fetchPrescriptions = async () => {
      setLoading(true);
      setError(null);

      try {
        const familyMemberId = activeProfile.relation !== 'self' ? activeProfile.id : null;
        const rows = await listPrescriptions(familyMemberId);
        if (!active) return;

        const normalized = rows.map((rx) => ({
          ...rx,
          diagnosis: rx.diagnosis,
          doctorName: rx.doctor_name,
          prescribedDate: rx.prescribed_date,
          notes: rx.notes,
          medications: (rx.medications || []).map((m) => ({
            id: m.id,
            name: m.name,
            dosage: m.dosage,
            timing: m.timing || ['morning'],
            withFood: m.with_food,
            instructions: m.instructions,
            durationDays: m.duration_days,
            daysCompleted: m.days_completed,
            reminderEnabled: m.reminder_enabled,
          })),
        }));

        setItems(normalized);
        setReminders(Object.fromEntries((rows.flatMap(rx => rx.medications || [])).map(m => [m.id, !!m.reminder_enabled])));
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load prescriptions.');
        setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchPrescriptions();
    return () => { active = false; };
  }, [activeProfile.id, activeProfile.relation]);

  if (loading) {
    return (
      <div className="px-4 lg:px-10 py-6 lg:py-10 max-w-4xl mx-auto space-y-5">
        <div><h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Prescriptions</h1><p className="text-sm text-muted-foreground mt-1">Active and past medication plans</p></div>
        <Card className="p-10 text-center border-dashed"><Pill className="w-10 h-10 text-muted-foreground mx-auto mb-3" /><div className="font-semibold">Loading prescriptions…</div></Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 lg:px-10 py-6 lg:py-10 max-w-4xl mx-auto space-y-5">
        <div><h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Prescriptions</h1><p className="text-sm text-muted-foreground mt-1">Active and past medication plans</p></div>
        <Card className="p-10 text-center border-dashed"><Pill className="w-10 h-10 text-muted-foreground mx-auto mb-3" /><div className="font-semibold">Unable to load prescriptions</div><div className="text-sm text-muted-foreground">{error}</div></Card>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-10 py-6 lg:py-10 max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Prescriptions</h1>
        <p className="text-sm text-muted-foreground mt-1">Active and past medication plans</p>
      </div>

      {items.length === 0 ? (
        <Card className="p-10 text-center border-dashed">
          <Pill className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <div className="font-semibold">No prescriptions yet</div>
        </Card>
      ) : (
        <div className="space-y-5">
          {items.map(rx => (
            <Card key={rx.id} className="border-border shadow-soft overflow-hidden">
              <div className="p-5 border-b border-border bg-gradient-to-br from-primary-light/40 to-card">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h2 className="font-bold text-lg tracking-tight">{rx.diagnosis}</h2>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Stethoscope className="w-3 h-3" />{rx.doctorName}</span>
                      <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(rx.prescribedDate)}</span>
                    </div>
                  </div>
                  <Badge className="bg-success-light text-success border-0 font-semibold">Active</Badge>
                </div>
              </div>

              <div className="divide-y divide-border">
                {rx.medications.map(m => {
                  const pct = Math.round((m.daysCompleted / m.durationDays) * 100);
                  return (
                    <div key={m.id} className="p-5 hover:bg-secondary/30 transition-smooth">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                          <Pill className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className="font-semibold">{m.name}</h3>
                            <span className="text-sm font-bold text-primary">{m.dosage}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 mb-3">
                            {m.timing.map(t => (
                              <Badge key={t} variant="secondary" className="text-[10px] font-semibold gap-1 capitalize">
                                <TimingIcon t={t} /> {t}
                              </Badge>
                            ))}
                            {m.withFood && (
                              <Badge variant="secondary" className="text-[10px] font-semibold gap-1">
                                <UtensilsCrossed className="w-3 h-3" /> {m.instructions || 'After food'}
                              </Badge>
                            )}
                          </div>

                          {/* progress */}
                          <div className="space-y-1.5 mb-3">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold">Day {m.daysCompleted} of {m.durationDays}</span>
                              <span className="text-muted-foreground">{pct}%</span>
                            </div>
                            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <div className="text-xs text-muted-foreground">Reminder</div>
                            <Switch
                              checked={reminders[m.id] ?? m.reminderEnabled}
                              onCheckedChange={async (v) => {
                                setReminders((current) => ({ ...current, [m.id]: v }));
                                try {
                                  await updateMedication(m.id, { reminder_enabled: v });
                                } catch (err) {
                                  console.error('Failed to update reminder:', err);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {rx.notes && (
                <div className="p-4 bg-secondary/40 text-xs text-muted-foreground border-t border-border">
                  <span className="font-semibold text-foreground">Doctor's note: </span>{rx.notes}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Prescriptions;