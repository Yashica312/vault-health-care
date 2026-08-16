export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatDateShort = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const daysAgo = (iso: string) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 30) return `${diff} days ago`;
  if (diff < 365) return `${Math.floor(diff / 30)} mo ago`;
  return `${Math.floor(diff / 365)} yr ago`;
};

export const recordTypeLabel: Record<string, string> = {
  prescription: 'Prescription',
  'lab-report': 'Lab Report',
  scan: 'Imaging',
  discharge: 'Discharge',
  diagnosis: 'Diagnosis',
  note: 'Doctor Note',
  other: 'Other',
};