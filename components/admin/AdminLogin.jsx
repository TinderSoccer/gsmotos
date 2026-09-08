"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLogin() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, pass }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "No se pudo iniciar sesión.");
        setLoading(false);
        return;
      }
      // La página es un Server Component: refresh() vuelve a pedirla al
      // servidor, que ahora sí ve la cookie de sesión y muestra el panel.
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#0B0B0B] px-6">
      <Image src="/images/logo-gsmotos.png" alt="GSmotos" width={300} height={200} className="block h-auto w-[170px]" />
      <form onSubmit={handleSubmit} className="flex w-full max-w-[360px] flex-col gap-4 rounded-xl border border-[#1E2226] bg-white/[0.02] p-7">
        <div className="font-display text-xl font-bold italic uppercase text-white">Panel de administración</div>
        <label className="flex flex-col gap-1.5 text-sm text-white/80">
          Usuario
          <input
            autoFocus
            required
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="rounded border border-white/15 bg-black/40 px-3.5 py-2.5 text-white outline-none focus:border-mCyan"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-white/80">
          Contraseña
          <input
            required
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="rounded border border-white/15 bg-black/40 px-3.5 py-2.5 text-white outline-none focus:border-mCyan"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded bg-mBlue py-3 font-display text-sm font-semibold uppercase tracking-[2.2px] text-white transition-colors hover:bg-mCyan disabled:opacity-60"
        >
          {loading ? "Ingresando…" : "Ingresar"}
        </button>
        {error && <div className="text-sm text-mRed">{error}</div>}
      </form>
    </div>
  );
}
