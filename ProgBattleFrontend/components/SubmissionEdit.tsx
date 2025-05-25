'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import Editor from "@monaco-editor/react";
import { Button } from './ui/button';
import { Input } from './ui/input';
import { getSubmission, submitBot } from "@/lib/api";
import { useUser } from "@/Context/UserContext";
import { toast } from 'sonner';

interface SubmissionDialogProps {
  submission_id: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function SubmissionDialog({ submission_id, open, setOpen }: SubmissionDialogProps) {
  const { user } = useUser();
  const [code, setCode] = useState('');
  const [botName, setBotName] = useState('');
  const [status, setStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    const fetchCode = async () => {
      try {
        const submission = await getSubmission(submission_id);
        console.log(submission);
        setCode(submission.code || '');
        setBotName(submission.bot_name || '');
        setStatus('');
      } catch (err) {
        console.error(err);
        setStatus("❌ Failed to load submission.");
        
      }
    };

    fetchCode();
  }, [submission_id, open]);

  const handleSubmit = async () => {
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
        setStatus('Please log in to submit a bot.');
        return;
      }
      if (!user.team_id) {
        setStatus('Please join a team to submit a bot.');
        return;
      }

      await submitBot(formData);
      setStatus('✅ Bot submitted successfully!');
      setCode('');
      setBotName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setOpen(false);
    } catch (err: any) {
      console.error(err);
      if (err.status === 401) {
        setStatus('Unauthorized. Please log in.');
      } else if (err.status === 400 || err.status === 429) {
        setStatus(err.response?.data?.detail || 'Submission failed.');
      } else {
        setStatus('Failed to submit bot.');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>View & Resubmit Submission</DialogTitle>
          <DialogDescription>
            Review or edit your code and resubmit if needed.
          </DialogDescription>
        </DialogHeader>

        <Input
          type="text"
          placeholder="Bot Name"
          value={botName}
          onChange={(e) => setBotName(e.target.value)}
          className="mb-3"
        />

        <Editor
          height="400px"
          language="python"
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'Fira Code, monospace',
          }}
        />

        {status && (
          <p className={`text-sm mt-2 ${status.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>
            {status}
          </p>
        )}

        <DialogFooter className="sm:justify-between mt-4">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} type="button">
            Submit Bot
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
