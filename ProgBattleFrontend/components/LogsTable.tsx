'use client'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from "react"
import { getGameLog, getLogs } from "@/lib/api"
import { Button } from "./ui/button";
import GameSimulation from "./GameReplay";

type Log = {
  system_bot_id: string;
  user_score: number;
  system_score: number;
  match_number: number;
  log_id: string;
};

export function LogsTable({ submission_id }: { submission_id: string }) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getLogs(submission_id);
        setLogs(data.logs);
      } catch (err: any) {
        if (err.status === 404) {
          setError("No logs found for this submission.");
          
        } else {
        setError("Could not load logs.");
        console.error("Failed to fetch logs:", err);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [submission_id]);

  if (loading) return <div className="p-4 text-gray-400">Loading logs...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  const handleLogsClick = async (logId: string) => {
    try {
      const data = await getGameLog(logId);
      setSelectedLog(data);
  }
    catch (err) {
      console.error("Failed to fetch game log:", err);
    }
  };

  return (
    <div className="flex flex-row items-center justify-center">
    <Table className="">
      <TableCaption>Logs for submission ID: {submission_id}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>System Bot</TableHead>
          <TableHead>User's Score</TableHead>
          <TableHead>System's Score</TableHead>
          <TableHead>Match #</TableHead>
          <TableHead className="text-right">Logs</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.log_id}>
            <TableCell>{log.system_bot_id}</TableCell>
            <TableCell>{log.user_score}</TableCell>
            <TableCell>{log.system_score}</TableCell>
            <TableCell>{log.match_number}</TableCell>
            <TableCell className="text-right">
              <Button
              onClick={() => {
                handleLogsClick(log.log_id);
              }}
                variant="outline"
                className="text-blue-500 bg-white hover:bg-gray-300 hover:text-blue-600 cursor-pointer"
              >
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    <GameSimulation log={selectedLog ?? ""}/>
    

    </div>
  );
}
