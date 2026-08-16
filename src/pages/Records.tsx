import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Image as ImageIcon, ChevronRight, Plus, SlidersHorizontal } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { formatDateShort, recordTypeLabel } from '@/lib/format';
import { CategoryBadge } from '@/components/CategoryBadge';
import { listRecords } from '@/lib/api/records';
import type { MedicalRecord as SupabaseMedicalRecord } from '@/lib/api/types';
import { RecordType } from '@/types';

const filterChips: { value: RecordType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'lab-report', label: 'Lab' },
  { value: 'prescription', label: 'Rx' },
  { value: 'scan', label: 'Imaging' },
  { value: 'diagnosis', label: 'Diagnosis' },
  { value: 'note', label: 'Notes' },
];

type DisplayRecord = {
  id: string;
  title: string;
  type: RecordType;
  date: string;
  doctorName?: string;
  hospitalName?: string;
  tags: string[];
  fileType: 'pdf' | 'image';
  fileSizeKB: number;
  thumbnailColor: string;
  category?: 'cardiology' | 'radiology' | 'pathology' | 'endocrinology' | 'pulmonology' | 'orthopedics' | 'dermatology' | 'pediatrics' | 'general' | 'uncategorized';
  extractedText?: string;
  familyMemberId?: string | null;
};

const formatRecord = (record: SupabaseMedicalRecord): DisplayRecord => ({
  id: record.id,
  title: record.title,
  type: (record.record_type || 'other') as RecordType,
  date: record.record_date,
  doctorName: record.doctor_name || 'Unknown doctor',
  hospitalName: record.hospital_name || 'Unknown hospital',
  tags: Array.isArray(record.tags) ? record.tags : [],
  fileType: record.file_type === 'image' ? 'image' : 'pdf',
  fileSizeKB: record.file_size_kb || 0,
  thumbnailColor: record.thumbnail_color || 'hsl(221 83% 53%)',
  category: (record.category || 'uncategorized') as DisplayRecord['category'],
  extractedText: record.extracted_text || '',
  familyMemberId: record.family_member_id,
});

const Records = () => {
  const { activeProfile } = useApp();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<RecordType | 'all'>('all');
  const [records, setRecords] = useState<DisplayRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRecords = async () => {
      setLoading(true);
      setError(null);

      try {
        const familyMemberId = activeProfile && activeProfile.relation !== 'self' ? activeProfile.id : undefined;
        const rows = await listRecords(familyMemberId || null);
        if (!isMounted) return;

        const nextRecords = rows.map(formatRecord).sort((a, b) => b.date.localeCompare(a.date));
        setRecords(nextRecords);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Unable to load records.');
        setRecords([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRecords();

    return () => {
      isMounted = false;
    };
  }, [activeProfile.id, activeProfile.relation]);

  const filteredRecords = useMemo(() => {
    return records
      .filter(r => filter === 'all' || r.type === filter)
      .filter(r => {
        const q = query.toLowerCase();
        if (!q) return true;

        const searchable = [
          r.title,
          r.doctorName || '',
          r.hospitalName || '',
          ...(r.tags || []),
          r.extractedText || '',
        ].join(' ').toLowerCase();

        return searchable.includes(q);
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [records, query, filter]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filteredRecords>();
    filteredRecords.forEach(r => {
      const key = new Date(r.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });
    return Array.from(map.entries());
  }, [filteredRecords]);

  return (
    <div className="px-4 lg:px-10 py-6 lg:py-10 max-w-5xl mx-auto space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Medical Records</h1>
          <p className="text-sm text-muted-foreground mt-1">{filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'} · {activeProfile.name}</p>
        </div>
        <Link to="/app/upload">
          <Button className="gradient-primary border-0 shadow-glow font-semibold">
            <Plus className="w-4 h-4 mr-1.5" /> Upload
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by doctor, condition, file…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-12 bg-card border-border"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
        {filterChips.map(c => (
          <button
            key={c.value}
            onClick={() => setFilter(c.value)}
            className={`shrink-0 px-3.5 h-8 rounded-full text-xs font-semibold transition-smooth ${
              filter === c.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-muted'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Card className="p-10 text-center border-dashed">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <div className="font-semibold mb-1">Loading records…</div>
          <div className="text-sm text-muted-foreground">Fetching your medical history.</div>
        </Card>
      ) : error ? (
        <Card className="p-10 text-center border-dashed">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <div className="font-semibold mb-1">Unable to load records</div>
          <div className="text-sm text-muted-foreground">{error}</div>
        </Card>
      ) : grouped.length === 0 ? (
        <Card className="p-10 text-center border-dashed">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <div className="font-semibold mb-1">No records found</div>
          <div className="text-sm text-muted-foreground">Try a different search or upload your first report.</div>
        </Card>
      ) : (
        <div className="space-y-7">
          {grouped.map(([month, items]) => (
            <div key={month}>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5 px-1">
                {month}
              </div>
              <div className="space-y-2">
                {items.map(r => (
                  <Link key={r.id} to={`/app/records/${r.id}`}>
                    <Card className="p-4 border-border shadow-soft hover-lift flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${r.thumbnailColor}18` }}>
                        {r.fileType === 'image'
                          ? <ImageIcon className="w-5 h-5" style={{ color: r.thumbnailColor }} />
                          : <FileText className="w-5 h-5" style={{ color: r.thumbnailColor }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-semibold">{recordTypeLabel[r.type]}</Badge>
                          <CategoryBadge category={r.category} className="h-4 px-1.5" />
                          <span className="text-[11px] text-muted-foreground">{formatDateShort(r.date)}</span>
                        </div>
                        <div className="font-semibold text-sm truncate">{r.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{r.doctorName} · {r.hospitalName}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Records;