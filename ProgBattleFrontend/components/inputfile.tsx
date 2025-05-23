// InputFile.tsx
'use client';

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function InputFile({ setFile }: { setFile: (file: File | null) => void }) {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="python">Python File</Label>
      <Input
        id="python"
        type="file"
        accept=".py,.zip"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
    </div>
  );
}
