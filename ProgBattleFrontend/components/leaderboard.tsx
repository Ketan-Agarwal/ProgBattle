"use client"

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
import { getLeaderboard } from "@/lib/api"

import { useUser } from "@/Context/UserContext"

type LeaderboardEntry = {
  rank: number
  team_id: string
  team_name: string
  score: number
  bot_name: string
  submitted_at: string
}

export function Leaderboard() {
    const {user} = useUser();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getLeaderboard()
        setEntries(data)
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err)
      }
    }
    fetchData()
  }, [])

  return (
    <Table>
      <TableCaption>Current Team Leaderboard</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">Rank</TableHead>
          <TableHead>Team</TableHead>
          <TableHead>Bot</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Submitted At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.team_id}>
            <TableCell className="font-bold">{entry.rank}</TableCell>
            <TableCell>{entry.team_name} {entry.team_id === user?.team_id && (
      <span className="ml-2 text-sm text-green-600 font-semibold">
        (Your Team)
      </span>
    )}</TableCell>
            <TableCell>{entry.bot_name}</TableCell>
            <TableCell>{entry.score.toFixed(2)}</TableCell>
            <TableCell>{new Date(entry.submitted_at).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={5} className="text-center font-medium">
            Total Teams: {entries.length}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}
