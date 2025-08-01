import React from 'react';
import { CheckCircle, Circle, Clock, Flag } from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import type { Task } from '../types.ts';
import { clsx } from 'clsx';

interface TaskCardProps {
  task: Task;
  onToggleComplete?: (taskId: string, newStatus: 'pending' | 'completed') => void; // Modified to pass new status
  showAssignee?: boolean;
}

export default function TaskCard({ task, onToggleComplete, showAssignee = false }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getDateDisplay = (date: Date) => {
    if (isToday(date)) return `Today, ${format(date, 'hh:mm a')}`;
    if (isTomorrow(date)) return `Tomorrow, ${format(date, 'hh:mm a')}`;
    return format(date, 'MMM dd, hh:mm a');
  };

  // Removed isOverdue calculation, now handled by task.status === 'missed'

  return (
    <div className={clsx(
      'bg-white rounded-lg border-2 p-4 transition-all hover:shadow-md',
      task.status === 'completed' && 'border-green-200 bg-green-50',
      task.status === 'missed' && 'border-red-200 bg-red-50',
      task.status === 'pending' && 'border-gray-220 hover:border-blue-300'
    )}>
      <div className="flex items-start space-x-3">
        {onToggleComplete && (
          <button
            onClick={() => onToggleComplete(task.id, task.status === 'completed' ? 'pending' : 'completed')} // Toggle between completed and pending
            className={clsx(
              "mt-1 transition-colors",
              task.status === 'missed' ? "text-gray-300 cursor-not-allowed" : "text-gray-400 hover:text-blue-600"
            )}
            disabled={task.status === 'missed'}
          >
            {task.status === 'completed' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className={clsx(
              'font-medium',
              (task.status === 'completed' || task.status === 'missed') && 'line-through text-gray-500',
              task.status === 'pending' && 'text-gray-900'
            )}>
              {task.title}
            </h3>
            <span className={clsx(
              'px-2 py-1 rounded-full text-xs font-medium',
              getPriorityColor(task.priority)
            )}>
              <Flag className="w-3 h-3 inline mr-1" />
              {task.priority}
            </span>
          </div>
          
          {task.description && (
            <p className={clsx(
              'text-sm mb-3',
              (task.status === 'completed' || task.status === 'missed') ? 'text-gray-400' : 'text-gray-600'
            )}>
              {task.description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                {task.category}
              </span>
              <div className={clsx(
                'flex items-center',
                task.status === 'missed' && 'text-red-600',
                task.status === 'completed' && 'text-gray-400',
                task.status === 'pending' && 'text-gray-600'
              )}>
                <Clock className="w-4 h-4 mr-1" />
                {getDateDisplay(task.dueDate)}
                {task.status === 'missed' && <span className="ml-1 font-bold">(Missed)</span>}
              </div>
            </div>
            
            {showAssignee && task.assignedTo && (
              <span className="text-xs text-gray-500">
                Assigned to: {task.assignedTo}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}