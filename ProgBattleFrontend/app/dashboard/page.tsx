'use client';

import { useState } from 'react';
import BotSubmitForm from '@/components/BotSubmit';
import LastSubmission from '@/components/LastSubmission';

export default function Dashboard() {
  const [lastSubmissionId, setLastSubmissionId] = useState('');

  return (
    <div className="ml-64 min-h-screen p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="900 p-6 rounded-2xl shadow-lg border border-gray-800">
          <BotSubmitForm onSubmit={setLastSubmissionId} />
        </div>
        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800">
          <LastSubmission submissionId={lastSubmissionId} />
        </div>
      </div>
    </div>
  );
}
