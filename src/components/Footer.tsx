import React, { useState } from "react";
import { ShieldCheck, MessageSquare, Trees, Phone, Mail, Map } from "lucide-react";
import { Lot } from "../types/map";

interface FooterProps {
  selectedLot?: Lot | null;
}

export const Footer: React.FC<FooterProps> = ({ selectedLot }) => {
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  return (
    <div className="w-full bg-[#0A0807] text-[#F5F2EB]">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-stone-900 px-5 py-4 text-sm text-white border border-[#F5F2EB]/15 flex items-center gap-3 shadow-2xl animate-fade-in">
          <ShieldCheck className="h-5 w-5 text-[#D95D39]" />
          <span className="font-bold tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* SOLICITAR ASESORÍA PRIVADA - Full Width */}
      <div id="contact-form" className="relative w-full border-t border-[#F5F2EB]/10">
        <div className="absolute inset-0 bg-[#0A0807]/90 backdrop-blur-md" />
        
        <div className="relative z-10 p-8 md:p-16 max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="inline-block px-3 py-1 border border-[#D95D39]/50 bg-[#D95D39]/10 rounded-full font-sans text-[10px] font-bold tracking-[0.25em] text-[#D95D39] uppercase shadow-sm">
              Asesoría y Cotización
            </span>
            <h3 className="font-display text-5xl sm:text-6xl font-black text-white tracking-tight uppercase drop-shadow-lg">
              CONTÁCTANOS
            </h3>
            <p className="text-lg text-stone-300 font-light">
              Déjanos tus datos y un asesor especializado de Moon Paracas se pondrá en contacto contigo para agendar una visita privada al desierto.
            </p>
          </div>

          {formSubmitted ? (
            <div className="border border-[#F5F2EB]/15 bg-[#16110F]/80 p-10 text-center space-y-4 max-w-xl mx-auto animate-fade-in font-mono shadow-2xl rounded-2xl">
              <span className="text-5xl text-[#D95D39] drop-shadow-md">🏜️</span>
              <h4 className="font-black text-2xl text-white uppercase tracking-wider">¡Solicitud Registrada!</h4>
              <p className="text-base text-stone-300 leading-relaxed">
                Gracias, <strong className="text-[#D95D39]">{contactName}</strong>. Un arquitecto-promotor te contactará por correo a <em className="text-stone-400">{contactEmail}</em> o vía WhatsApp al <em className="text-stone-400">{contactPhone}</em>.
              </p>
              <button
                onClick={() => {
                  setFormSubmitted(false);
                  setContactName("");
                  setContactEmail("");
                  setContactPhone("");
                  setContactMessage("");
                }}
                className="mt-6 bg-[#D95D39] text-white border border-[#D95D39]/40 rounded-xl px-6 py-3.5 text-xs font-bold tracking-widest hover:bg-[#d85e45] transition-colors cursor-pointer"
              >
                REGISTRAR OTRA CONSULTA
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!contactName || !contactPhone || !contactEmail) {
                  setToastMessage("Por favor rellena todos los campos obligatorios (*).");
                  setTimeout(() => setToastMessage(null), 3000);
                  return;
                }
                setFormSubmitted(true);
              }}
              className="bg-[#16110F]/70 border border-[#F5F2EB]/10 rounded-3xl p-10 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto font-sans text-xs text-[#F5F2EB]"
            >
              <div className="md:col-span-2 p-4 bg-[#0A0807]/80 border-l-4 border-[#D95D39] text-sm text-stone-300 font-bold flex items-center gap-4 rounded-r-xl">
                <ShieldCheck className="h-6 w-6 text-[#D95D39] flex-shrink-0" />
                Al solicitar asesoría, garantizamos absoluta confidencialidad sobre su estructuración de pagos e información crediticia.
              </div>
              
              {/* Left Column Fields */}
              <div className="space-y-6 text-[#F5F2EB]">
                <div className="space-y-2">
                  <label className="font-bold uppercase text-xs text-stone-400 tracking-wider flex justify-between">
                    <span>Nombre Completo *</span>
                    <span className="text-[#D95D39]">Requerido</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-[#F5F2EB]/15 bg-[#0A0807]/75 px-4 py-3 text-white placeholder-stone-500 focus:border-[#D95D39] focus:outline-none focus:ring-1 focus:ring-[#D95D39] transition-all text-sm"
                    placeholder="Ej. Carlos Mendoza Quiroz"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-bold uppercase text-xs text-stone-400 tracking-wider flex justify-between">
                    <span>WhatsApp / Celular *</span>
                    <span className="text-[#D95D39]">+51</span>
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full rounded-xl border border-[#F5F2EB]/15 bg-[#0A0807]/75 px-4 py-3 text-white placeholder-stone-500 focus:border-[#D95D39] focus:outline-none focus:ring-1 focus:ring-[#D95D39] transition-all text-sm"
                    placeholder="Ej. +51 987 654 321"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-bold uppercase text-xs text-stone-400 tracking-wider">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    className="w-full rounded-xl border border-[#F5F2EB]/15 bg-[#0A0807]/75 px-4 py-3 text-white placeholder-stone-500 focus:border-[#D95D39] focus:outline-none focus:ring-1 focus:ring-[#D95D39] transition-all text-sm"
                    placeholder="Ej. carlos.mendoza@gmail.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Right Column Fields */}
              <div className="space-y-6 flex flex-col justify-between text-[#F5F2EB]">
                <div className="space-y-2">
                  <label className="font-bold uppercase text-xs text-stone-400 tracking-wider">Lote de Interés (Opcional)</label>
                  <input
                    type="text"
                    disabled
                    className="w-full rounded-xl border border-[#F5F2EB]/15 bg-[#0A0807]/30 px-4 py-3 font-bold text-[#D95D39] text-sm cursor-not-allowed"
                    value={
                      selectedLot 
                        ? `Lote ${selectedLot.number} - ${selectedLot.quadrant} (${selectedLot.area.toFixed(2)} m²)`
                        : "General / Aún evaluando"
                    }
                  />
                </div>

                <div className="space-y-2 flex-1 flex flex-col">
                  <label className="font-bold uppercase text-xs text-stone-400 tracking-wider">Mensaje (Opcional)</label>
                  <textarea
                    rows={4}
                    className="w-full rounded-xl border border-[#F5F2EB]/15 bg-[#0A0807]/75 px-4 py-3 text-white placeholder-stone-500 focus:border-[#D95D39] focus:outline-none focus:ring-1 focus:ring-[#D95D39] flex-1 min-h-[100px] transition-all resize-none text-sm"
                    placeholder="Deseo revisar los planos arquitectónicos y evaluar la estructura de financiamiento..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                  />
                </div>
              </div>

              {/* Form submit & secondary direct whatsapp trigger */}
              <div className="md:col-span-2 pt-6 flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#D95D39] hover:bg-[#d85e45] text-white font-bold text-xs py-4 px-6 rounded-xl uppercase tracking-widest transition-all shadow-md cursor-pointer"
                >
                  INICIAR EVALUACIÓN DE INGRESO
                </button>
                
                <a
                  href={`https://wa.me/51987654321?text=Hola!%20Deseo%20cotizar%20un%20lote%20en%20Moon%20Paracas.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#16110F] hover:bg-[#1C1613] text-[#F5F2EB] font-bold text-xs py-4 px-6 rounded-xl border border-[#F5F2EB]/15 flex items-center justify-center gap-2 transition-all shadow-md group cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4 text-[#25D366] group-hover:scale-110 transition-transform" />
                  WHATSAPP DIRECTO
                </a>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Small Legal Footer */}
      <div className="w-full bg-[#0A0807] border-t border-[#F5F2EB]/10 py-8 px-6 text-stone-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Trees className="h-6 w-6 text-[#D95D39]" />
            <div>
              <p className="font-bold text-white uppercase tracking-widest">MOON PARACAS</p>
              <p className="text-[10px] text-stone-500 mt-1">© 2026 Asociación Civil de Adjudicatarios Moon Paracas · Ica, Perú.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-stone-400 text-[11px] font-bold">
            <span className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
              <Phone className="h-4 w-4 text-[#D95D39]" /> +51 987 654 321
            </span>
            <span className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
              <Mail className="h-4 w-4 text-[#D95D39]" /> info@moonparacas-eco.pe
            </span>
            <span className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
              <Map className="h-4 w-4 text-[#D95D39]" /> Paracas, Km 245 Panamericana Sur
            </span>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/51987654321?text=Hola!%20Deseo%20m%C3%A1s%20informaci%C3%B3n%20sobre%20los%20lotes%20en%20Moon%20Paracas."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 bg-[#25D366] hover:bg-[#128C7E] text-white p-3.5 md:p-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:scale-110 transition-transform duration-300 flex items-center justify-center group"
        aria-label="Contactar por WhatsApp"
      >
        <MessageSquare className="h-7 w-7 fill-current" />
        <span className="absolute right-16 bg-white text-stone-800 text-xs font-bold px-3 py-1.5 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
          ¡Escríbenos!
        </span>
      </a>
    </div>
  );
};
