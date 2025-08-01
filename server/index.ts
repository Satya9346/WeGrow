import express, { Request, Response } from 'express';
import cors from 'cors';
import { db } from './src/database';
import { Collection } from 'mongodb';
import { User } from './src/types';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS
app.use(express.json());

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const authenticatedUser = await db.authenticateUser(username, password);
    if (authenticatedUser) {
      res.json(authenticatedUser);
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { id, username, email, password } = req.body; // Removed 'role' from destructuring
  try {
    // Check if user already exists (username or email)
    const usersCollection: Collection<User> = db.getDb().collection('users');
    const existingUserByUsername = await usersCollection.findOne({ username: username });
    const existingUserByEmail = await usersCollection.findOne({ email: email });

    if (existingUserByUsername) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    if (existingUserByEmail) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Always register new users with the 'user' role
    await db.createUser({ id, username, email, password, role: 'user' });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/doubts', async (req: Request, res: Response) => {
  const doubtData = req.body;
  try {
    // Type assertion for doubtData as Omit<Doubt, 'id' | 'createdAt' | 'answeredAt' | 'answer'>
    await db.createDoubt(doubtData);
    res.status(201).json({ message: 'Doubt submitted successfully' });
  } catch (error) {
    console.error('Create doubt API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/tasks', async (req: Request, res: Response) => {
  const userId = req.query.userId as string | undefined;
  try {
    const tasks = await db.getTasks(userId);
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/tasks', async (req: Request, res: Response) => {
  const taskData = req.body;
  try {
    // Type assertion for taskData as Omit<Task, 'id' | 'createdAt' | 'completedAt'>
    await db.createTask(taskData);
    res.status(201).json({ message: 'Task created successfully' });
  } catch (error) {
    console.error('Create task API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/tasks/:taskId/status', async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { newStatus } = req.body; // Changed from { completed } to { newStatus }
  try {
    await db.updateTaskStatus(taskId, newStatus); // Pass newStatus directly
    res.json({ message: 'Task status updated successfully' });
  } catch (error) {
    console.error('Update task status API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/tasks/:taskId', async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const updates = req.body; // Partial<Task>
  try {
    await db.updateTask(taskId, updates);
    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Update task API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/tasks/:taskId', async (req: Request, res: Response) => {
  const { taskId } = req.params;
  try {
    await db.deleteTask(taskId);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/doubts', async (req: Request, res: Response) => {
  const userId = req.query.userId as string | undefined;
  try {
    const doubts = await db.getDoubts(userId);
    res.json(doubts);
  } catch (error) {
    console.error('Get doubts API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/exams', async (req: Request, res: Response) => {
  try {
    const exams = await db.getExams();
    res.json(exams);
  } catch (error) {
    console.error('Get exams API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/exams', async (req: Request, res: Response) => {
  const examData = req.body;
  try {
    // Type assertion for examData as Omit<Exam, 'id' | 'createdAt'>
    await db.createExam(examData);
    res.status(201).json({ message: 'Exam created successfully' });
  } catch (error) {
    console.error('Create exam API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/exams/:examId', async (req: Request, res: Response) => {
  const { examId } = req.params;
  const updates = req.body; // Partial<Exam>
  try {
    await db.updateExam(examId, updates);
    res.json({ message: 'Exam updated successfully' });
  } catch (error) {
    console.error('Update exam API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/exams/:examId', async (req: Request, res: Response) => {
  const { examId } = req.params;
  try {
    await db.deleteExam(examId);
    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    console.error('Delete exam API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/user-stats/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const userStats = await db.getUserStats(userId);
    if (userStats) {
      res.json(userStats);
    } else {
      res.status(404).json({ message: 'User stats not found' });
    }
  } catch (error) {
    console.error('Get user stats API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/exam-applications', async (req: Request, res: Response) => {
  const { examId, userId, status } = req.body;
  try {
    await db.applyForExam(examId, userId, status);
    res.status(201).json({ message: 'Exam application received successfully' });
  } catch (error) {
    console.error('Exam application API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/exam-applications/:examId/:userId', async (req: Request, res: Response) => {
  const { examId, userId } = req.params;
  try {
    const application = await db.getExamApplicationStatus(examId, userId);
    res.json({ applied: !!application, status: application ? application.status : '' });
  } catch (error) {
    console.error('Get exam application status API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const usersCollection: Collection<User> = db.getDb().collection('users');
    // Only fetch necessary user data for assignment dropdown (e.g., id, username)
    const users = await usersCollection.find({}, { projection: { id: 1, username: 1 } }).toArray();
    res.json(users);
  } catch (error) {
    console.error('Get users API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/doubts/:doubtId/answer', async (req: Request, res: Response) => {
  const { doubtId } = req.params;
  const { answer } = req.body;
  try {
    await db.answerDoubt(doubtId, answer);
    res.json({ message: 'Doubt answered successfully' });
  } catch (error) {
    console.error('Answer doubt API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/doubts/:doubtId', async (req: Request, res: Response) => {
  const { doubtId } = req.params;
  try {
    await db.deleteDoubt(doubtId);
    res.json({ message: 'Doubt deleted successfully' });
  } catch (error) {
    console.error('Delete doubt API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/', (req: Request, res: Response) => {
  res.send('Backend server is running!');
});

// Add your API routes here that will interact with the database
// Example: app.post('/api/users', async (req, res) => { /* ... */ });

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  // Ensure database connection is established on server start
  // The db.connect() is called in the Database constructor
});