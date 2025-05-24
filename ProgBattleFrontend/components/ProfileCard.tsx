// components/ProfileCard.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-label";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createTeam } from "@/lib/api"; // make sure this path is correct
import { toast } from "sonner";

function SelectTeamSize({
  onChange,
}: {
  onChange: (value: string) => void;
}) {
  return (
    <Select onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select size" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Team Size</SelectLabel>
          {[1, 2, 3, 4, 5].map((size) => (
            <SelectItem key={size} value={size.toString()}>
              {size}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

type ProfileProps = {
  email: string;
  teamName: string | null;
  is_verified: boolean;
};

export default function ProfileCard({ email, teamName, is_verified }: ProfileProps) {
  const [newTeamName, setNewTeamName] = useState("");
  const [teamSize, setTeamSize] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  const notInTeam = !teamName;
// Inside your component:
const [teamPassword, setTeamPassword] = useState("");

// Update handleCreateTeam to include password:
const handleCreateTeam = async () => {
  if (!newTeamName || !teamSize || !teamPassword) {
    toast.error("Please fill in all fields.");
    return;
  }

  try {
    setLoading(true);
    const data = await createTeam(newTeamName, teamSize, teamPassword); // Updated call
    console.log("Team created:", data);
    window.location.reload(); // Reload to fetch new team data
  } catch (err: any) {
    console.error("Error creating team:", err.status);
    if (err.status === 400) {
      setError("Team name already exists.");
    }
    else if (err.status === 422) {
      setError("Invalid team size. Please select a valid size. OR Team Password min length 8.");
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex flex-wrap gap-6 justify-center items-start p-6 bg-gray-100 rounded-xl shadow-inner">
      {/* Profile Section */}
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">👤 Your Profile</h2>
        <p className="text-gray-700">
          <strong>Email:</strong> {email}
        </p>
      {is_verified ? (
              <span className="text-green-600 font-semibold">✅ Email Verified</span>
            ) : (
              <span className="text-yellow-600 font-semibold">⚠️ Email Not Verified</span>
            )}
      </div>
      {/* Team Section */}
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">🧑‍🤝‍🧑 Team Details</h2>
        <p className="text-gray-700">
          <strong>Team:</strong>{" "}
          {teamName || "You are not in a team yet."}
        </p>

        {notInTeam && (
          <div className="mt-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Create New Team</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                  <DialogDescription>
                    Once created, you will not be able to leave or change your
                    team.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Team Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Team Name"
                      className="col-span-3"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                    />
                  </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      Team Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Password"
                      className="col-span-3"
                      value={teamPassword}
                      onChange={(e) => setTeamPassword(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="size" className="text-right">
                      Max Team Size
                    </Label>
                    <div className="col-span-3">
                      <SelectTeamSize
                        onChange={(val) => setTeamSize(Number(val))}
                      />
                    </div>
                  </div>



                    {error && (
                        <p className="text-red-500 text-sm mt-2">{error}</p>
                    )}
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    onClick={handleCreateTeam}
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Team"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}
