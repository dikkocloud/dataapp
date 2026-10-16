"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Refresher() {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(t);
  }, [router]);
  return null;
}
