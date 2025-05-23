'use client';

import { useEffect, useState } from 'react';
import { getTeams, joinTeam } from '@/lib/api';
import { useUser } from '@/Context/UserContext';
import { Button } from './ui/button';
import { PasswordPromptDialog } from './PasswordDialog'; // 👈 You'll define this below
import { toast } from 'sonner';

type Team = {
  team_id: string;
  team_name: string;
  member_count: number;
};

export default function TeamsList() {
  const { user } = useUser();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const handleJoinTeam = async (teamId: string, password: string) => {
    try {
      await joinTeam(teamId, password);
      setTeams((prevTeams) =>
        prevTeams.map((team) =>
          team.team_id === teamId
            ? { ...team, member_count: team.member_count + 1 }
            : team
        )

      );
      console.log('password: ', password);
      console.log('teamId: ', teamId);
      window.location.reload();
    } catch (err: any) {
      console.error('Failed to join team:', err);
      toast.error("Failed to join team.", {
        description: err.response.data.detail || "An error occurred.",
      })
    }
  };

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await getTeams();
        setTeams(data.teams);
      } catch (err: any) {
        if (err.status !== 404) setError("Failed to load teams.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (loading) return <div className="p-4 text-gray-400">Loading teams...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4 text-white">Teams</h2>
      <ul className="space-y-3">
        {teams.length ? (
          teams.map((team) => (
            <li
              key={team.team_id}
              className="bg-gray-800 text-white p-4 rounded-lg shadow hover:bg-gray-700 group transition-all duration-200"
            >
              <div className="text-lg font-bold">
                {team.team_name}
                {team.team_id === user?.team_id && (
                  <span className="ml-2 text-sm text-green-500 font-semibold">
                    (Your Team)
                  </span>
                )}
                {user?.team_id === null && (
                  <span className="float-right text-black">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedTeamId(team.team_id);
                        setPasswordDialogOpen(true);
                      }}
                    >
                      Join Team
                    </Button>
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-400">
                {team.member_count} member{team.member_count !== 1 ? 's' : ''}
              </div>
            </li>
          ))
        ) : (
          <li className="bg-gray-800 text-white p-4 rounded-lg shadow">
            No teams available.
          </li>
        )}
      </ul>

      {/* Password Prompt Dialog */}
      {selectedTeamId && (
        <PasswordPromptDialog
          open={passwordDialogOpen}
          onClose={() => {
            setPasswordDialogOpen(false);
            setSelectedTeamId(null);
          }}
          onConfirm={(password: any) => handleJoinTeam(selectedTeamId, password)}
        />
      )}
    </div>
  );
}
