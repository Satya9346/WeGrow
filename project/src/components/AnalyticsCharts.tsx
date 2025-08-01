import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import type { UserStats, Task } from '../types';
import { format, subDays, eachDayOfInterval } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsChartsProps {
  userStats: UserStats;
  tasks: Task[];
}

export default function AnalyticsCharts({ userStats, tasks }: AnalyticsChartsProps) {
  const chartData = useMemo(() => {
    const now = new Date();
    const last7Days = eachDayOfInterval({
      start: subDays(now, 6),
      end: now
    });

    // Generate sample data for demonstration
    const dailyProgress = last7Days.map(day => ({
      date: format(day, 'MMM dd'),
      completed: Math.floor(Math.random() * 5) + 1,
      total: Math.floor(Math.random() * 3) + 3
    }));

    return { dailyProgress };
  }, []);

  const barChartData = {
    labels: chartData.dailyProgress.map(d => d.date),
    datasets: [
      {
        label: 'Tasks Completed',
        data: chartData.dailyProgress.map(d => d.completed),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      },
      {
        label: 'Total Tasks',
        data: chartData.dailyProgress.map(d => d.total),
        backgroundColor: 'rgba(229, 231, 235, 0.8)',
        borderColor: 'rgba(156, 163, 175, 1)',
        borderWidth: 1
      }
    ]
  };

  const lineChartData = {
    labels: chartData.dailyProgress.map(d => d.date),
    datasets: [
      {
        label: 'Completion Rate %',
        data: chartData.dailyProgress.map(d => Math.round((d.completed / d.total) * 100)),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const pendingTasks = totalTasks - completedTasks;

  const doughnutData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [completedTasks, pendingTasks],
        backgroundColor: ['#10B981', '#F59E0B'],
        borderWidth: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <div className="text-sm text-gray-600">
          Last updated: {format(new Date(), 'PPP')}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Completion Rate</p>
              <p className="text-3xl font-bold">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </p>
            </div>
            <div className="text-4xl opacity-20">📊</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Current Streak</p>
              <p className="text-3xl font-bold">{userStats.currentStreak} days</p>
            </div>
            <div className="text-4xl opacity-20">🔥</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Best Streak</p>
              <p className="text-3xl font-bold">{userStats.longestStreak} days</p>
            </div>
            <div className="text-4xl opacity-20">🏆</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Progress Bar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Task Progress</h3>
          <div className="h-64">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>

        {/* Completion Rate Line Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Rate Trend</h3>
          <div className="h-64">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        {/* Task Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="w-48 h-48">
              <Doughnut data={doughnutData} options={{ ...chartOptions, maintainAspectRatio: true }} />
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-800 font-medium">Tasks Completed</span>
              <span className="text-blue-900 font-bold">{completedTasks}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-yellow-800 font-medium">Tasks Pending</span>
              <span className="text-yellow-900 font-bold">{pendingTasks}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-green-800 font-medium">Doubts Resolved</span>
              <span className="text-green-900 font-bold">{userStats.doubtsResolved}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-purple-800 font-medium">Doubts Submitted</span>
              <span className="text-purple-900 font-bold">{userStats.doubtsSubmitted}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Section */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-8 text-white text-center">
        <div className="text-6xl mb-4">🌟</div>
        <h3 className="text-2xl font-bold mb-2">Keep Up the Great Work!</h3>
        <p className="text-lg opacity-90">
          You're making excellent progress. Stay consistent and reach your goals!
        </p>
        {userStats.currentStreak >= 7 && (
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-white/20 rounded-full">
            <span className="text-2xl mr-2">🔥</span>
            <span className="font-semibold">Weekly Streak Achieved!</span>
          </div>
        )}
      </div>
    </div>
  );
}