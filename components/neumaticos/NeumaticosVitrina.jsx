"use client";

import { useEffect, useRef, useState } from "react";
import { ImageOff } from "lucide-react";
import ColorBars from "@/components/services/ColorBars";
import SmartImage from "@/components/common/SmartImage";
import Button from "@/components/common/Button";
import { NEUMATICOS_USOS } from "@/lib/neumaticosContent";
import { useNeumaticosStock } from "@/lib/neumaticosStock";
import { useSettings, whatsappUrl } from "@/lib/settings";
import { formatCLP } from "@/lib/catalogo";

// Evento con el que las tarjetas de "Tipos de uso" (NeumaticosUsos.jsx)
// abren la vitrina de su tipo y bajan hasta ella.
export const VITRINA_EVENT = "gsm:vitrina-uso";
export const VITRINA_ID = "en-stock";

// Vitrinas de neumáticos en stock, una por tipo de uso (pedido del
// cliente: solo foto, título y valor, sin buscador). Christopher las
// administra desde /administracion → "Stock neumáticos" (ver
// lib/neumaticosStock.js).
function TireCard({ item }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#1E2226] bg-surface-card">
      <div className="relative aspect-square w-full overflow-hidden bg-[#EFEDE9]">
        {item.photo ? (
          <SmartImage src={item.photo} alt={item.title || "Neumático"} fit="contain" className="p-2.5 sm:p-3" sizes="(max-width: 639px) 45vw, (max-width: 1023px) 30vw, 240px" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 bg-[repeating-linear-gradient(135deg,#EDEBE7_0_10px,#E4E1DB_10px_20px)]">
            <ImageOff size={20} strokeWidth={1.4} className="text-[#8C857C]" />
            <span className="font-display text-[10px] uppercase tracking-[1.4px] text-[#5E5850]">Foto próximamente</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 px-3.5 pb-3.5 pt-3 sm:px-4 sm:pb-4">
        <div className="line-clamp-3 font-display text-[15px] font-semibold uppercase leading-[1.15] tracking-[0.4px] text-white sm:text-[17px]">
          {item.title || "Neumático"}
        </div>
        <div className="mt-auto border-t border-white/[0.07] pt-2.5 font-display text-[17px] font-bold leading-none text-white sm:text-xl">
          {item.price > 0 ? formatCLP(item.price) : "Precio a consultar"}
        </div>
      </div>
    </div>
  );
}

// `embedded`: dentro del panel de la home, que ya tiene sus márgenes.
export default function NeumaticosVitrina({ embedded = false }) {
  const stock = useNeumaticosStock();
  const s = useSettings();
  const [active, setActive] = useState(NEUMATICOS_USOS[0].slot);
  const sectionRef = useRef(null);

  useEffect(() => {
    function onOpen(ev) {
      setActive(ev.detail);
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    window.addEventListener(VITRINA_EVENT, onOpen);
    return () => window.removeEventListener(VITRINA_EVENT, onOpen);
  }, []);

  const uso = NEUMATICOS_USOS.find((u) => u.slot === active) || NEUMATICOS_USOS[0];
  const items = stock[uso.slot] || [];

  return (
    <section ref={sectionRef} id={VITRINA_ID} className={`scroll-mt-4 ${embedded ? "" : "px-6 pb-10 sm:px-10 lg:pb-14"}`}>
      <div className="flex flex-col gap-5 rounded-xl border border-[#1E2226] bg-surface-raised p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <ColorBars />
            <h2 className="font-display text-2xl font-bold italic uppercase leading-none tracking-wide text-white">Neumáticos en stock</h2>
          </div>
          <div role="tablist" aria-label="Tipo de uso" className="flex w-full gap-1 rounded-lg border border-[#1E2226] bg-[#0B0B0B] p-1 sm:w-auto">
            {NEUMATICOS_USOS.map(({ slot, title, Icon }) => {
              const on = slot === active;
              return (
                <button
                  key={slot}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActive(slot)}
                  className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md px-3 font-display text-[13px] font-semibold uppercase tracking-[1.5px] transition-colors sm:flex-none sm:px-4 sm:text-sm ${
                    on ? "bg-mBlue text-white" : "text-[#B9C0C7] hover:text-white"
                  }`}
                >
                  <Icon size={16} strokeWidth={1.8} className="hidden flex-none sm:block" aria-hidden="true" />
                  {title}
                </button>
              );
            })}
          </div>
        </div>

        <p className="-mt-1 text-[14px] leading-snug text-[#B9C0C7]">{uso.subtitle}</p>

        {items.length ? (
          <div role="tabpanel" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((item) => (
              <TireCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p role="tabpanel" className="text-[14.5px] leading-snug text-[#B9C0C7]">
            Por ahora no hay neumáticos {uso.title.toLowerCase()} publicados.
          </p>
        )}

        {/* En todas las vitrinas, con o sin neumáticos (pedido del cliente). */}
        <div className="flex flex-col items-start gap-4 rounded-lg border border-dashed border-[#2E3A45] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="font-display text-lg font-bold italic uppercase leading-tight text-white">¿No encontraste tu neumático?</div>
            <p className="text-[14.5px] leading-snug text-[#B9C0C7]">Consúltanos y nosotros lo buscamos.</p>
          </div>
          <Button
            block="mobile"
            variant="whatsapp"
            size="sm"
            href={whatsappUrl(s.phoneDigits, `Hola GSmotos, busco un neumático ${uso.title.toLowerCase()} para mi moto.`)}
          >
            Consultar por WhatsApp
          </Button>
        </div>
      </div>
    </section>
  );
}
