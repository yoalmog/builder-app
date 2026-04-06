import React, { useState, useEffect } from "react";
import Builder from "./Builder";
import Auth from "./Auth";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  if (!user) {
    return <Auth user={user} setUser={setUser} />;
  }

  return (
    <div style={{ height: "100vh" }}>
      <Auth user={user} setUser={setUser} />
      <Builder user={user} />
    </div>
  );
}
