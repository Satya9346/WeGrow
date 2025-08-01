export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
  lastLogin?: Date | null;
}

export interface Exam {
  id: string;
  name: string;
  examDate: Date;
  applicationDeadline: Date;
  category: string;
  description?: string;
  applicationLink?: string; // New field for application link
  createdAt: Date;
  applications?: ExamApplication[];
  isApplied?: boolean; // Added for frontend display status
  applicationStatus?: string; // Added for frontend display status
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  status: 'pending' | 'completed' | 'missed'; // Changed from `completed: boolean`
  assignedTo?: string; // user ID for individual tasks, null for broadcast
  assignedBy: string; // admin ID
  createdAt: Date;
  completedAt?: Date | null;
}