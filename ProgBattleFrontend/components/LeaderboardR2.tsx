"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getR2, getR2Matches, getMatchReplay } from "@/lib/api";
import GameSimulation from "./GameReplay";
interface Round2Match {
  id: string;
  team1_name: string;
  team2_name: string;
  team1_score: number | null;
  team2_score: number | null;
  status: string;
  group_id: number | null;
  stage: string;
}

export default function Round2Page() {
  const [started, setStarted] = useState<boolean | null>(null);
  const [matches, setMatches] = useState<Round2Match[]>([]);
  const [openReplayDialog, setOpenReplayDialog] = useState(false);
  const [selectedMatchLogs, setSelectedMatchLogs] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getR2();
        setStarted(res.started);

        if (res.started) {
          const matchesRes = await getR2Matches();
          setMatches(matchesRes);
        }
      } catch (err) {
        console.error("❌ Failed to fetch R2 data:", err);
        setStarted(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const ws = new WebSocket(`ws://${process.env.NEXT_PUBLIC_WS_DOMAIN}/ws/logs`);

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "match_update") {
        const updatedMatch = msg.data;
        setMatches((prev) => {
          const exists = prev.some((m) => m.id === updatedMatch.id);
          return exists
            ? prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m))
            : [...prev, updatedMatch];
        });
      }
    };

    ws.onerror = (e) => console.error("❌ WebSocket error", e);
    ws.onclose = () => console.warn("🔌 WebSocket disconnected");

    return () => ws.close();
  }, []);

  if (started === null) return <div>⏳ Loading...</div>;
  if (!started) return <div>⚠️ Round 2 hasn't started yet.</div>;

  const stageLabels: Record<string, string> = {
    group: "🏁 Group Stage",
    qf: "🥊 Quarter Finals",
    sf: "🔥 Semi Finals",
    f: "🏆 Final",
  };

  const groupedByStage: Record<string, Round2Match[]> = {};
  for (const match of matches) {
    const stage = match.stage || "unknown";
    if (!groupedByStage[stage]) groupedByStage[stage] = [];
    groupedByStage[stage].push(match);
  }

  const orderedStages = ["group", "qf", "sf", "f"];

  const handleReplayClick = async (matchId: string) => {
    try {
      const logs = await getMatchReplay(matchId);
      setSelectedMatchLogs(logs);
      setOpenReplayDialog(true);
    } catch (err) {
      console.error("❌ Failed to fetch match logs:", err);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {orderedStages.map(
        (stage) =>
          groupedByStage[stage] && (
            <div key={stage}>
              <h2 className="text-xl font-bold mb-3 border-b pb-1 border-gray-300">
                {stageLabels[stage] || stage}
              </h2>
              <div className="grid gap-3">
                {groupedByStage[stage].map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onReplayClick={() => handleReplayClick(match.id)}
                  />
                ))}
              </div>
            </div>
          )
      )}

      <Dialog open={openReplayDialog} onOpenChange={setOpenReplayDialog}>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Simulation</DialogTitle>
            <DialogDescription>This is the replay of the selected match.</DialogDescription>
          </DialogHeader>
          {selectedMatchLogs && <GameSimulation log={selectedMatchLogs} />}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MatchCard({ match, onReplayClick }: { match: Round2Match; onReplayClick: () => void }) {
  return (
    <div className="border border-gray-300 p-4 rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow">
      <div className="flex justify-between mb-1">
        <span className="font-semibold">
          {match.team1_name} vs {match.team2_name}
        </span>
        {match.status === "evaluated" ? (
          <b>
            🏆 {match.team1_score} - {match.team2_score}
          </b>
        ) : (
          <span className="italic text-gray-400">{match.status}</span>
        )}
      </div>
      {match.group_id !== null && <div className="text-sm text-gray-500">Group {match.group_id}</div>}
      <Button className="mt-2" variant="outline" onClick={onReplayClick}>
        View Simulation
      </Button>
    </div>
  );
}