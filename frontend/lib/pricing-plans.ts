import { apiClient } from './api';

export interface PricingPlan {
  _id?: string;
  name: string;
  slug: string;
  key?: string;
  priceMonthly: number;
  originalPrice?: number;
  offerBadge?: string;
  studentLimit?: string;
  maxStudents: number;
  maxBranches: number;
  description?: string;
  features: string[];
  popular?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export const DEFAULT_PLANS: PricingPlan[] = [
  {
    name: 'Starter Tier',
    slug: 'STARTER',
    priceMonthly: 999,
    originalPrice: 1499,
    offerBadge: 'Save 33%',
    studentLimit: 'Up to 400 Students',
    maxStudents: 400,
    maxBranches: 2,
    description: 'Perfect for local coaching classes & independent single-branch academies.',
    features: [
      'Up to 1 Branch + Main Branch (Total 2 Branches)',
      'Atomic FIFO Fee Engine',
      'Student Roster & Contact Profiles (Up to 400)',
      'Basic Financial & Fee Reports',
      'Digital Canvas Receipt Generation',
      'Printable Student ID Card PDF',
      'Standard Subdomain',
      'Standard Email Support',
    ],
    popular: false,
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Professional Tier',
    slug: 'PROFESSIONAL',
    priceMonthly: 2999,
    originalPrice: 3999,
    offerBadge: 'Most Popular',
    studentLimit: 'Up to 1,500 Students',
    maxStudents: 1500,
    maxBranches: 6,
    description: 'Ideal for growing academies needing full academic batch management & analytics.',
    features: [
      'All Starter Tier Features (Up to 1,500 Students)',
      'Up to 5 Branches + Main Branch (Total 6 Branches)',
      'Academics & Batch Stream Locks (Science/Commerce/Arts)',
      'Multiple Batch Schedules (Morning/Afternoon)',
      'Advance Credit Balance Auto-Settlement',
      'Instant WhatsApp Receipt Sharing',
      'Custom Primary Brand Color & Logo',
      'Audit-Ready Financial Statements PDF',
      'Priority WhatsApp & Phone Support',
    ],
    popular: true,
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'Enterprise Tier',
    slug: 'ENTERPRISE',
    priceMonthly: 7999,
    originalPrice: 9999,
    offerBadge: 'Full Scalability',
    studentLimit: 'Unlimited Students',
    maxStudents: -1,
    maxBranches: 13,
    description: 'For large educational chains requiring custom domain aliases & master admin inspection.',
    features: [
      'All Professional Tier Features (Unlimited Students)',
      'Up to 12 Branches + Main Branch (Total 13 Branches)',
      'Multi-Branch Scoping & Consolidated Reports',
      'Platform Admin Master Console',
      'Custom Subdomain & Primary Color Branding',
      'Dedicated Account Manager & 24/7 SLA Support',
      'Raw Data Export & Bulk Imports',
    ],
    popular: false,
    isActive: true,
    sortOrder: 3,
  },
];

export async function fetchPublicPlans(): Promise<PricingPlan[]> {
  try {
    const res = await apiClient.get('/platform/public/pricing-plans');
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return DEFAULT_PLANS;
  } catch (err) {
    return DEFAULT_PLANS;
  }
}

export async function fetchPublicBanner(): Promise<{ isEnabled: boolean; text?: string; couponCode?: string; badgeText?: string }> {
  try {
    const res = await apiClient.get('/platform/public/banner');
    return res.data || { isEnabled: false };
  } catch (err) {
    return { isEnabled: false };
  }
}
