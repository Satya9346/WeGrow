import React, { useState, useEffect } from 'react';
import type { Exam, ExamApplication } from '../types.ts'; // Import ExamApplication type
import { Calendar, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { format, formatDistanceToNow, isPast, isBefore } from 'date-fns';

const API_BASE_URL = 'http://localhost:3000/api';

interface ExamCenterProps {
  userId: string;
}

export default function ExamCenter({ userId }: ExamCenterProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  // Removed appliedExams state as status will be part of exam object

  useEffect(() => {
    loadExams();
  }, [userId]);

  const loadExams = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/exams`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      let examData: Exam[] = await response.json();

      // Fetch application status for each exam
      const examsWithStatus = await Promise.all(examData.map(async (exam) => {
        const statusResponse = await fetch(`${API_BASE_URL}/exam-applications/${exam.id}/${userId}`);
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          return { ...exam, isApplied: statusData.applied, applicationStatus: statusData.status };
        } else {
          return { ...exam, isApplied: false, applicationStatus: '' };
        }
      }));
      setExams(examsWithStatus);
    } catch (error) {
      console.error('Error loading exams:', error);
    }
  };

  const handleMarkAsApplied = async (examId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/exam-applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ examId, userId, status: 'applied' }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Instead of updating a Set, refetch exams to update the UI
      loadExams();
    } catch (error) {
      console.error('Error marking exam as applied:', error);
    }
  };

  const getExamStatus = (exam: Exam) => {
    const now = new Date();
    
    if (isPast(exam.examDate)) {
      return { status: 'completed', color: 'gray', label: 'Completed' };
    }
    
    if (isPast(exam.applicationDeadline)) {
      return { status: 'deadline-passed', color: 'red', label: 'Deadline Passed' };
    }
    
    if (exam.isApplied) { // Use exam.isApplied directly
      return { status: 'applied', color: 'green', label: 'Applied' };
    }
    
    return { status: 'pending', color: 'yellow', label: 'Pending Application' };
  };

  const getCountdownText = (date: Date, label: string) => {
    if (isPast(date)) return `${label} passed`;
    return `${formatDistanceToNow(date, { addSuffix: true })}`;
  };

  const upcomingExams = exams.filter(exam => !isPast(exam.examDate));
  const completedExams = exams.filter(exam => isPast(exam.examDate));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Exam Information Center</h2>
        <div className="text-sm text-gray-600">
          {upcomingExams.length} upcoming exams
        </div>
      </div>

      {/* Upcoming Exams */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Exams</h3>
        {upcomingExams.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingExams.map((exam) => {
              const status = getExamStatus(exam);
              
              return (
                <div key={exam.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          {exam.name}
                        </h4>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {exam.category}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-800`}>
                        {status.label}
                      </span>
                    </div>

                    {exam.description && (
                      <p className="text-gray-600 text-sm mb-4">{exam.description}</p>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Exam Date:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {format(exam.examDate, 'PPP')}
                        </span>
                      </div>

                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Application Deadline:</span>
                        <span className={`ml-2 font-medium ${
                          isBefore(new Date(), exam.applicationDeadline) 
                            ? 'text-gray-900' 
                            : 'text-red-600'
                        }`}>
                          {format(exam.applicationDeadline, 'PPP')}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center mb-1">
                          <AlertTriangle className="w-4 h-4 text-orange-500 mr-1" />
                          Application Deadline: {getCountdownText(exam.applicationDeadline, 'Deadline')}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-blue-500 mr-1" />
                          Exam Date: {getCountdownText(exam.examDate, 'Exam')}
                        </div>
                      </div>
                    </div>

                    {/* Show apply option if not applied and deadline not passed */}
                    {!exam.isApplied && !isPast(exam.applicationDeadline) && (
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`applied-${exam.id}`}
                            onChange={() => handleMarkAsApplied(exam.id)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            checked={false} // Ensure checkbox is unchecked by default
                          />
                          <label 
                            htmlFor={`applied-${exam.id}`}
                            className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
                          >
                            Mark as Applied
                          </label>
                        </div>
                        {exam.applicationLink && (
                          <a
                            href={exam.applicationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Apply Now
                          </a>
                        )}
                      </div>
                    )}

                    {/* Show applied status if already applied */}
                    {exam.isApplied && (
                      <div className="mt-4 flex items-center text-green-600 bg-green-50 p-3 rounded-lg">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">Application submitted successfully!</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Exams</h4>
            <p className="text-gray-600">Check back later for new exam announcements.</p>
          </div>
        )}
      </div>

      {/* Completed Exams */}
      {completedExams.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Completed Exams</h3>
          <div className="space-y-4">
            {completedExams.map((exam) => (
              <div key={exam.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-700">{exam.name}</h4>
                    <p className="text-sm text-gray-500">
                      Completed on {format(exam.examDate, 'PPP')}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">
                    {exam.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}