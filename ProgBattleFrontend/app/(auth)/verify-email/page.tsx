"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

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
        const res = await fetch(`/api/verify-email?token=${token}`);
        const data = await res.json();
        setMessage(data.message);
      } catch (e) {
        setMessage("Verification failed.");
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
