import React, { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Play, Eye, Grid } from "lucide-react";

interface GalleryItem {
  src: string;
  category: string;
  alt: string;
  type: "image" | "video";
}

export const Gallery: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [visibleCount, setVisibleCount] = useState<number>(24);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const categories = ["Todos", "Arquitectura", "Interiores", "Amenidades", "Detalles", "Paisajismo"];

  // Fetch the manifest on mount
  useEffect(() => {
    fetch("/media/gallery-manifest.json")
      .then((res) => res.json())
      .then((data: GalleryItem[]) => {
        // Clean paths if they contain double slashes or other artifacts
        const cleanedData = data.map((item) => ({
          ...item,
          src: item.src.replace(/\/+/g, "/"),
        }));
        setItems(cleanedData);
        setFilteredItems(cleanedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading gallery manifest:", err);
        setLoading(false);
      });
  }, []);

  // Filter items when category changes
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setVisibleCount(24); // Reset pagination
    setLightboxIndex(null);

    if (category === "Todos") {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(
        (item) => item.category.toLowerCase() === category.toLowerCase()
      );
      setFilteredItems(filtered);
    }
  };

  const loadMore = () => {
    setVisibleCount((prev) => prev + 24);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const navigateLightbox = (direction: "prev" | "next") => {
    if (lightboxIndex === null) return;
    
    let newIndex = lightboxIndex;
    if (direction === "prev") {
      newIndex = lightboxIndex === 0 ? filteredItems.length - 1 : lightboxIndex - 1;
    } else {
      newIndex = lightboxIndex === filteredItems.length - 1 ? 0 : lightboxIndex + 1;
    }
    setLightboxIndex(newIndex);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") navigateLightbox("prev");
      if (e.key === "ArrowRight") navigateLightbox("next");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, filteredItems]);

  return (
    <div className="relative min-h-[90vh] text-[#E1D9C1] py-12 px-4 sm:px-6 md:px-8 space-y-12 overflow-hidden">

      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E2725B] px-3 py-1 bg-[#E2725B]/10 rounded-full border border-[#E2725B]/20">
          Visualización de Habilitación
        </span>
        <h2 className="font-display text-4xl sm:text-5xl font-bold uppercase text-white tracking-wide">
          Galería del Proyecto
        </h2>
        <p className="text-stone-300 font-sans text-xs sm:text-sm font-light leading-relaxed">
          Explora los renders y secuencias cinemáticas de los acabados, interiores, y paisajismo xerófilo de Moon Paracas.
        </p>
      </div>

      {/* Category Navigation (Glassmorphic Dock) */}
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-1.5 p-2 bg-[#1D1714]/45 border border-[rgba(225,217,193,0.15)] rounded-full backdrop-blur-md">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all duration-300 cursor-pointer ${
              activeCategory === cat
                ? "bg-[#E2725B] text-white shadow-[0_0_12px_rgba(226,114,91,0.25)]"
                : "text-[#E1D9C1]/80 hover:text-white hover:bg-white/5"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 border-4 border-[#E2725B]/25 border-t-[#E2725B] rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-[#E1D9C1]/60">Cargando Galería...</p>
        </div>
      ) : (
        <div className="max-w-[1400px] mx-auto space-y-12">
          {/* Gallery Grid */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-white/10 rounded-lg">
              <Grid className="w-12 h-12 text-[#E1D9C1]/30 mx-auto mb-4" />
              <p className="text-xs uppercase tracking-widest text-[#E1D9C1]/60">No se encontraron archivos en esta categoría.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredItems.slice(0, visibleCount).map((item, index) => (
                <div
                  key={item.src}
                  onClick={() => openLightbox(index)}
                  className="group relative aspect-square bg-[#100C0A] border border-white/5 overflow-hidden shadow-lg cursor-pointer hover:border-[#E2725B]/50 transition-all duration-300"
                >
                  {/* Media Content */}
                  {item.type === "video" ? (
                    <div className="w-full h-full relative">
                      <video
                        src={item.src}
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                        }}
                      />
                      <div className="absolute top-3 right-3 bg-black/60 p-1.5 rounded-full border border-white/10">
                        <Play className="w-3.5 h-3.5 text-white fill-white" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.src}
                      alt={item.alt}
                      loading="lazy"
                      className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                  )}

                  {/* Overlays on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#100C0A] via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#E2725B] mb-1">
                      {item.category}
                    </span>
                    <h4 className="text-xs font-semibold text-white tracking-wide truncate">
                      {item.alt || "Moon Paracas View"}
                    </h4>
                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-1.5 text-[9px] text-stone-300">
                      <Eye className="w-3.5 h-3.5" />
                      Ampliar Vista
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {filteredItems.length > visibleCount && (
            <div className="flex justify-center pt-6">
              <button
                onClick={loadMore}
                className="px-8 py-3 bg-transparent hover:bg-white/5 border border-[#E1D9C1]/20 text-[#E1D9C1] hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer"
              >
                Cargar Más Diseños
              </button>
            </div>
          )}
        </div>
      )}

      {/* Immersive Fullscreen Lightbox */}
      {lightboxIndex !== null && filteredItems[lightboxIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0F19]/95 backdrop-blur-md">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-[#E1D9C1] hover:text-white p-2 border border-white/10 hover:border-white/20 transition-all rounded-full cursor-pointer z-50 bg-black/40"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Controls */}
          <button
            onClick={() => navigateLightbox("prev")}
            className="absolute left-6 text-[#E1D9C1] hover:text-white p-3 border border-white/10 hover:border-white/20 transition-all rounded-full cursor-pointer z-50 bg-black/40 active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => navigateLightbox("next")}
            className="absolute right-6 text-[#E1D9C1] hover:text-white p-3 border border-white/10 hover:border-white/20 transition-all rounded-full cursor-pointer z-50 bg-black/40 active:scale-95"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Lightbox Canvas Area */}
          <div className="flex flex-col items-center justify-center w-full h-full p-4 md:p-12 select-none">
            <div className="relative max-h-[75vh] max-w-[90vw] flex items-center justify-center shadow-2xl border border-white/10 bg-black">
              {filteredItems[lightboxIndex].type === "video" ? (
                <video
                  src={filteredItems[lightboxIndex].src}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="max-h-[75vh] max-w-[90vw] object-contain"
                />
              ) : (
                <img
                  src={filteredItems[lightboxIndex].src}
                  alt={filteredItems[lightboxIndex].alt}
                  className="max-h-[75vh] max-w-[90vw] object-contain"
                />
              )}
            </div>

            {/* Bottom Meta panel */}
            <div className="mt-6 text-center max-w-2xl px-4 space-y-2">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#E2725B] px-2.5 py-1 bg-[#E2725B]/10 border border-[#E2725B]/20 rounded-full">
                {filteredItems[lightboxIndex].category}
              </span>
              <h3 className="font-display text-lg font-semibold text-white tracking-wide mt-2">
                {filteredItems[lightboxIndex].alt || "Moon Paracas - Habilitación Sostenible"}
              </h3>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest font-light">
                {lightboxIndex + 1} de {filteredItems.length} archivos
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
