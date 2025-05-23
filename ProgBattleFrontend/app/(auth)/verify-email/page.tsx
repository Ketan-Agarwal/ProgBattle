"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { verifyEmail } from "@/lib/api";

function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    if (!token) {
      setMessage("No token found.");
      return;
    }

    const verify = async () => {
      try {
        const data = await verifyEmail(token);
        setMessage(data.message || "Email verified successfully.");
      } catch (e: any) {
        console.error("Verification error:", e);
        setMessage(
          e?.response?.data?.message || "Verification failed. Please try again."
        );
      }
    };

    verify();
  }, [token]);

  return <div className="p-4 text-center">{message}</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <VerifyEmailClient />
    </Suspense>
  );
}
