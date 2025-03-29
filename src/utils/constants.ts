
import { LeadStatus, LeadTag } from "@/types";

/**
 * Lead status options and their display properties
 */
export const LEAD_STATUSES: Record<LeadStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  new: {
    label: 'New Lead',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100'
  },
  contacted: {
    label: 'Contacted',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100'
  },
  demo: {
    label: 'Demo Given',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100'
  },
  proposal: {
    label: 'Proposal Sent',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100'
  },
  negotiation: {
    label: 'Negotiation',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100'
  },
  closed_won: {
    label: 'Closed (Won)',
    color: 'text-green-700',
    bgColor: 'bg-green-100'
  },
  closed_lost: {
    label: 'Closed (Lost)',
    color: 'text-red-700',
    bgColor: 'bg-red-100'
  }
};

/**
 * Industry options for leads
 */
export const INDUSTRY_OPTIONS = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Retail',
  'Real Estate',
  'Media',
  'Telecommunications',
  'Transportation',
  'Energy',
  'Hospitality',
  'Agriculture',
  'Construction',
  'Entertainment',
  'Food & Beverage',
  'Automotive',
  'Pharmaceuticals',
  'Consulting',
  'Other'
];

/**
 * Default lead tags
 */
export const DEFAULT_LEAD_TAGS: LeadTag[] = [
  { id: 'hot', name: 'Hot', color: 'bg-red-500' },
  { id: 'warm', name: 'Warm', color: 'bg-amber-500' },
  { id: 'cold', name: 'Cold', color: 'bg-blue-500' },
  { id: 'vip', name: 'VIP', color: 'bg-purple-500' },
  { id: 'returning', name: 'Returning', color: 'bg-green-500' },
  { id: 'referral', name: 'Referral', color: 'bg-indigo-500' }
];

/**
 * Lead score options
 */
export const LEAD_SCORE_OPTIONS = [
  { value: 1, label: '1 - Very Low' },
  { value: 2, label: '2 - Low' },
  { value: 3, label: '3 - Below Average' },
  { value: 4, label: '4 - Slightly Below Average' },
  { value: 5, label: '5 - Average' },
  { value: 6, label: '6 - Slightly Above Average' },
  { value: 7, label: '7 - Above Average' },
  { value: 8, label: '8 - High' },
  { value: 9, label: '9 - Very High' },
  { value: 10, label: '10 - Excellent' }
];

/**
 * Dashboard time period options
 */
export const TIME_PERIOD_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'thisWeek', label: 'This Week' },
  { value: 'lastWeek', label: 'Last Week' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'thisQuarter', label: 'This Quarter' },
  { value: 'lastQuarter', label: 'Last Quarter' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'lastYear', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' }
];
