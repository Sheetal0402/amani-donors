export interface Trip {
  id: string;
  title: string;
  description: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'active' | 'completed';
  checklist: ChecklistItem[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: 'travel' | 'preparation' | 'documentation' | 'health' | 'other';
  isCompleted: boolean;
  dueDate?: Date;
  completedAt?: Date;
  priority: 'low' | 'medium' | 'high';
}
