export interface StandardOption {
  standard: number;
  label: string;       // e.g. "Day Care", "Playgroup", "Nursery", "Jr KG", "Sr KG", "1st", "10th"
  fullLabel: string;   // e.g. "Day Care (Pre-School)", "Jr. KG (Junior Kindergarten)", "Std 10th (Secondary)"
  category: 'kindergarten' | 'primary' | 'middle' | 'secondary' | 'higher_secondary' | 'degree';
}

export const ALL_ACADEMIC_LEVELS = [
  'Kindergarten / Pre-Primary',
  'Primary School',
  'Mid Primary',
  'High School',
  'Jr. College (Science)',
  'Jr. College (Commerce)',
  'Jr. College (Arts)',
  'Under Graduate (UG)',
  'Other / Coaching',
] as const;

export const ALL_STANDARDS: StandardOption[] = [
  // Kindergarten & Pre-Primary
  { standard: -4, label: 'Day Care', fullLabel: 'Day Care (Infant & Toddler Care)', category: 'kindergarten' },
  { standard: -3, label: 'Playgroup', fullLabel: 'Playgroup (Toddlers / Pre-Nursery)', category: 'kindergarten' },
  { standard: -2, label: 'Nursery', fullLabel: 'Nursery (Early Foundation)', category: 'kindergarten' },
  { standard: -1, label: 'Jr KG', fullLabel: 'Jr. KG (Junior Kindergarten / LKG)', category: 'kindergarten' },
  { standard: 0, label: 'Sr KG', fullLabel: 'Sr. KG (Senior Kindergarten / UKG)', category: 'kindergarten' },

  // Primary School (1st - 5th)
  { standard: 1, label: '1st', fullLabel: 'Std 1st (Primary School)', category: 'primary' },
  { standard: 2, label: '2nd', fullLabel: 'Std 2nd (Primary School)', category: 'primary' },
  { standard: 3, label: '3rd', fullLabel: 'Std 3rd (Primary School)', category: 'primary' },
  { standard: 4, label: '4th', fullLabel: 'Std 4th (Primary School)', category: 'primary' },
  { standard: 5, label: '5th', fullLabel: 'Std 5th (Primary School)', category: 'primary' },

  // Middle School (6th - 8th)
  { standard: 6, label: '6th', fullLabel: 'Std 6th (Middle School)', category: 'middle' },
  { standard: 7, label: '7th', fullLabel: 'Std 7th (Middle School)', category: 'middle' },
  { standard: 8, label: '8th', fullLabel: 'Std 8th (Middle School)', category: 'middle' },

  // High School (9th - 10th)
  { standard: 9, label: '9th', fullLabel: 'Std 9th (High School / SSC)', category: 'secondary' },
  { standard: 10, label: '10th', fullLabel: 'Std 10th (SSC Board Exam)', category: 'secondary' },

  // Junior College (11th - 12th)
  { standard: 11, label: '11th', fullLabel: 'Std 11th (Junior College / HSC)', category: 'higher_secondary' },
  { standard: 12, label: '12th', fullLabel: 'Std 12th (HSC Board / Sci/Com/Arts)', category: 'higher_secondary' },

  // Undergraduate / Degree (13th - 15th)
  { standard: 13, label: '13th', fullLabel: 'Std 13th (FY Degree / College)', category: 'degree' },
  { standard: 14, label: '14th', fullLabel: 'Std 14th (SY Degree / College)', category: 'degree' },
  { standard: 15, label: '15th', fullLabel: 'Std 15th (TY Degree / Graduation)', category: 'degree' },
];

export function formatStandard(std: number | string | undefined | null): string {
  if (std === undefined || std === null || std === '') return '10th';
  const num = typeof std === 'number' ? std : Number(std);
  if (isNaN(num)) return String(std);

  switch (num) {
    case -4:
      return 'Day Care';
    case -3:
      return 'Playgroup';
    case -2:
      return 'Nursery';
    case -1:
      return 'Jr KG';
    case 0:
      return 'Sr KG';
    case 1:
      return '1st';
    case 2:
      return '2nd';
    case 3:
      return '3rd';
    default:
      if (num >= 4 && num <= 15) return `${num}th`;
      return `${num}`;
  }
}

export function formatStandardFull(std: number | string | undefined | null): string {
  if (std === undefined || std === null || std === '') return 'Std 10th';
  const num = typeof std === 'number' ? std : Number(std);
  if (isNaN(num)) return String(std);

  switch (num) {
    case -4:
      return 'Day Care';
    case -3:
      return 'Playgroup';
    case -2:
      return 'Nursery';
    case -1:
      return 'Jr. KG';
    case 0:
      return 'Sr. KG';
    case 1:
      return 'Std 1st';
    case 2:
      return 'Std 2nd';
    case 3:
      return 'Std 3rd';
    default:
      if (num >= 4 && num <= 15) return `Std ${num}th`;
      return `Std ${num}`;
  }
}

export function parseStandardString(input: any): number {
  if (typeof input === 'number') return input;
  const str = String(input || '').toLowerCase().trim();
  if (str.includes('day care') || str.includes('daycare')) return -4;
  if (str.includes('play') || str.includes('pg')) return -3;
  if (str.includes('nurs')) return -2;
  if (str.includes('jr') || str.includes('junior') || str.includes('lkg')) return -1;
  if (str.includes('sr') || str.includes('senior') || str.includes('ukg') || str === 'kg') return 0;
  const num = parseInt(str.replace(/[^0-9-]/g, ''), 10);
  return isNaN(num) ? 10 : num;
}

export function getStandardsForAcademicLevels(types?: string[]): number[] {
  if (!types || types.length === 0) {
    return [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  }

  const stds = new Set<number>();
  types.forEach((typeStr) => {
    const t = typeStr.toLowerCase();
    if (t.includes('kindergarten') || t.includes('pre-primary') || t.includes('day care') || t.includes('nursery')) {
      [-4, -3, -2, -1, 0].forEach((s) => stds.add(s));
    }
    if (t.includes('primary school')) {
      [1, 2, 3, 4, 5].forEach((s) => stds.add(s));
    }
    if (t.includes('mid primary') || t.includes('middle school')) {
      [6, 7, 8].forEach((s) => stds.add(s));
    }
    if (t.includes('high school')) {
      [9, 10].forEach((s) => stds.add(s));
    }
    if (t.includes('jr. college') || t.includes('junior college') || t.includes('higher secondary')) {
      [11, 12].forEach((s) => stds.add(s));
    }
    if (t.includes('under graduate') || t.includes('degree') || t.includes('ug')) {
      [13, 14, 15].forEach((s) => stds.add(s));
    }
    if (t.includes('other') || t.includes('coaching')) {
      [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].forEach((s) => stds.add(s));
    }
  });

  if (stds.size === 0) {
    return [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  }

  return Array.from(stds).sort((a, b) => a - b);
}
