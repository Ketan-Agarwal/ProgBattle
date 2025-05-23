'use client';

import { useEffect, useState } from 'react';
import { pollBot } from '@/lib/api';

export default function LastSubmission({ submissionId }: { submissionId: string }) {
  const [status, setStatus] = useState('Upload your bot first.');
  const [score, setScore] = useState<number | null>(null);
  const [submittedAt, setSubmittedAt] = useState('');
const [botname, setName] = useState(''); // New state for bot name
  useEffect(() => {
    if (!submissionId) return;

    const interval = setInterval(async () => {
      try {
        const res = await pollBot(submissionId);
        setStatus(res.status);
        setScore(res.score);
        setSubmittedAt(res.submitted_at);
        setName(res.name);

        if (res.status === 'evaluated' || res.status === 'failed') {
          clearInterval(interval); // Stop polling once task finishes
        }
      } catch (err) {
        console.error('Failed to fetch submission status');
      }
    }, 1000); // poll every 3 seconds

    return () => clearInterval(interval);
  }, [submissionId]);

  return (
    <div className="mt-6 p-4 6w-full border rounded bg-white shadow">
      <h3 className="text-lg font-semibold">⏳ Last Submission Status</h3>
        {botname !== '' && (<p className="text-md">Bot Name: {botname}</p>)}  
      <p>Status: <span className="font-mono">{status}</span></p>
      {score !== null && <p>Score: <strong>{score}</strong></p>}
      {submittedAt && <span>Submitted At: {submittedAt}</span>
      }
    </div>
  );
}
