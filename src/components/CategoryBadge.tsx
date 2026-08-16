import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { RecordCategory } from '@/types';
import { categoryLabel } from '@/lib/classify';

const tone: Record<RecordCategory, string> = {
  cardiology: 'bg-destructive/10 text-destructive',
  radiology: 'bg-primary/10 text-primary',
  pathology: 'bg-accent/10 text-accent',
  endocrinology: 'bg-warning-light text-warning',
  pulmonology: 'bg-primary/10 text-primary',
  orthopedics: 'bg-secondary text-foreground',
  dermatology: 'bg-warning-light text-warning',
  pediatrics: 'bg-success-light text-success',
  general: 'bg-secondary text-foreground',
  uncategorized: 'bg-muted text-muted-foreground',
};

export const CategoryBadge = ({
  category,
  showIcon = false,
  className = '',
}: { category?: RecordCategory; showIcon?: boolean; className?: string }) => {
  if (!category) return null;
  return (
    <Badge className={`border-0 text-[10px] font-semibold gap-1 ${tone[category]} ${className}`}>
      {showIcon && <Sparkles className="w-2.5 h-2.5" />}
      {categoryLabel[category]}
    </Badge>
  );
};

export default CategoryBadge;