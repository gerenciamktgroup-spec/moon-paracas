const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const start = app.indexOf('<div className="grid grid-cols-2 gap-4 md:grid-cols-4');
const end = app.indexOf('</div>', start + 1000) + 6;
const oldSection = app.substring(start, end);

const newSection = `<div className="grid grid-cols-2 gap-4 md:grid-cols-4 mt-8 pb-4 text-center">
          <div className="bg-white border-4 border-[#2D3339] p-4 shadow-[4px_4px_0px_#A3B18A]">
            <p className="text-xs font-bold text-[#A3B18A] uppercase tracking-widest mb-1.5">Lotes Libres</p>
            <p className="font-display font-black text-[#A3B18A] text-2xl sm:text-3xl">{libresCount}</p>
          </div>
          <div className="bg-white border-4 border-[#2D3339] p-4 shadow-[4px_4px_0px_#F57C00]">
            <p className="text-xs font-bold text-[#F57C00] uppercase tracking-widest mb-1.5">Lotes Reservados</p>
            <p className="font-display font-black text-[#F57C00] text-2xl sm:text-3xl">{reservadosCount}</p>
          </div>
          <div className="bg-white border-4 border-[#2D3339] p-4 shadow-[4px_4px_0px_#D32F2F]">
            <p className="text-xs font-bold text-[#D32F2F] uppercase tracking-widest mb-1.5">Lotes Vendidos</p>
            <p className="font-display font-black text-[#D32F2F] text-2xl sm:text-3xl">{vendidosCount}</p>
          </div>
          <div className="bg-white border-4 border-[#2D3339] p-4 shadow-[4px_4px_0px_#9E9E9E]">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Cocheras Totales</p>
            <p className="font-display font-black text-stone-500 text-2xl sm:text-3xl">{cocherasCount}</p>
          </div>
        </div>`;

app = app.replace(oldSection, newSection);

fs.writeFileSync('src/App.tsx', app);
console.log('Fixed third grid');
