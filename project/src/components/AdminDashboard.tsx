import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TaskCard from './TaskCard';
import type { Task, Exam, Doubt } from '../types.ts';
import {
  Users,
  CheckSquare,
  Calendar,
  HelpCircle,
  Plus,
  LogOut,
  BookOpen
} from 'lucide-react';

const API_BASE_URL = 'https://wegrow-backend-w4ey.onrender.com/api';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [users, setUsers] = useState<{ id: string; username: string }[]>([]); // New state for users
  const [activeTab, setActiveTab] = useState('overview');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [tasksResponse, examsResponse, doubtsResponse, usersResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/tasks`),
        fetch(`${API_BASE_URL}/exams`),
        fetch(`${API_BASE_URL}/doubts`),
        fetch(`${API_BASE_URL}/users`)
      ]);

      const allTasks: Task[] = await tasksResponse.json();
      const allExams: Exam[] = await examsResponse.json();
      const allDoubts: Doubt[] = await doubtsResponse.json();
      const allUsers: { id: string; username: string }[] = await usersResponse.json();
      
      setTasks(allTasks);
      setExams(allExams);
      setDoubts(allDoubts);
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'tasks', label: 'Task Management', icon: CheckSquare },
    { id: 'exams', label: 'Exam Management', icon: Calendar },
    { id: 'doubts', label: 'Doubts', icon: HelpCircle },
    { id: 'content', label: 'Content', icon: BookOpen }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">WEGROW Admin</h1>
              <p className="text-sm text-gray-600">Administrative Dashboard</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <CheckSquare className="w-6 h-6 text-red-600" /> {/* Using CheckSquare as a placeholder, ideally XCircle or similar */}
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Missed Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.filter(task => task.status === 'missed').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Upcoming Exams</p>
                <p className="text-2xl font-bold text-gray-900">{exams.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <HelpCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending Doubts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {doubts.filter(d => d.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Students</p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <>
              <div className="space-y-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">System Overview</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Recent Activity</h3>
                      <p className="text-gray-600">System is running smoothly with active user engagement.</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Quick Actions</h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setActiveTab('tasks');
                            setShowTaskForm(true);
                          }}
                          className="block w-full text-left px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Create New Task
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('exams');
                            setShowExamForm(true);
                          }}
                          className="block w-full text-left px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          Add Exam Date
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Missed Tasks Overview by User */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-red-600 mb-4">Missed Tasks by User</h3>
                {users.length > 0 ? (
                  <div className="space-y-4">
                    {users.map(user => {
                      const userMissedTasks = tasks.filter(task => task.status === 'missed' && task.assignedTo === user.id);

                      return (
                        <div key={user.id} className="bg-red-50 rounded-lg p-4 border border-red-200">
                          <h4 className="font-medium text-red-800 mb-2">{user.username}</h4>
                          {userMissedTasks.length > 0 ? (
                            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                              {userMissedTasks.map(task => (
                                <li key={task.id}>{task.title} (Due: {new Date(task.dueDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })})</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-red-700">No missed tasks for this user.</p>
                          )}
                        </div>
                      );
                    })}
                    {tasks.filter(task => task.status === 'missed' && !task.assignedTo).length > 0 && (
                      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <h4 className="font-medium text-red-800 mb-2">Unassigned (Broadcast) Missed Tasks</h4>
                        <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                          {tasks.filter(task => task.status === 'missed' && !task.assignedTo).map(task => (
                            <li key={task.id}>{task.title} (Due: {new Date(task.dueDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })})</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600">No users available to display missed tasks.</p>
                )}
              </div>
            </>
          )}

          {activeTab === 'tasks' && (
            <TaskManagement
              tasks={tasks}
              showForm={showTaskForm}
              onShowForm={setShowTaskForm}
              onUpdate={loadAdminData}
              users={users} // Pass users to TaskManagement
            />
          )}

          {activeTab === 'exams' && (
            <ExamManagement
              exams={exams}
              showForm={setShowExamForm} // Pass setShowExamForm to ExamManagement
              onShowForm={(show, exam) => {
                setShowExamForm(show);
                if (exam) {
                  setFormData({
                    id: exam.id,
                    name: exam.name,
                    examDate: new Date(exam.examDate).toISOString().slice(0, 16),
                    applicationDeadline: new Date(exam.applicationDeadline).toISOString().slice(0, 16),
                    category: exam.category,
                    description: exam.description || '',
                    applicationLink: exam.applicationLink || ''
                  });
                } else {
                  setFormData({
                    id: '',
                    name: '',
                    examDate: '',
                    applicationDeadline: '',
                    category: '',
                    description: '',
                    applicationLink: ''
                  });
                }
              }}
              onUpdate={loadAdminData}
            />
          )}

          {activeTab === 'doubts' && (
            <DoubtsManagement doubts={doubts} onUpdate={loadAdminData} />
          )}

          {activeTab === 'content' && (
            <ContentManagement />
          )}
        </div>
      </div>
    </div>
  );
}

// Task Management Component
function TaskManagement({
  tasks,
  showForm,
  onShowForm,
  onUpdate,
  users // Receive users prop
}: {
  tasks: Task[];
  showForm: boolean;
  onShowForm: (show: boolean, task?: Task) => void; // Modified to accept task for editing
  onUpdate: () => void;
  users: { id: string; username: string }[]; // Type for users prop
}) {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    assignedTo: ''
  });

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'missed'>('all');
  const [filterAssignedTo, setFilterAssignedTo] = useState<string>('all'); // 'all' or user ID

  const handleEditClick = (task: Task) => {
    setFormData({
      id: task.id,
      title: task.title,
      description: task.description || '',
      category: task.category,
      priority: task.priority,
      dueDate: new Date(task.dueDate).toISOString().slice(0, 16),
      assignedTo: task.assignedTo || ''
    });
    onShowForm(true, task); // Pass task to showForm
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id ? `${API_BASE_URL}/tasks/${formData.id}` : `${API_BASE_URL}/tasks`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          dueDate: new Date(formData.dueDate).toISOString(),
          assignedTo: formData.assignedTo === '' ? null : formData.assignedTo,
          ...(method === 'POST' && { assignedBy: 'admin-1' }) // Only include assignedBy on create
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setFormData({
        id: '',
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        dueDate: '',
        assignedTo: ''
      });
      onShowForm(false);
      onUpdate();
    } catch (error) {
      console.error(`Error ${method === 'POST' ? 'creating' : 'updating'} task:`, error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const assignedToMatch = filterAssignedTo === 'all' || task.assignedTo === filterAssignedTo;
    return statusMatch && assignedToMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Task Management</h2>
        <button
          onClick={() => {
            onShowForm(true);
            setFormData({
              id: '',
              title: '',
              description: '',
              category: '',
              priority: 'medium',
              dueDate: '',
              assignedTo: ''
            });
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-blue-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{formData.id ? 'Edit Task' : 'Create New Task'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Math, Science, Assignment"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign To (Optional)
                </label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Users (Unassigned)</option>
                  {users.map((userOption) => (
                    <option key={userOption.id} value={userOption.id}>
                      {userOption.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  onShowForm(false);
                  setFormData({
                    id: '',
                    title: '',
                    description: '',
                    category: '',
                    priority: 'medium',
                    dueDate: '',
                    assignedTo: ''
                  });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {formData.id ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'completed' | 'missed')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="missed">Missed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Assignee</label>
          <select
            value={filterAssignedTo}
            onChange={(e) => setFilterAssignedTo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Users</option>
            <option value="">Unassigned (Broadcast)</option>
            {users.map((userOption) => (
              <option key={userOption.id} value={userOption.id}>
                {userOption.username}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <AdminTaskCard key={task.id} task={task} onUpdate={onUpdate} onEdit={handleEditClick} users={users} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No tasks matching current filters.
          </div>
        )}
      </div>
    </div>
  );
}

// Task Card for Admin View (with Delete Button)
function AdminTaskCard({ task, onUpdate, onEdit, users }: { task: Task; onUpdate: () => void; onEdit: (task: Task) => void; users: { id: string; username: string }[] }) {
  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        onUpdate(); // Refresh tasks after deletion
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const assignedUserName = task.assignedTo ? users.find(u => u.id === task.assignedTo)?.username : 'Unassigned';

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
        <p className="text-sm text-gray-600">{task.description}</p>
        <p className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</p>
        {task.assignedTo && <p className="text-xs text-gray-500">Assigned To: {assignedUserName}</p>}
        <p className="text-xs text-gray-500">Status: {task.status}</p>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(task)}
          className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => handleDeleteTask(task.id)}
          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

// Exam Management Component
function ExamManagement({
  exams,
  showForm,
  onShowForm,
  onUpdate
}: {
  exams: Exam[];
  showForm: boolean;
  onShowForm: (show: boolean, exam?: Exam) => void; // Modified to accept exam for editing
  onUpdate: () => void;
}) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    examDate: '',
    applicationDeadline: '',
    category: '',
    description: '',
    applicationLink: '' // New field
  });

  const handleEditClick = (exam: Exam) => {
    setFormData({
      id: exam.id,
      name: exam.name,
      examDate: new Date(exam.examDate).toISOString().slice(0, 16),
      applicationDeadline: new Date(exam.applicationDeadline).toISOString().slice(0, 16),
      category: exam.category,
      description: exam.description || '',
      applicationLink: exam.applicationLink || ''
    });
    onShowForm(true, exam); // Pass exam to showForm
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id ? `${API_BASE_URL}/exams/${formData.id}` : `${API_BASE_URL}/exams`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          examDate: new Date(formData.examDate).toISOString(),
          applicationDeadline: new Date(formData.applicationDeadline).toISOString(),
          category: formData.category,
          description: formData.description,
          applicationLink: formData.applicationLink // Include new field
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setFormData({
        id: '',
        name: '',
        examDate: '',
        applicationDeadline: '',
        category: '',
        description: '',
        applicationLink: ''
      });
      onShowForm(false);
      onUpdate();
    } catch (error) {
      console.error(`Error ${method === 'POST' ? 'creating' : 'updating'} exam:`, error);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/exams/${examId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        onUpdate(); // Refresh exams after deletion
      } catch (error) {
        console.error('Error deleting exam:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Exam Management</h2>
        <button
          onClick={() => onShowForm(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Exam
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-green-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{formData.id ? 'Edit Exam' : 'Add New Exam'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Entrance, Competitive, University"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.examDate}
                  onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Deadline
                </label>
                <input
                  type="datetime-local"
                  value={formData.applicationDeadline}
                  onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application Link (Optional)
              </label>
              <input
                type="url"
                value={formData.applicationLink}
                onChange={(e) => setFormData({ ...formData, applicationLink: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., https://example.com/apply"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="Additional information about the exam"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  onShowForm(false);
                  setFormData({
                    id: '',
                    name: '',
                    examDate: '',
                    applicationDeadline: '',
                    category: '',
                    description: '',
                    applicationLink: ''
                  });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {formData.id ? 'Update Exam' : 'Add Exam'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <div key={exam.id} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{exam.name}</h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                {exam.category}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div>
                <span className="font-medium">Exam Date:</span>{' '}
                {new Date(exam.examDate).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Apply By:</span>{' '}
                {new Date(exam.applicationDeadline).toLocaleDateString()}
              </div>
              {exam.applicationLink && (
                <div>
                  <span className="font-medium">Apply Here:</span>{' '}
                  <a href={exam.applicationLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Link
                  </a>
                </div>
              )}
            </div>
            
            {exam.description && (
              <p className="mt-3 text-sm text-gray-600">{exam.description}</p>
            )}
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => handleEditClick(exam)}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteExam(exam.id)}
                className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Doubts Management Component
function DoubtsManagement({
  doubts,
  onUpdate
}: { doubts: Doubt[]; onUpdate: () => void }) {
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  const handleReplyChange = (doubtId: string, text: string) => {
    setReplyText(prev => ({ ...prev, [doubtId]: text }));
  };

  const handleAnswerDoubt = async (doubtId: string) => {
    const answer = replyText[doubtId];
    if (!answer) return;

    try {
      const response = await fetch(`${API_BASE_URL}/doubts/${doubtId}/answer`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answer }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setReplyText(prev => {
        const newState = { ...prev };
        delete newState[doubtId];
        return newState;
      });
      onUpdate(); // Reload doubts after answering
    } catch (error) {
      console.error('Error answering doubt:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Student Doubts</h2>
        <div className="text-sm text-gray-600">
          {doubts.filter(d => d.status === 'pending').length} pending doubts
        </div>
      </div>

      <div className="space-y-4">
        {doubts.map((doubt) => (
          <div key={doubt.id} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{doubt.subject}</h3>
                <p className="text-sm text-gray-600">
                  Submitted {new Date(doubt.createdAt).toLocaleDateString()}
                </p>
                {doubt.userId && (
                  <p className="text-xs text-gray-500">By User ID: {doubt.userId}</p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${{
                'pending': 'bg-yellow-100 text-yellow-800',
                'answered': 'bg-blue-100 text-blue-800',
                'resolved': 'bg-green-100 text-green-800'
              }[doubt.status]}`}>
                {doubt.status}
              </span>
            </div>
            
            <p className="text-gray-700 mb-4">{doubt.question}</p>
            
            {doubt.imageUrl && (
              <div className="mb-4">
                <img
                  src={doubt.imageUrl}
                  alt="Doubt attachment"
                  className="max-w-xs rounded-lg border"
                />
              </div>
            )}
            
            {doubt.answer && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-800">Admin Reply:</h4>
                <p className="text-gray-700">{doubt.answer}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Answered on {doubt.answeredAt ? new Date(doubt.answeredAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            )}

            {doubt.status === 'pending' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label htmlFor={`reply-${doubt.id}`} className="block text-sm font-medium text-gray-700 mb-2">Reply to Doubt</label>
                <textarea
                  id={`reply-${doubt.id}`}
                  value={replyText[doubt.id] || ''}
                  onChange={(e) => handleReplyChange(doubt.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Type your answer here..."
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => handleAnswerDoubt(doubt.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!replyText[doubt.id]}
                  >
                    Send Answer
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Content Management Component
function ContentManagement() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Content Management</h2>
        <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Upload Content
        </button>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-sm text-center">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Content Management</h3>
        <p className="text-gray-600 mb-6">
          Upload and organize study materials, notes, and resources for students.
        </p>
        <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          Start Uploading Content
        </button>
      </div>
    </div>
  );
}