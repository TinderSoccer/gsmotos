import { cookies } from "next/headers";
import AdminPanel from "@/components/admin/AdminPanel";
import AdminLogin from "@/components/admin/AdminLogin";
import { isValidSession, SESSION_COOKIE } from "@/lib/adminAuth";

// Ruta sin enlace desde la navegación pública (igual que en el diseño
// original de Claude Design) — se accede escribiendo /administracion.
// Protegida con usuario/contraseña (ver lib/adminAuth.js y .env.example):
// esta página es un Server Component, así que la sesión se verifica acá
// mismo leyendo la cookie httpOnly — sin ella se muestra el login en vez
// del panel.
export const metadata = {
  title: "Panel de administración — GSmotos",
  robots: { index: false, follow: false },
};

export default async function AdministracionPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;

  if (!isValidSession(session)) {
    return <AdminLogin />;
  }

  return <AdminPanel />;
}
