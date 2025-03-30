
export interface ContactDetail {
  id: string;
  type: 'email' | 'phone' | 'address' | 'website' | 'social';
  value: string;
  label?: string; // e.g., "Work", "Personal", "Mobile"
  isPrimary?: boolean;
  socialPlatform?: 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'other';
}
