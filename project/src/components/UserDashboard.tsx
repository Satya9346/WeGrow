import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AnalogClock from './AnalogClock';
import TaskCard from './TaskCard';
import AnalyticsCharts from './AnalyticsCharts';
import DoubtsSection from './DoubtsSection';
import ExamCenter from './ExamCenter';
import type { Task, UserStats, Doubt } from '../types.ts';
import {
  CheckSquare,
  Users,
  HelpCircle,
  Calendar,
  TrendingUp,
  LogOut,
  XCircle // Import XCircle for missed tasks
} from 'lucide-react';
import {isToday} from 'date-fns';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'; // Fallback for local development

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [activeTab, setActiveTab] = useState('tasks');

  useEffect(() => {
    if (user) {
      loadUserData();
      const intervalId = setInterval(loadUserData, 10000); // Poll every 10 seconds for debugging
      return () => clearInterval(intervalId); // Cleanup on unmount
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    console.log('loadUserData called');
    try {
      const [tasksResponse, statsResponse, doubtsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/tasks?userId=${user.id}`),
        fetch(`${API_BASE_URL}/user-stats/${user.id}`),
        fetch(`${API_BASE_URL}/doubts?userId=${user.id}`)
      ]);

      const userTasks: Task[] = await tasksResponse.json();
      console.log('Fetched userTasks (raw):', userTasks);
      const stats: UserStats = await statsResponse.json();
      const userDoubts: Doubt[] = await doubtsResponse.json();
      
      setTasks(userTasks);
      setUserStats(stats);
      setDoubts(userDoubts);

      const currentMissedTasks = userTasks.filter(task => 
        task.status === 'missed' && (task.assignedTo === user?.id || !task.assignedTo)
      );
      console.log('Missed tasks after filter:', currentMissedTasks);

    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleTaskToggle = async (taskId: string, newStatus: 'pending' | 'completed') => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newStatus }), // Send newStatus directly
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      loadUserData();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const personalTasks = tasks.filter(task => task.assignedTo === user?.id && task.status === 'pending' && isToday(new Date(task.dueDate)));
  const sharedTasks = tasks.filter(task => !task.assignedTo && task.status === 'pending' && isToday(new Date(task.dueDate)));
  const missedTasks = tasks.filter(task => 
    task.status === 'missed' && (task.assignedTo === user?.id || !task.assignedTo) // Include personal and shared missed tasks
  );

  const tabs = [
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'doubts', label: 'Doubts', icon: HelpCircle },
    { id: 'exams', label: 'Exams', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">WEGROW</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.username}!</p>
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
        {/* Digital Clock */}
        <div className="mb-8">
          <AnalogClock />
        </div>

        {/* Stats Overview */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckSquare className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Tasks Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.status === 'completed' && t.assignedTo === user?.id).length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Tasks Missed</p>
                  <p className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.status === 'missed' && t.assignedTo === user?.id).length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Current Streak</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.currentStreak} days</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <HelpCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Doubts Submitted</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.doubtsSubmitted}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Longest Streak</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.longestStreak} days</p>
                </div>
              </div>
            </div>
          </div>
        )}

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
          {activeTab === 'tasks' && (
            <div className="space-y-8">
              {/* Personal Tasks */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Tasks</h2>
                <div className="space-y-4">
                  {personalTasks.length > 0 ? (
                    personalTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggleComplete={handleTaskToggle}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No personal tasks assigned yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Missed Tasks */}
              {missedTasks.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-red-600 mb-4">Missed Tasks</h2>
                  <div className="space-y-4">
                    {missedTasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              )}

              {/* Shared Tasks */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Shared Tasks</h2>
                <div className="space-y-4">
                  {sharedTasks.length > 0 ? (
                    sharedTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggleComplete={handleTaskToggle}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No shared tasks available.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'doubts' && (
            <DoubtsSection userId={user?.id || ''} doubts={doubts} onUpdate={loadUserData} />
          )}

          {activeTab === 'exams' && (
            <ExamCenter userId={user?.id || ''} />
          )}

          {activeTab === 'analytics' && userStats && (
            <AnalyticsCharts userStats={userStats} tasks={tasks} />
          )}
        </div>
      </div>
    </div>
  );
}