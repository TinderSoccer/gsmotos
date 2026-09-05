export default function SectionMark({ children }) {
  return (
    <div className="mb-4 flex items-center font-display text-[12.5px] font-bold uppercase tracking-widest text-white/55">
      <span className="mr-2.5 flex gap-[3px]">
        <span className="h-1 w-3.5 -skew-x-[20deg] rounded-sm bg-mBlue" />
        <span className="h-1 w-3.5 -skew-x-[20deg] rounded-sm bg-mRed" />
      </span>
      {children}
    </div>
  );
}
