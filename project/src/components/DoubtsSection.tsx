import React, { useState } from 'react';
import type { Doubt } from '../types.ts';
import { HelpCircle, Upload, Send, Image } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'; // Fallback for local development

interface DoubtsProps {
  userId: string;
  doubts: Doubt[];
  onUpdate: () => void;
}

export default function DoubtsSection({ userId, doubts, onUpdate }: DoubtsProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    question: '',
    imageUrl: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_BASE_URL}/doubts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, userId, status: 'pending' }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setFormData({ subject: '', question: '', imageUrl: '' });
      setShowForm(false);
      onUpdate();
    } catch (error) {
      console.error('Error submitting doubt:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, imageUrl: 'https://via.placeholder.com/300x200?text=Question+Image' });
    }
  };

  const handleDeleteDoubt = async (doubtId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/doubts/${doubtId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      onUpdate(); // Reload doubts after deletion
    } catch (error) {
      console.error('Error deleting doubt:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Doubt Resolution</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          Ask Question
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-blue-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Submit Your Doubt</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject/Topic
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Mathematics, Physics, Chemistry"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Question
              </label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Describe your doubt in detail..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attach Image (Optional)
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {formData.imageUrl && (
                  <div className="flex items-center text-green-600">
                    <Image className="w-4 h-4 mr-1" />
                    Image uploaded
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Question
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {doubts.length > 0 ? (
          doubts.map((doubt) => (
            <div key={doubt.id} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{doubt.subject}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(doubt.createdAt).toLocaleDateString()} at{' '}
                    {new Date(doubt.createdAt).toLocaleTimeString()}
                  </p>
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
                    alt="Question attachment"
                    className="max-w-sm rounded-lg border"
                  />
                </div>
              )}
              
              {doubt.answer && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Answer:</h4>
                  <p className="text-blue-800">{doubt.answer}</p>
                  {doubt.answeredAt && (
                    <p className="text-sm text-blue-600 mt-2">
                      Answered on {new Date(doubt.answeredAt).toLocaleDateString()}
                    </p>
                  )}
                  {doubt.status === 'answered' && (
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={() => handleDeleteDoubt(doubt.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Mark as Clarified & Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No doubts submitted yet</h3>
            <p className="text-gray-600 mb-6">
              Have a question? Click the "Ask Question" button to get help from your instructors.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ask Your First Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
}