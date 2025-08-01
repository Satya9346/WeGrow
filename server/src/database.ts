import { MongoClient, Collection } from 'mongodb';
import type { User, Task, Exam, Doubt, StudyMaterial, UserStats, ExamApplication } from './types/index';

const MONGODB_URI = 'mongodb+srv://pittalasatya5:STrgzhYmi3HLu0Nd@wegrow.hholgmu.mongodb.net/?retryWrites=true&w=majority&appName=wegrow';
const DB_NAME = 'wegrow'; // Assuming your database name is 'wegrow' from the connection string

class Database {
  private client: MongoClient;
  private db: any; // Using any for now, will type later

  public getDb() {
    return this.db;
  }

  constructor() {
    this.client = new MongoClient(MONGODB_URI);
    this.connect();
  }

  private async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db(DB_NAME);
      console.log('Connected to MongoDB Atlas!');
      await this.initializeCollections();
    } catch (error) {
      console.error('Failed to connect to MongoDB Atlas:', error);
      process.exit(1); // Exit if database connection fails
    }
  }

  private async initializeCollections() {
    const collections = ['users', 'tasks', 'exams', 'exam_applications', 'doubts', 'study_materials', 'user_stats'];
    for (const collectionName of collections) {
      await this.db.createCollection(collectionName).catch(() => {}); // Create collection if it doesn't exist, ignore error if it does
    }

    // Insert default admin user
    await this.createUser({
      id: 'admin-1',
      username: 'admin',
      email: 'admin@wegrow.com',
      password: 'admin123',
      role: 'admin'
    });

    // Insert sample user
    await this.createUser({
      id: 'user-1',
      username: 'student1',
      email: 'student1@wegrow.com',
      password: 'student123',
      role: 'user'
    });
  }

  async createUser(user: Omit<User, 'createdAt' | 'lastLogin'> & { password: string }) {
    try {
      const usersCollection: Collection<User> = this.db.collection('users');
      await usersCollection.updateOne(
        { id: user.id },
        { $setOnInsert: { ...user, createdAt: new Date(), lastLogin: new Date() } },
        { upsert: true }
      );
      
      const userStatsCollection: Collection<UserStats> = this.db.collection('user_stats');
      await userStatsCollection.updateOne(
        { user_id: user.id },
        { $setOnInsert: { userId: user.id, tasksCompleted: 0, currentStreak: 0, longestStreak: 0, doubtsSubmitted: 0, doubtsResolved: 0, lastActivity: new Date() } },
        { upsert: true }
      );
    } catch (error) {
      console.error('Error creating user:', error);
    }
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    try {
      const usersCollection: Collection<User> = this.db.collection('users');
      const user = await usersCollection.findOne({ username: username, password: password });
      if (user) {
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        };
      }
      return null;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  async getTasks(userId?: string): Promise<Task[]> {
    try {
      const tasksCollection: Collection<Task> = this.db.collection('tasks');
      let query: any = {};
      if (userId) {
        query = { $or: [{ assignedTo: null }, { assignedTo: userId }] };
      }
      const tasks = await tasksCollection.find(query).sort({ dueDate: 1 }).toArray();

      const now = new Date();
      const updatedTasks: Task[] = [];

      for (const task of tasks) {
        console.log(`Processing task: ${task.title}, DueDate (raw): ${task.dueDate}, Status: ${task.status}`);
        const taskDueDate = new Date(task.dueDate); // Convert to Date object for comparison
        console.log(`Converted DueDate: ${taskDueDate}, Current Time: ${now}`);
        if (task.status === 'pending' && taskDueDate < now) {
          // Mark as missed if deadline passed and still pending
          console.log(`Task ${task.title} is missed! Updating status.`);
          await tasksCollection.updateOne(
            { id: task.id },
            { $set: { status: 'missed' } }
          );
          updatedTasks.push({ ...task, status: 'missed' });
        } else {
          updatedTasks.push(task);
        }
      }
      
      return updatedTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        dueDate: new Date(task.dueDate),
        status: task.status, // Use the new status field
        assignedTo: task.assignedTo,
        assignedBy: task.assignedBy,
        createdAt: new Date(task.createdAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : null
      }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'status'>): Promise<void> {
    try {
      const tasksCollection: Collection<Task> = this.db.collection('tasks');
      const id = Date.now().toString();
      await tasksCollection.insertOne({ ...task, id: id, createdAt: new Date(), status: 'pending' });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    try {
      const tasksCollection: Collection<Task> = this.db.collection('tasks');
      await tasksCollection.updateOne({ id: taskId }, { $set: updates });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  async updateTaskStatus(taskId: string, newStatus: 'pending' | 'completed'): Promise<void> {
    try {
      const tasksCollection: Collection<Task> = this.db.collection('tasks');
      await tasksCollection.updateOne(
        { id: taskId },
        { $set: { status: newStatus, completedAt: newStatus === 'completed' ? new Date() : null } }
      );
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      const tasksCollection: Collection<Task> = this.db.collection('tasks');
      await tasksCollection.deleteOne({ id: taskId });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  async getExams(): Promise<Exam[]> {
    try {
      const examsCollection: Collection<Exam> = this.db.collection('exams');
      const exams = await examsCollection.find({}).sort({ examDate: 1 }).toArray();
      return exams.map(exam => ({
        id: exam.id,
        name: exam.name,
        examDate: new Date(exam.examDate),
        applicationDeadline: new Date(exam.applicationDeadline),
        category: exam.category,
        description: exam.description,
        createdAt: new Date(exam.createdAt)
      }));
    } catch (error) {
      console.error('Error fetching exams:', error);
      return [];
    }
  }

  async createExam(exam: Omit<Exam, 'id' | 'createdAt'>): Promise<void> {
    try {
      const examsCollection: Collection<Exam> = this.db.collection('exams');
      const id = Date.now().toString();
      await examsCollection.insertOne({ ...exam, id: id, createdAt: new Date() });
    } catch (error) {
      console.error('Error creating exam:', error);
    }
  }

  async updateExam(examId: string, updates: Partial<Exam>): Promise<void> {
    try {
      const examsCollection: Collection<Exam> = this.db.collection('exams');
      await examsCollection.updateOne({ id: examId }, { $set: updates });
    } catch (error) {
      console.error('Error updating exam:', error);
    }
  }

  async deleteExam(examId: string): Promise<void> {
    try {
      const examsCollection: Collection<Exam> = this.db.collection('exams');
      await examsCollection.deleteOne({ id: examId });
    } catch (error) {
      console.error('Error deleting exam:', error);
    }
  }

  async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const userStatsCollection: Collection<UserStats> = this.db.collection('user_stats');
      const stats = await userStatsCollection.findOne({ userId: userId });
      if (stats) {
        return {
          userId: stats.userId,
          tasksCompleted: stats.tasksCompleted,
          currentStreak: stats.currentStreak,
          longestStreak: stats.longestStreak,
          doubtsSubmitted: stats.doubtsSubmitted,
          doubtsResolved: stats.doubtsResolved,
          lastActivity: new Date(stats.lastActivity)
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }

  async createDoubt(doubt: Omit<Doubt, 'id' | 'createdAt' | 'answeredAt' | 'answer'>): Promise<void> {
    try {
      const doubtsCollection: Collection<Doubt> = this.db.collection('doubts');
      const id = Date.now().toString();
      await doubtsCollection.insertOne({ ...doubt, id: id, createdAt: new Date(), status: doubt.status || 'pending' });

      const userStatsCollection: Collection<UserStats> = this.db.collection('user_stats');
      await userStatsCollection.updateOne(
        { userId: doubt.userId },
        { $inc: { doubtsSubmitted: 1 }, $set: { lastActivity: new Date() } }
      );
    } catch (error) {
      console.error('Error creating doubt:', error);
    }
  }

  async getDoubts(userId?: string): Promise<Doubt[]> {
    try {
      const doubtsCollection: Collection<Doubt> = this.db.collection('doubts');
      let query: any = {};
      if (userId) {
        query = { userId: userId };
      }
      const doubts = await doubtsCollection.find(query).sort({ createdAt: -1 }).toArray();
      return doubts.map(doubt => ({
        id: doubt.id,
        userId: doubt.userId,
        subject: doubt.subject,
        question: doubt.question,
        imageUrl: doubt.imageUrl,
        status: doubt.status,
        createdAt: new Date(doubt.createdAt),
        answeredAt: doubt.answeredAt ? new Date(doubt.answeredAt) : undefined,
        answer: doubt.answer
      }));
    } catch (error) {
      console.error('Error fetching doubts:', error);
      return [];
    }
  }

  async answerDoubt(doubtId: string, answer: string): Promise<void> {
    try {
      const doubtsCollection: Collection<Doubt> = this.db.collection('doubts');
      await doubtsCollection.updateOne(
        { id: doubtId },
        { $set: { answer: answer, answeredAt: new Date(), status: 'answered' } }
      );
    } catch (error) {
      console.error('Error answering doubt:', error);
    }
  }

  async deleteDoubt(doubtId: string): Promise<void> {
    try {
      const doubtsCollection: Collection<Doubt> = this.db.collection('doubts');
      await doubtsCollection.deleteOne({ id: doubtId });
    } catch (error) {
      console.error('Error deleting doubt:', error);
    }
  }

  async applyForExam(examId: string, userId: string, status: ExamApplication['status']): Promise<void> {
    try {
      const examApplicationsCollection: Collection<ExamApplication> = this.db.collection('exam_applications');
      await examApplicationsCollection.updateOne(
        { examId, userId },
        { $set: { status, appliedAt: new Date(), id: `${examId}-${userId}` } },
        { upsert: true }
      );
    } catch (error) {
      console.error('Error applying for exam:', error);
    }
  }

  async getExamApplicationStatus(examId: string, userId: string): Promise<ExamApplication | null> {
    try {
      const examApplicationsCollection: Collection<ExamApplication> = this.db.collection('exam_applications');
      const application = await examApplicationsCollection.findOne({ examId, userId });
      return application;
    } catch (error) {
      console.error('Error getting exam application status:', error);
      return null;
    }
  }
}

export const db = new Database();