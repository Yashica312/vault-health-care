import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadCloud, Camera, FileText, Sparkles, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { classifyDocument, categoryLabel, categoryOptions } from '@/lib/classify';
import { RecordCategory, RecordType } from '@/types';
import { CategoryBadge } from '@/components/CategoryBadge';
import { useApp } from '@/contexts/AppContext';
import { validateMedicalFile, uploadMedicalFile } from '@/lib/api/storage';
import { createRecord } from '@/lib/api/records';

type Stage = 'pick' | 'review' | 'done';

const Upload = () => {
  const navigate = useNavigate();
  const { activeProfile } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>('pick');
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('lab-report');
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [drag, setDrag] = useState(false);
  const [category, setCategory] = useState<RecordCategory>('uncategorized');
  const [confidence, setConfidence] = useState(0);
  const [categoryEdited, setCategoryEdited] = useState(false);

  const handleFile = (f: File) => {
    setFile(f);
    setName(f.name.replace(/\.[^.]+$/, ''));
    // mock auto-detect
    const lower = f.name.toLowerCase();
    let detectedType: RecordType = 'other';
    if (lower.includes('blood') || lower.includes('cbc')) detectedType = 'lab-report';
    else if (lower.includes('rx') || lower.includes('prescription')) detectedType = 'prescription';
    else if (lower.includes('xray') || lower.includes('scan')) detectedType = 'scan';
    setType(detectedType);
    const result = classifyDocument(f.name, detectedType);
    setCategory(result.category);
    setConfidence(result.confidence);
    setCategoryEdited(false);
    setStage('review');
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const addTag = () => {
    if (tag.trim() && !tags.includes(tag.trim())) setTags([...tags, tag.trim()]);
    setTag('');
  };

  const finish = async () => {
    if (!file) {
      toast.error('Please choose a file to upload.');
      return;
    }

    const validationError = validateMedicalFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      const path = await uploadMedicalFile(file);
      await createRecord({
        title: name || file.name.replace(/\.[^.]+$/, ''),
        record_type: type as RecordType,
        category,
        record_date: new Date().toISOString().slice(0, 10),
        doctor_name: 'Uploaded by patient',
        hospital_name: 'Vault Health',
        tags: tags.length ? tags : [],
        notes: '',
        extracted_text: '',
        ai_summary: null,
        file_path: path,
        file_type: file.type === 'application/pdf' ? 'pdf' : file.type.split('/')[1] || 'pdf',
        file_size_kb: Math.round(file.size / 1024),
        thumbnail_color: 'hsl(221 83% 53%)',
        family_member_id: activeProfile.relation !== 'self' ? activeProfile.id : null,
      });

      setStage('done');
      toast.success('Report uploaded', { description: `${name || file.name} saved under ${categoryLabel[category]}` });
      setTimeout(() => navigate('/app/records'), 1200);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error instanceof Error ? error.message : 'Unable to upload your report.');
    }
  };

  return (
    <div className="px-4 lg:px-10 py-6 lg:py-10 max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Upload Report</h1>
        <p className="text-sm text-muted-foreground mt-1">PDFs, images, or scan with your camera</p>
      </div>

      {stage === 'pick' && (
        <>
          <Card
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            className={`p-10 border-2 border-dashed cursor-pointer text-center transition-smooth ${
              drag ? 'border-primary bg-primary-light/40' : 'border-border hover:border-primary/40 hover:bg-secondary/40'
            }`}
            onClick={() => fileRef.current?.click()}
          >
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
              <UploadCloud className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="font-bold text-lg mb-1">Drag & drop your file</div>
            <div className="text-sm text-muted-foreground mb-4">PDF, JPG, PNG · up to 20 MB</div>
            <Button className="gradient-primary border-0 font-semibold">Browse files</Button>
            <input ref={fileRef} type="file" accept=".pdf,image/*" hidden onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 border-border shadow-soft hover-lift cursor-pointer" onClick={() => toast('Camera scanner coming soon')}>
              <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center mb-2">
                <Camera className="w-5 h-5 text-accent" />
              </div>
              <div className="font-semibold text-sm">Scan with camera</div>
              <div className="text-xs text-muted-foreground">Live document capture</div>
            </Card>
            <Card className="p-4 border-border shadow-soft hover-lift cursor-pointer" onClick={() => fileRef.current?.click()}>
              <div className="w-10 h-10 rounded-xl bg-warning-light flex items-center justify-center mb-2">
                <FileText className="w-5 h-5 text-warning" />
              </div>
              <div className="font-semibold text-sm">From device</div>
              <div className="text-xs text-muted-foreground">Choose existing file</div>
            </Card>
          </div>
        </>
      )}

      {stage === 'review' && file && (
        <Card className="p-5 border-border shadow-soft space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/60">
            <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center shadow-sm">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{file.name}</div>
              <div className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</div>
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary-light px-2 py-1 rounded-full">
              <Sparkles className="w-3 h-3" /> Auto-detected
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">REPORT NAME</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">TYPE</Label>
            <Select
              value={type}
              onValueChange={(v) => {
                setType(v);
                if (!categoryEdited) {
                  const r = classifyDocument(`${name} ${file.name}`, v as RecordType);
                  setCategory(r.category);
                  setConfidence(r.confidence);
                }
              }}
            >
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="lab-report">Lab Report</SelectItem>
                <SelectItem value="prescription">Prescription</SelectItem>
                <SelectItem value="scan">Imaging / Scan</SelectItem>
                <SelectItem value="diagnosis">Diagnosis</SelectItem>
                <SelectItem value="discharge">Discharge Summary</SelectItem>
                <SelectItem value="note">Doctor Note</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-muted-foreground">CATEGORY</Label>
              {categoryEdited ? (
                <span className="text-[11px] font-semibold text-muted-foreground">Edited manually</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                  <Sparkles className="w-3 h-3" /> Auto-classified · {Math.round(confidence * 100)}%
                </span>
              )}
            </div>
            <Select value={category} onValueChange={(v) => { setCategory(v as RecordCategory); setCategoryEdited(true); }}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                {categoryOptions.map(c => (
                  <SelectItem key={c} value={c}>{categoryLabel[c]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="pt-1"><CategoryBadge category={category} showIcon={!categoryEdited} /></div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">TAGS</Label>
            <div className="flex gap-2">
              <Input
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="e.g. Cardiology"
                className="h-11"
              />
              <Button type="button" variant="outline" onClick={addTag}>Add</Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map(t => (
                  <Badge key={t} variant="secondary" className="gap-1 font-semibold">
                    {t}
                    <button onClick={() => setTags(tags.filter(x => x !== t))}><X className="w-3 h-3" /></button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => { setStage('pick'); setFile(null); }} className="flex-1">Cancel</Button>
            <Button onClick={finish} className="flex-1 gradient-primary border-0 font-semibold">
              <Check className="w-4 h-4 mr-1.5" /> Save to vault
            </Button>
          </div>
        </Card>
      )}

      {stage === 'done' && (
        <Card className="p-10 text-center border-border shadow-soft">
          <div className="w-16 h-16 rounded-2xl bg-success-light flex items-center justify-center mx-auto mb-4 animate-scale-in">
            <Check className="w-8 h-8 text-success" strokeWidth={3} />
          </div>
          <div className="font-bold text-lg">Saved!</div>
          <div className="text-sm text-muted-foreground mt-1">Redirecting to your records…</div>
        </Card>
      )}
    </div>
  );
};

export default Upload;