'use client';

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyEmail } from "@/lib/api"; // Adjust path as needed

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("❌ Invalid or missing token.");
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus("✅ Email verified successfully!");
        setTimeout(() => router.push("/login"), 3000);
      } catch (err: any) {
        setStatus("❌ Verification failed. " + (err?.response?.data?.detail || err.message || "Unknown error"));
      }
    };

    verify();
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold">{status}</h1>
    </div>
  );
}
