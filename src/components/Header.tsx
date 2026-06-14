import React from "react";
import { TreePine, CalendarDays, Receipt, LogOut, User } from "lucide-react";

export const MoonLogo: React.FC<{ className?: string; size?: number; dark?: boolean }> = ({
  className = "",
  size = 48,
  dark = false,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-all duration-300`}
    >
      {/* Circle border */}
      <circle
        cx="50"
        cy="50"
        r="44"
        stroke={dark ? "#F4F4F1" : "#C4A484"}
        strokeWidth="3"
      />
      {/* Sand dune path 1 */}
      <path
        d="M 12,65 Q 32,44 54,62 T 88,58"
        stroke={dark ? "#C4A484" : "#2D3339"}
        strokeWidth="2.5"
        strokeLinecap="square"
        fill="none"
      />
      {/* Sand dune path 2 (secondary detail) */}
      <path
        d="M 18,74 Q 45,58 68,70 T 84,68"
        stroke={dark ? "#F4F4F1" : "#C4A484"}
        strokeWidth="2"
        strokeLinecap="square"
        fill="none"
      />
      {/* Sun/Moon tiny crescent glow */}
      <path
        d="M 68,26 A 14,14 0 0 0 54,42"
        stroke={dark ? "#C4A484" : "#F4F4F1"}
        strokeWidth="2"
      />
    </svg>
  );
};

export const Header: React.FC = () => {


  return (
    <header className="border-b-4 border-[#2D3339] bg-[#2D3339] text-white sticky top-0 z-40 px-6 py-4">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 lg:flex-row">
        {/* Brand Sign */}
        <div className="flex items-center gap-4">
          <div className="w-[52px] h-[52px] bg-[#C4A484] flex items-center justify-center font-display font-black text-2xl text-[#2D3339]">
            M
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="font-display text-2xl font-black tracking-widest text-white uppercase leading-none mb-1.5">
              MOON <span className="font-light text-[#C4A484]">PARACAS</span>
            </h1>
            <p className="text-xs uppercase font-bold tracking-[0.2em] text-[#C4A484] opacity-90 leading-none">
              Eco-Condominio de Playa
            </p>
          </div>
        </div>

        {/* High-level status metrics - Simplified for cleaner UX */}
        <div className="flex flex-wrap items-center justify-center gap-4">
        </div>
      </div>
    </header>
  );
};
