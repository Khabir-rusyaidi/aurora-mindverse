"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useCurrentUser() {
  const [userName, setUserName] = useState<string>("USER");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const displayName =
        (user?.user_metadata?.displayName as string) ||
        (user?.email ? user.email.split("@")[0] : "USER");
      setUserName((displayName || "USER").toUpperCase());
    })();
  }, []);

  return userName;
}
