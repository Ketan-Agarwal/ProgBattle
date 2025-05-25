'use client';

import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { submitBot } from '@/lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useUser } from '@/Context/UserContext';
import { toast } from 'sonner';

interface BotSubmitFormProps {
  onSubmit: (id: string) => void;
}

export default function BotSubmitForm({ onSubmit }: BotSubmitFormProps) {
  const { user } = useUser();
  const [code, setCode] = useState('');
  const [botName, setBotName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.endsWith('.py')) {
      toast.error('Only .py files are allowed.');
      setFile(null);
      return;
    }

    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = () => setCode(reader.result as string);
    reader.readAsText(uploadedFile);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    if (!botName.trim()) {
      toast.warning('Bot name is required.');
      setIsSubmitting(false);
      return;
    }

    if (!code.trim()) {
      toast.warning('Code is required.');
      setIsSubmitting(false);
      return;
    }

    try {
      const finalFile = new File([code], `${botName}.py`, { type: 'text/x-python' });

      const formData = new FormData();
      formData.append('file', finalFile);
      formData.append('bot_name', botName);

      if (!user) {
        toast.error('Please Login to submit a bot.');
        setIsSubmitting(false);
        return;
      }

      if (user && !user.team_id) {
        toast.error('Please join a team to submit a bot.');
        setIsSubmitting(false);
        return;
      }

      const submit = await submitBot(formData);
      onSubmit(submit.submission_id);
      toast.success('Bot submitted successfully!');

      // Reset form state after successful submission
      setBotName('');
      setCode('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error(err);
      if (err.status === 401) {
        toast.error('Unauthorized. Please log in.');
      } else if (err.status === 400) {
        toast.error(err.response.data?.detail || 'Bad request. Please check your input.');
      } else if (err.status === 429) {
        toast.error(err.response.data?.detail || 'Rate limit exceeded. Please try again later.');
      } else {
        toast.error('Failed to submit bot. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Submit Your Bot
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Upload your Python bot code and compete
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="botName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bot Name
            </label>
            <Input
              id="botName"
              type="text"
              placeholder="Enter your bot name"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              className="h-10 sm:h-11 text-sm sm:text-base"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="python" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Python File (Optional)
            </label>
            <Input
              ref={fileInputRef}
              id="python"
              type="file"
              accept=".py"
              onChange={handleFileUpload}
              className="h-10 sm:h-11 text-sm"
              disabled={isSubmitting}
            />
            {file && (
              <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-2 break-all">
                📎 {file.name} loaded
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Code Editor
            </label>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <Editor
                height="350px"
                language="python"
                theme="vs-dark"
                value={code}
                onChange={(newCode) => setCode(newCode || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  fontFamily: 'JetBrains Mono, Fira Code, monospace',
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  padding: { top: 12, bottom: 12 },
                  lineNumbers: 'on',
                  tabSize: 4,
                  wordWrap: 'on',
                  scrollbar: {
                    vertical: 'auto',
                    horizontal: 'auto',
                    verticalScrollbarSize: 12,
                    horizontalScrollbarSize: 12,
                  },
                }}
                className="sm:!h-[500px]"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || !botName.trim() || !code.trim()}
            className="w-full h-10 sm:h-11 text-sm sm:text-base font-medium"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent mr-2"></div>
                <span className="hidden sm:inline">Submitting...</span>
                <span className="sm:hidden">Submitting...</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">🚀 Submit Bot</span>
                <span className="sm:hidden">🚀 Submit</span>
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}