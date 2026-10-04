"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Logo from "@/components/Logo";

export default function AdminLogin() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
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
    <div data-admin className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#0B0B0B] px-6">
      <Logo alt="GSmotos" className="block h-auto w-[170px]" />
      <form onSubmit={handleSubmit} className="flex w-full max-w-[360px] flex-col gap-4 rounded-xl border border-[#1E2226] bg-white/[0.02] p-7">
        <div className="font-display text-xl font-bold italic uppercase text-white">Panel de administración</div>
        <label className="flex flex-col gap-1.5 text-sm text-white/80">
          Usuario
          {/* Sin mayúscula ni corrector automáticos (en el celular ponían la
              primera letra en mayúscula y el ingreso fallaba), letra de 16px
              para que el iPhone no haga zoom, y `autoComplete` para que el
              navegador ofrezca guardar la contraseña. */}
          <input
            autoFocus
            required
            value={user}
            onChange={(e) => setUser(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="rounded border border-white/15 bg-black/40 px-3.5 py-2.5 text-base text-white outline-none focus:border-mCyan"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-white/80">
          Contraseña
          <span className="relative flex">
            <input
              required
              type={showPass ? "text" : "password"}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded border border-white/15 bg-black/40 py-2.5 pl-3.5 pr-12 text-base text-white outline-none focus:border-mCyan"
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-white/60 hover:text-white"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded bg-mBlue py-3 font-display text-sm font-semibold uppercase tracking-[2.2px] text-white transition-colors hover:bg-mCyan disabled:opacity-60"
        >
          {loading ? "Ingresando…" : "Ingresar"}
        </button>
        {error && (
          <div role="alert" className="text-sm text-[#FF6B7F]">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
