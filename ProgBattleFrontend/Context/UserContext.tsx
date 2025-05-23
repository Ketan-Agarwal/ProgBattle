// context/UserContext.tsx
"use client";

import { getProfile } from "@/lib/api";
import {useRouter} from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

type UserData = {
  user_id: string;
  email: string;
  team_id: string | null;

};

type UserContextType = {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  updateTeam: (team_id: string) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
    const router = useRouter();
  const updateTeam = (team_id: string) => {
    setUser((prev) =>
      prev ? { ...prev, team_id } : null
    );
  };
  useEffect(() => {
    (async () => {
      try {
        const data = await getProfile(); // this uses session cookie
        setUser(data); // persist in context
      } catch (err) {
        console.warn("User not logged in or session expired");
      }
    })();
  }, []);
  return (
    <UserContext.Provider value={{ user, setUser, updateTeam }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
