'use client';
import { SubmissionsTable } from "@/components/SubmissionTable";
import { useEffect } from "react";
import { useUser } from "@/Context/UserContext";
import { toast } from "sonner";
export default function SubmissionsPage() {
    const { user } = useUser();

    useEffect(() => {
        const isLoggedIn = user && user.email;
        if (!isLoggedIn) {
            window.location.href = "/login";
            toast.error("Please login to submit bots and view submissions.");
        }
    }, []);

    return (
        <main className="lg:ml-64 p-6 min-h-screen">
        <h1 className="text-2xl font-bold">Submissions</h1>
        <p className="">Here you can view your submissions.</p>
        
        

        <SubmissionsTable />
        </main>
    );
    }