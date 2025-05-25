'use client';

import { useEffect, useState } from 'react';
import { pollBot } from '@/lib/api';

export default function LastSubmission({ submissionId }: { submissionId: string }) {
  const [status, setStatus] = useState('Upload your bot first.');
  const [score, setScore] = useState<number | null>(null);
  const [submittedAt, setSubmittedAt] = useState('');
  const [botname, setName] = useState('');
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (!submissionId) return;

    setIsPolling(true);
    const interval = setInterval(async () => {
      try {
        const res = await pollBot(submissionId);
        setStatus(res.status);
        setScore(res.score);
        setSubmittedAt(res.submitted_at);
        setName(res.name);
        
        if (res.status === 'evaluated' || res.status === 'failed') {
          clearInterval(interval);
          setIsPolling(false);
        }
      } catch (err) {
        console.error('Failed to fetch submission status');
        setIsPolling(false);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      setIsPolling(false);
    };
  }, [submissionId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'evaluated':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'failed':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'pending':
      case 'processing':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'evaluated':
        return '✅';
      case 'failed':
        return '❌';
      case 'pending':
      case 'processing':
        return '⏳';
      default:
        return '📤';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Last Submission Status
          </h3>
          {isPolling && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          )}
        </div>

        <div className="space-y-3 sm:space-y-4">
          {botname && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                🤖 Bot Name:
              </span>
              <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base break-all">
                {botname}
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Status:
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs sm:text-sm font-medium ${getStatusColor(status)}`}>
              <span>{getStatusIcon(status)}</span>
              {status}
            </span>
          </div>

          {score !== null && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Score:
              </span>
              <span className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                {score}
              </span>
            </div>
          )}

          {submittedAt && (
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Submitted At:
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                {formatDate(submittedAt)}
              </span>
            </div>
          )}
        </div>

        {!submissionId && (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Upload your bot first to see submission status
            </p>
          </div>
        )}
      </div>
    </div>
  );
}