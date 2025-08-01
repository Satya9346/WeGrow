export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
  lastLogin?: Date | null;
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
}

export interface ExamApplication {
  id: string;
  examId: string;
  userId: string;
  appliedAt: Date;
  status: 'pending' | 'applied' | 'completed';
}

export interface Doubt {
  id: string;
  userId: string;
  subject: string;
  question: string;
  imageUrl?: string;
  status: 'pending' | 'answered' | 'resolved';
  createdAt: Date;
  answeredAt?: Date | null;
  answer?: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: string;
  createdAt: Date;
}

export interface UserStats {
  userId: string;
  tasksCompleted: number;
  currentStreak: number;
  longestStreak: number;
  doubtsSubmitted: number;
  doubtsResolved: number;
  lastActivity: Date;
}