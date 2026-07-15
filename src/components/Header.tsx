import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { TreePine, Receipt, Map, Home, Image, Tent, ChevronDown } from "lucide-react";

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
      <circle cx="50" cy="50" r="44" stroke={dark ? "#F4F4F1" : "#C4A484"} strokeWidth="3" />
      <path d="M 12,65 Q 32,44 54,62 T 88,58" stroke={dark ? "#C4A484" : "#2D3339"} strokeWidth="2.5" strokeLinecap="square" fill="none" />
      <path d="M 18,74 Q 45,58 68,70 T 84,68" stroke={dark ? "#F4F4F1" : "#C4A484"} strokeWidth="2" strokeLinecap="square" fill="none" />
      <path d="M 68,26 A 14,14 0 0 0 54,42" stroke={dark ? "#C4A484" : "#F4F4F1"} strokeWidth="2" />
    </svg>
  );
};

export const Header: React.FC = () => {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { id: "/", icon: <Home className="w-3.5 h-3.5" />, label: "El Proyecto" },
    { id: "/simulador", icon: <Map className="w-3.5 h-3.5" />, label: "El Masterplan" },
    { id: "/paracas-dome", icon: <Tent className="w-3.5 h-3.5" />, label: "Paracas Dome" },
    { id: "/galeria", icon: <Image className="w-3.5 h-3.5" />, label: "Galería" },
  ];

  const secondaryItems = [
    { id: "/experiencia", icon: <TreePine className="w-4 h-4" />, label: "Trayectoria" },
    { id: "/tecnica", icon: <Receipt className="w-4 h-4" />, label: "Memoria Técnica" }
  ];

  const isSecondaryActive = secondaryItems.some(item => 
    location.pathname === item.id || location.pathname.startsWith(`${item.id}/`)
  );

  return (
    <header className="sticky top-0 z-40 flex flex-col w-full shadow-lg">
      {/* Sticky Microcopy Bar (Quiet Luxury) - Hidden on mobile to save space */}
      <div className="w-full bg-[#100C0A] border-b border-[#3A2E26] text-center py-1.5 px-4 hidden sm:block">
        <p className="font-sans text-[9px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#E1D9C1]/85">
          Arquitectura, paisaje y estructura: el privilegio de la baja densidad.
        </p>
      </div>
      
      {/* Main Header (Glassmorphic) */}
      <div className="border-b border-[#E1D9C1]/15 bg-[#1D1714]/90 backdrop-blur-md text-white px-4 py-2.5 sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 flex-col lg:flex-row">
          {/* Brand Sign */}
          <Link to="/" className="flex items-center gap-3 sm:gap-4 group shrink-0">
            <div className="w-10 h-10 sm:w-[52px] sm:h-[52px] bg-[#E2725B] flex items-center justify-center font-display font-black text-xl sm:text-2xl text-white group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(226,114,91,0.3)]">
              M
            </div>
            <div className="flex flex-col justify-center text-left">
              <h1 className="font-display text-xl sm:text-2xl font-bold tracking-widest text-[#E1D9C1] uppercase leading-none mb-1 sm:mb-1.5">
                MOON <span className="font-light text-[#E2725B]">PARACAS</span>
              </h1>
              <p className="text-[8px] sm:text-[10px] uppercase font-bold tracking-[0.25em] text-[#E1D9C1]/75 leading-none">
                Refugio Residencial Exclusivo
              </p>
            </div>
          </Link>

          {/* Centered Horizontal Nav Pills */}
          <div className="flex overflow-visible w-full lg:w-auto items-center justify-center gap-1.5 pb-2 lg:pb-0 pt-2 lg:pt-0 border-t border-[#E1D9C1]/10 lg:border-none mt-2 lg:mt-0 px-2 lg:px-0">
            {navItems.map((item) => {
              const isActive = location.pathname === item.id || (item.id !== "/" && location.pathname.startsWith(`${item.id}/`));
              return (
                <Link
                  key={item.id}
                  to={item.id}
                  className={`flex items-center shrink-0 gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border ${
                    isActive 
                      ? "border-[#E2725B] text-white bg-[#E2725B]/25 shadow-[0_0_15px_rgba(226,114,91,0.25)]" 
                      : "border-[#E1D9C1]/10 text-[#E1D9C1]/75 hover:border-[#E2725B]/60 hover:text-white bg-[#E1D9C1]/5"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}

            {/* Dropdown Menu "Más" */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-1 px-3 py-2 sm:px-4 sm:py-2 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border cursor-pointer ${
                  isSecondaryActive
                    ? "border-[#E2725B] text-white bg-[#E2725B]/25 shadow-[0_0_15px_rgba(226,114,91,0.25)]"
                    : "border-[#E1D9C1]/10 text-[#E1D9C1]/75 hover:border-[#E2725B]/60 hover:text-white bg-[#E1D9C1]/5"
                }`}
              >
                <span>Más</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-[#E1D9C1]/15 bg-[#1D1714]/95 backdrop-blur-xl shadow-2xl p-1.5 flex flex-col gap-1 z-50">
                  {secondaryItems.map((item) => {
                    const isActive = location.pathname === item.id;
                    return (
                      <Link
                        key={item.id}
                        to={item.id}
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                          isActive
                            ? "bg-[#E2725B] text-white"
                            : "text-[#E1D9C1]/80 hover:bg-[#E1D9C1]/5 hover:text-white"
                        }`}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Conversión CTA Button (Desktop-only) */}
          <div className="hidden lg:block shrink-0">
            <Link
              to="/simulador"
              className="bg-[#E2725B] hover:bg-[#d85e45] text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(226,114,91,0.2)] border border-[#E2725B]/40 active:translate-y-0.5"
            >
              Simulador de Lotes
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
