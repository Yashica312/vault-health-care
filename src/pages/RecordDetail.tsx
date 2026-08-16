import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft, Download, Share2, FileText, Image as ImageIcon, Calendar,
  Stethoscope, Building2, Tag, Lock, ScanLine, Sparkles, AlertTriangle, CalendarClock, Activity,
} from 'lucide-react';
import { formatDate, recordTypeLabel } from '@/lib/format';
import { CategoryBadge } from '@/components/CategoryBadge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getRecord } from '@/lib/api/records';
import { getSignedUrl } from '@/lib/api/storage';
import { parseAiSummary } from '@/lib/api/types';

const RecordDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadRecord = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const row = await getRecord(id);
        if (!active) return;
        if (!row) {
          setRecord(null);
          setError('Record not found.');
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user || row.user_id !== user.id) {
          throw new Error('This record is not available to your account.');
        }

        setRecord({
          ...row,
          type: row.record_type,
          date: row.record_date,
          doctorName: row.doctor_name,
          hospitalName: row.hospital_name,
          tags: row.tags || [],
          fileType: row.file_type === 'image' ? 'image' : 'pdf',
          fileSizeKB: row.file_size_kb || 0,
          thumbnailColor: row.thumbnail_color || 'hsl(221 83% 53%)',
          category: row.category || 'uncategorized',
          extractedText: row.extracted_text || '',
          aiSummary: parseAiSummary(row.ai_summary),
          notes: row.notes || '',
        });
        setNotes(row.notes || '');

        if (row.file_path) {
          const signedUrl = await getSignedUrl(row.file_path);
          if (active) setFileUrl(signedUrl);
        }
      } catch (err) {
        if (!active) return;
        setRecord(null);
        setError(err instanceof Error ? err.message : 'Unable to load record.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadRecord();
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return <div className="px-4 lg:px-10 py-10 max-w-3xl mx-auto"><Card className="p-10 text-center border-dashed"><div className="font-semibold">Loading record…</div></Card></div>;
  }

  if (error || !record) {
    return (
      <div className="px-4 lg:px-10 py-10 max-w-3xl mx-auto">
        <p className="font-semibold">{error || 'Record not found.'}</p>
        <Link to="/app/records" className="text-primary text-sm mt-3 inline-block">← Back to records</Link>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-10 py-6 lg:py-10 max-w-4xl mx-auto space-y-5">
      <button onClick={() => navigate(-1)} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-[10px] font-semibold">{recordTypeLabel[record.type]}</Badge>
            <CategoryBadge category={record.category} showIcon />
            <Badge className="bg-success-light text-success border-0 text-[10px] font-semibold gap-1">
              <Lock className="w-2.5 h-2.5" /> Immutable
            </Badge>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{record.title}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success('Share link copied')}>
            <Share2 className="w-4 h-4 mr-1.5" /> Share
          </Button>
          <Button size="sm" className="gradient-primary border-0" onClick={() => toast.success('Download started')}>
            <Download className="w-4 h-4 mr-1.5" /> Download
          </Button>
        </div>
      </div>

      {/* File preview */}
      <Card className="border-border shadow-soft overflow-hidden">
        <div className="aspect-[4/3] sm:aspect-[16/9] flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${record.thumbnailColor}10, ${record.thumbnailColor}25)` }}>
          {fileUrl && record.fileType === 'image' ? (
            <img src={fileUrl} alt={record.title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-card shadow-card flex items-center justify-center mx-auto mb-3">
                {record.fileType === 'image'
                  ? <ImageIcon className="w-10 h-10" style={{ color: record.thumbnailColor }} />
                  : <FileText className="w-10 h-10" style={{ color: record.thumbnailColor }} />}
              </div>
              <div className="text-sm font-semibold">{record.fileType.toUpperCase()} · {record.fileSizeKB} KB</div>
              <div className="text-xs text-muted-foreground mt-1">Click download to view full file</div>
            </div>
          )}
        </div>
      </Card>

      {/* Meta */}
      <Card className="p-5 border-border shadow-soft">
        <div className="grid sm:grid-cols-2 gap-4">
          <Meta icon={Calendar} label="Date" value={formatDate(record.date)} />
          <Meta icon={Stethoscope} label="Doctor" value={record.doctorName || '—'} />
          <Meta icon={Building2} label="Hospital" value={record.hospitalName || '—'} />
          <Meta icon={Tag} label="Tags" value={record.tags.join(', ') || '—'} />
        </div>
      </Card>

      {/* AI Summary */}
      {record.aiSummary && (
        <Card className="p-5 border-border shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-sm">AI Summary</h3>
            <Badge variant="secondary" className="text-[10px] font-semibold">
              {Math.round(record.aiSummary.confidence * 100)}% confidence
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Diagnosis</div>
              <div className="text-sm font-semibold">{record.aiSummary.diagnosis}</div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Key findings</div>
              <ul className="space-y-1.5">
                {record.aiSummary.findings.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Activity className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Abnormal values</div>
              {record.aiSummary.abnormalValues.length === 0 ? (
                <div className="text-sm text-muted-foreground">All measured values within normal range.</div>
              ) : (
                <div className="space-y-2">
                  {record.aiSummary.abnormalValues.map((a) => (
                    <div key={a.label} className="flex items-center gap-3 rounded-xl bg-secondary/60 p-3">
                      <AlertTriangle className={`w-4 h-4 shrink-0 ${a.severity === 'high' ? 'text-destructive' : 'text-warning'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{a.label}</div>
                        <div className="text-xs text-muted-foreground">Reference: {a.range}</div>
                      </div>
                      <div className={`text-sm font-bold ${a.severity === 'high' ? 'text-destructive' : 'text-warning'}`}>{a.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-primary-light/50 p-3">
              <CalendarClock className="w-4 h-4 text-primary shrink-0" />
              <div className="text-sm">
                <span className="text-muted-foreground">Suggested follow-up: </span>
                <span className="font-semibold">
                  {record.aiSummary.followUpDate ? formatDate(record.aiSummary.followUpDate) : 'No follow-up needed'}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground mt-4">
            AI-generated summary for reference only — always confirm with your doctor.
          </p>
        </Card>
      )}

      {/* OCR-style extracted text */}
      {record.extractedText && (
        <Card className="p-5 border-border shadow-soft">
          <div className="flex items-center gap-2 mb-3">
            <ScanLine className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Extracted text</h3>
            <Badge variant="secondary" className="text-[10px] font-semibold">OCR</Badge>
          </div>
          <div className="bg-secondary/60 rounded-xl p-4 font-mono text-sm leading-relaxed text-foreground/90">
            {record.extractedText}
          </div>
        </Card>
      )}

      {/* Notes */}
      <Card className="p-5 border-border shadow-soft">
        <h3 className="font-semibold text-sm mb-3">Your notes</h3>
        <Textarea
          placeholder="Add a personal note about this record…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="resize-none"
        />
        <Button size="sm" variant="outline" className="mt-3" onClick={() => toast.success('Note saved')}>Save note</Button>
      </Card>
    </div>
  );
};

const Meta = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-muted-foreground" />
    </div>
    <div className="min-w-0">
      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-sm font-medium truncate">{value}</div>
    </div>
  </div>
);

export default RecordDetail;