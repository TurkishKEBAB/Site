"use client";

import { useEffect } from "react";

const getApiBaseUrl = () =>
  (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");

interface BlogViewTrackerProps {
  slug: string;
}

export default function BlogViewTracker({ slug }: BlogViewTrackerProps) {
  useEffect(() => {
    void fetch(`${getApiBaseUrl()}/blog/${encodeURIComponent(slug)}/view`, {
      method: "POST",
      keepalive: true,
    }).catch(() => {
      // View tracking is best-effort and must never affect the reader.
    });
  }, [slug]);

  return null;
}
