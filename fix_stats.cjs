const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

const oldStatsCode = `  const disponCount = lots.filter((l) => l.status === "available").length;`;

const newStatsCode = `  const residentialLots = lots.filter(l => l.blockId !== "PARKING");
  const parkingLots = lots.filter(l => l.blockId === "PARKING");
  
  const libresCount = residentialLots.filter(l => l.status === "available" || l.status === "offer").length;
  const reservadosCount = residentialLots.filter(l => l.status === "reserved").length;
  const vendidosCount = residentialLots.filter(l => l.status === "sold").length;
  const cocherasCount = parkingLots.length;`;

app = app.replace(oldStatsCode, newStatsCode);

const oldGrid = `<div className="bg-white border-4 border-[#2D3339] p-4 shadow-[4px_4px_0px_#2D3339]">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Precios desde</p>
            <p className="font-display font-black text-[#2D3339] text-2xl sm:text-3xl">S/ 12,000</p>
          </div>
          <div className="bg-white border-4 border-[#2D3339] p-4 shadow-[4px_4px_0px_#2D3339]">
            <p className="text-xs font-bold text-[#A3B18A] uppercase tracking-widest mb-1.5">Lotes Disponibles</p>
            <p className="font-display font-black text-[#A3B18A] text-2xl sm:text-3xl">{disponCount}</p>
          </div>
          <div className="bg-white border-4 border-[#2D3339] p-4 shadow-[4px_4px_0px_#2D3339]">
            <p className="text-xs font-bold text-[#E0B084] uppercase tracking-widest mb-1.5">Fases en Preventa</p>
            <p className="font-display font-black text-[#E0B084] text-2xl sm:text-3xl">5</p>
          </div>
          <div className="bg-white border-4 border-[#2D3339] p-4 shadow-[4px_4px_0px_#2D3339]">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Financiamiento Directo</p>
            <p className="font-display font-black text-[#2D3339] text-[1.1rem] sm:text-xl mt-2 leading-tight">0% Interés - 18 Meses</p>
          </div>`;

const newGrid = `<div className="bg-white border-4 border-[#2D3339] p-4 shadow-[4px_4px_0px_#A3B18A]">
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
          </div>`;

app = app.replace(oldGrid, newGrid);

fs.writeFileSync('src/App.tsx', app);
console.log('Fixed hero stats');
