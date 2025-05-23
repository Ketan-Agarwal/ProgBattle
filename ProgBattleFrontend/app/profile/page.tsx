// app/dashboard/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/apiClient";
import ProfileCard from "@/components/ProfileCard";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ email: string; team_name: string | null; is_verified: boolean } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("user/getprofile");
        setProfile(res.data);
      } catch (err) {
        console.error("Auth failed:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) return <div className="p-4">Loading profile...</div>;
  if (!profile) return <div className="p-4 text-red-500">Failed to load profile.</div>;

    // page.tsx
return (
  <div className="bg-gray-100 min-h-screen">
    <div className="md:ml-64"> {/* This is important! Push content to the right on large screens */}
      <div className="flex justify-center items-center min-h-screen p-4">
        <ProfileCard email={profile.email} teamName={profile.team_name} is_verified={profile.is_verified} />
      </div>
    </div>
  </div>
);

}
