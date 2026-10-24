import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/integrations/firebase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setReady(true);
    });
    return () => unsubscribe();
  }, []);

  return {
    user,
    // Provide session alias to maintain backward compatibility with components checking !!session
    session: user ? { user } : null,
    ready,
  };
}
