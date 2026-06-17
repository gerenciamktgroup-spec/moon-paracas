const fs = require('fs');
let code = fs.readFileSync('src/components/LotDetailsModal.tsx', 'utf8');

// Replace Empty State
code = code.replace(
  'Selecciona un lote',
  'Analiza el Emplazamiento'
);
code = code.replace(
  'Haz clic en cualquier parcela del máster plan interactivo para inspeccionar sus características técnicas, elevación y calcular sus cuotas de financiamiento.',
  'Haz clic en cualquier parcela del mapa para inspeccionar sus características técnicas, orientación y proyectar su estructura de inversión.'
);

// Replace Finanzas Texts
code = code.replace(
  'Financiamiento',
  'Estructura de Capital'
);

code = code.replace(
  'Pago Directo 0% Interés',
  'Financiamiento Directo (0% Interés Bancario)'
);

code = code.replace(
  'Cuota de Separación',
  'Fondo de Reserva'
);

code = code.replace(
  'Saldo a Financiar',
  'Capital a Estructurar'
);

code = code.replace(
  'Cuota Mensual (Aprox)',
  'Proyección Mensual'
);

code = code.replace(
  'SEPARAR LOTE AHORA',
  'INICIAR ADJUDICACIÓN'
);

fs.writeFileSync('src/components/LotDetailsModal.tsx', code);
console.log('LotDetailsModal Updated!');
