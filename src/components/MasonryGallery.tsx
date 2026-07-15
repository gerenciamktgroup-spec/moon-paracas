import React, { useState, useEffect } from "react";
import { Camera, X, ChevronLeft, ChevronRight, Play } from "lucide-react";

type GalleryItem = {
  src: string;
  category: string;
  alt: string;
  type: "image" | "video";
};

export const MasonryGallery: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("Todas");
  const [visibleCount, setVisibleCount] = useState<number>(15);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch("/media/gallery-manifest.json")
      .then((r) => r.json())
      .then((data) => {
        // Randomize slightly or just keep as is
        setItems(data);
      })
      .catch((e) => console.error("Error loading gallery:", e));
  }, []);

  const categories = ["Todas", ...Array.from(new Set(items.map(i => i.category))).sort()];

  const filteredItems = items.filter(
    (item) => activeCategory === "Todas" || item.category === activeCategory
  );

  const displayedItems = filteredItems.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 15);
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setVisibleCount(15);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = "auto";
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex(prev => prev !== null ? (prev === 0 ? filteredItems.length - 1 : prev - 1) : null);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex(prev => prev !== null ? (prev === filteredItems.length - 1 ? 0 : prev + 1) : null);
  };

  return (
    <div id="masonry-gallery" className="rounded-none border border-stone-200 bg-white p-6 md:p-10 shadow-sm space-y-8 max-w-6xl mx-auto my-12">
      {/* Title block */}
      <div className="border-b border-stone-200 pb-5 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-[#2D3339] flex items-center justify-center gap-3">
          <Camera className="h-7 w-7 text-[#C4A484]" />
          La Materialidad del Desierto
        </h2>
        <p className="text-base text-stone-600 mt-2 max-w-2xl mx-auto">
          Cada detalle en Moon Paracas ha sido pensado para rendir homenaje a la naturaleza árida, utilizando texturas nobles, tonos cálidos y técnicas ancestrales.
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-300 border ${
              activeCategory === cat
                ? "bg-[#C4A484] text-white border-[#C4A484]"
                : "bg-white text-stone-500 border-stone-200 hover:border-[#C4A484] hover:text-[#C4A484]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* CSS columns masonry layout */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {displayedItems.map((item, idx) => (
          <div 
            key={idx} 
            className="break-inside-avoid relative group overflow-hidden border-2 border-[#2D3339] shadow-[3px_3px_0px_#2D3339] cursor-pointer"
            onClick={() => openLightbox(idx)}
          >
            {item.type === "video" ? (
              <>
                <video 
                  src={item.src} 
                  className="w-full h-auto object-cover" 
                  preload="metadata"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                  <Play className="text-white w-12 h-12 opacity-80" />
                </div>
              </>
            ) : (
              <img 
                src={item.src} 
                alt={item.alt} 
                loading="lazy"
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/20 transition-colors duration-300 pointer-events-none" />
            
            {/* Category Tag on Hover */}
            <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <span className="bg-white/90 backdrop-blur-sm text-[#2D3339] text-xs font-bold uppercase tracking-wider px-2 py-1 shadow-sm">
                {item.category}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {visibleCount < filteredItems.length && (
        <div className="flex justify-center mt-12 pt-8">
          <button 
            onClick={handleLoadMore}
            className="bg-[#2D3339] text-white px-8 py-3 font-bold uppercase tracking-widest text-sm hover:bg-[#C4A484] transition-colors border-2 border-transparent hover:border-[#2D3339] flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            Cargar Más Fotos ({filteredItems.length - visibleCount} restantes)
          </button>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md" onClick={closeLightbox}>
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
            onClick={closeLightbox}
          >
            <X className="w-10 h-10" />
          </button>

          <button 
            className="absolute left-4 md:left-10 text-white/50 hover:text-white transition-colors p-4"
            onClick={prevImage}
          >
            <ChevronLeft className="w-12 h-12" />
          </button>

          <div className="relative max-w-5xl max-h-[85vh] w-full px-12 md:px-24 flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {filteredItems[lightboxIndex].type === "video" ? (
              <video 
                src={filteredItems[lightboxIndex].src} 
                controls 
                autoPlay 
                className="max-w-full max-h-[85vh] object-contain shadow-2xl border border-white/10"
              />
            ) : (
              <img 
                src={filteredItems[lightboxIndex].src} 
                alt={filteredItems[lightboxIndex].alt}
                className="max-w-full max-h-[85vh] object-contain shadow-2xl border border-white/10"
              />
            )}
            
            <div className="absolute -bottom-12 left-0 right-0 text-center text-white/80 font-mono text-sm">
              <span className="text-[#C4A484] font-bold uppercase mr-2">{filteredItems[lightboxIndex].category}</span>
              {filteredItems[lightboxIndex].alt} ({lightboxIndex + 1} / {filteredItems.length})
            </div>
          </div>

          <button 
            className="absolute right-4 md:right-10 text-white/50 hover:text-white transition-colors p-4"
            onClick={nextImage}
          >
            <ChevronRight className="w-12 h-12" />
          </button>
        </div>
      )}
    </div>
  );
};
