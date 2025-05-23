'use client';

import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { submitBot } from '@/lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useUser }  from '@/Context/UserContext';
interface BotSubmitFormProps {
  onSubmit: (id: string) => void;
}

export default function BotSubmitForm({ onSubmit }: BotSubmitFormProps) {
  const { user } = useUser();
  const [code, setCode] = useState('');
  const [botName, setBotName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input reset

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.endsWith('.py')) {
      setStatus('Only .py files are allowed.');
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

    if (!botName.trim()) {
      setStatus('⚠️ Bot name is required.');
      return;
    }

    if (!code.trim()) {
      setStatus('⚠️ Code is required.');
      return;
    }
    try {
      const finalFile = new File([code], `${botName}.py`, { type: 'text/x-python' });

      const formData = new FormData();
      formData.append('file', finalFile);
      formData.append('bot_name', botName);

      if (!user) {
        setStatus('Please Login to submit a bot.');
        return;
      };
      if (user && !user.team_id) {
        setStatus('Please join a team to submit a bot.');
        return;
      }
      

      const submit = await submitBot(formData);
      onSubmit(submit.submission_id);
      setStatus('✅ Bot submitted successfully!');

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
        setStatus('Unauthorized. Please log in.');
      } else if (err.status === 400) {
        console.log(err.response.data?.detail)
        setStatus(err.response.data?.detail || 'Bad request. Please check your input.');
        
      } else if (err.status === 429) {
          setStatus(err.response.data?.detail || 'Rate limit exceeded. Please try again later.');
        
      } else {
        setStatus('Failed to submit bot.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold mb-2">Submit Your Bot</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          type="text"
          placeholder="Bot Name"
          value={botName}
          onChange={(e) => setBotName(e.target.value)}
          className=" placeholder-gray-400"
        />

        <Input
          ref={fileInputRef}
          id="python"
          type="file"
          accept=".py"
          onChange={handleFileUpload}
        />

        {file && (
          <p className="text-sm ">
            Uploaded file loaded into editor. Any edits will override the file content.
          </p>
        )}

        <Editor
          height="400px"
          language="python"
          theme="vs-dark"
          value={code}
          onChange={(newCode) => setCode(newCode || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'Fira Code, monospace',
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
          }}
        />

        <Button type="submit" className="w-full mt-2">Submit Bot</Button>

        {status && (
          <p className={`text-sm mt-2 ${status.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>
            {status}
          </p>
        )}
      </form>
    </div>
  );
}
