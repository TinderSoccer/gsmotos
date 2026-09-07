import Image from "next/image";
import SectionMark from "./SectionMark";

export default function DarkFeatureBlock({
  eyebrow,
  title,
  text,
  ctaLabel,
  ctaHref,
  photoNote,
  photoSrc,
  reverse = false,
}) {
  return (
    <section className="grid grid-cols-1 items-center gap-8 border-t border-[#1c1d20] bg-[#0c0d0f] px-6 py-10 sm:gap-12 sm:px-12 sm:py-16 md:grid-cols-2">
      <div className={reverse ? "md:order-2" : ""}>
        <SectionMark>{eyebrow}</SectionMark>
        <h2 className="font-display text-[clamp(26px,3vw,38px)] font-bold italic uppercase leading-tight text-white">
          {title}
        </h2>
        <p className="mt-3.5 max-w-[440px] text-[14.5px] leading-relaxed text-white/55">
          {text}
        </p>
        <a
          href={ctaHref}
          className="mt-6 inline-flex items-center gap-2.5 rounded-[2px] border-[1.5px] border-mCyan px-6 py-3.5 font-display text-[13.5px] font-bold uppercase tracking-wide text-white hover:bg-mCyan/10"
        >
          {ctaLabel}
        </a>
      </div>
      <div className={`relative h-80 overflow-hidden rounded ${reverse ? "md:order-1" : ""}`}>
        {photoSrc ? (
          <Image src={photoSrc} alt={title} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#232428] to-[#0a0a0b] px-5 text-center font-display text-xs uppercase tracking-widest text-white/20">
            {photoNote}
          </div>
        )}
      </div>
    </section>
  );
}
