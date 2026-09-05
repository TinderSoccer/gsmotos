import AdminPanel from "@/components/admin/AdminPanel";

// Ruta sin enlace desde la navegación pública (igual que en el diseño
// original de Claude Design) — se accede escribiendo /administracion.
export const metadata = {
  title: "Panel de administración — GSmotos",
  robots: { index: false, follow: false },
};

export default function AdministracionPage() {
  return <AdminPanel />;
}
