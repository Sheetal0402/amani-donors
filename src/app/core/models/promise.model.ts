export interface Promise {
  id: string;
  title: string;
  description: string;
  amount?: number;
  currency?: string;
  category: 'financial' | 'volunteer' | 'resource' | 'advocacy' | 'other';
  status: 'pending' | 'in-progress' | 'fulfilled' | 'cancelled';
  dueDate?: Date;
  fulfilledAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}
