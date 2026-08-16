import { RecordCategory, RecordType } from '@/types';

export const categoryLabel: Record<RecordCategory, string> = {
  cardiology: 'Cardiology',
  radiology: 'Radiology',
  pathology: 'Pathology',
  endocrinology: 'Endocrinology',
  pulmonology: 'Pulmonology',
  orthopedics: 'Orthopedics',
  dermatology: 'Dermatology',
  pediatrics: 'Pediatrics',
  general: 'General Medicine',
  uncategorized: 'Uncategorized',
};

export const categoryOptions = Object.keys(categoryLabel) as RecordCategory[];

const keywordMap: { category: RecordCategory; words: string[] }[] = [
  { category: 'cardiology', words: ['ecg', 'ekg', 'echo', 'lipid', 'cholesterol', 'cardiac', 'bp', 'hypertension', 'heart'] },
  { category: 'radiology', words: ['xray', 'x-ray', 'mri', 'ct', 'scan', 'ultrasound', 'sonography', 'imaging'] },
  { category: 'pathology', words: ['cbc', 'blood', 'urine', 'biopsy', 'culture', 'lab', 'pathology', 'hemoglobin'] },
  { category: 'endocrinology', words: ['thyroid', 'tsh', 'diabetes', 'hba1c', 'glucose', 'insulin', 'hormone'] },
  { category: 'pulmonology', words: ['lung', 'chest', 'asthma', 'spirometry', 'pulmonary', 'cough'] },
  { category: 'orthopedics', words: ['bone', 'fracture', 'ortho', 'spine', 'knee', 'joint'] },
  { category: 'dermatology', words: ['skin', 'derma', 'rash', 'acne'] },
  { category: 'pediatrics', words: ['vaccine', 'vaccination', 'immunization', 'pediatric', 'child'] },
];

const typeFallback: Record<RecordType, RecordCategory> = {
  'lab-report': 'pathology',
  scan: 'radiology',
  prescription: 'general',
  diagnosis: 'general',
  discharge: 'general',
  note: 'general',
  other: 'uncategorized',
};

/** Mock on-device classifier: infers a clinical category from filename/title + type. */
export const classifyDocument = (
  text: string,
  type: RecordType = 'other',
): { category: RecordCategory; confidence: number } => {
  const lower = text.toLowerCase();
  let best: { category: RecordCategory; hits: number } | null = null;
  for (const { category, words } of keywordMap) {
    const hits = words.filter(w => lower.includes(w)).length;
    if (hits > 0 && (!best || hits > best.hits)) best = { category, hits };
  }
  if (best) return { category: best.category, confidence: Math.min(0.98, 0.72 + best.hits * 0.09) };
  return { category: typeFallback[type], confidence: type === 'other' ? 0.42 : 0.66 };
};