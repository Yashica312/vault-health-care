import { describe, expect, it } from 'vitest';
import { classifyDocument } from './lib/classify';
import { recordTypeLabel } from './lib/format';

describe('Vault Health utility checks', () => {
  it('classifies clinical documents using real Vault Health logic', () => {
    const cardiologyResult = classifyDocument('ECG stress test with cholesterol follow-up', 'lab-report');
    const pathologyResult = classifyDocument('CBC and blood culture results', 'lab-report');

    expect(cardiologyResult.category).toBe('cardiology');
    expect(cardiologyResult.confidence).toBeGreaterThan(0.7);
    expect(pathologyResult.category).toBe('pathology');
    expect(recordTypeLabel['lab-report']).toBe('Lab Report');
    expect(recordTypeLabel['scan']).toBe('Imaging');
  });
});
