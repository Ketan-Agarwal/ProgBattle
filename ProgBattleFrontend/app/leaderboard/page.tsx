import { Leaderboard } from "@/components/leaderboard";

export default function LeaderboardPage() {
    return (
        <main className="lg:ml-64 pt-20 p-6 min-h-screen">
        <h1 className="text-2xl font-bold">Leaderboard - Round 1</h1>
        <p className="">Here you can view the leaderboard. Top 16 teams will be equalified for 2nd round.</p>
        <Leaderboard />
        </main>
    );
    }