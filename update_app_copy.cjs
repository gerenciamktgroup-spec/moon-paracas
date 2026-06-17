const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

// Replace Hero Copy
app = app.replace(
  '<h2 className="font-display text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.1] drop-shadow-2xl">\n              REFUGIO EN EL OASIS\n            </h2>',
  '<h2 className="font-display text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.1] drop-shadow-2xl">\n              EL PRIVILEGIO DEL PAISAJE.<br/>LA CERTEZA DE LA ESTRUCTURA.\n            </h2>'
);

app = app.replace(
  '<p className="text-stone-200 text-lg sm:text-xl font-mono max-w-2xl drop-shadow-lg leading-relaxed">\n              Un eco-condominio de diseño donde el lujo es la desconexión total. Arquitectura que respeta el desierto, financiamiento directo y una reserva natural privada.\n            </p>',
  '<p className="text-stone-200 text-lg sm:text-xl font-mono max-w-2xl drop-shadow-lg leading-relaxed">\n              Un refugio territorial de baja densidad en Paracas. Arquitectura integrada, respaldo técnico comprobable y preservación absoluta del entorno.\n            </p>'
);

// Replace Hero CTAs
app = app.replace(
  '<span className="flex-1 text-center font-bold tracking-widest text-sm whitespace-nowrap">VER MASTERPLAN INTERACTIVO</span>',
  '<span className="flex-1 text-center font-bold tracking-widest text-sm whitespace-nowrap">EXPLORAR EL TERRITORIO</span>'
);

app = app.replace(
  '<span className="flex-1 text-center font-bold tracking-widest text-sm whitespace-nowrap">COTIZAR MI LOTE AHORA</span>',
  '<span className="flex-1 text-center font-bold tracking-widest text-sm whitespace-nowrap">EVALUAR INVERSIÓN</span>'
);

// Replace Stats Bar
app = app.replace('Lotes Libres', 'Disponibilidad Fase 1');
app = app.replace('Reservados', 'Asignados');
app = app.replace('Vendidos', 'Patrimonio Consolidado');

// Replace Forms 
app = app.replace('CONTACT US FORM', 'SOLICITAR ASESORÍA PRIVADA');
app = app.replace('¿Listo para dar el siguiente paso? Contáctanos', 'Solicitar Asesoría Privada');
app = app.replace(
  'Déjanos tus datos y un asesor especializado de Moon Paracas se comunicará contigo para brindarte información detallada, coordinar una visita al oasis o guiarte en el proceso de separación.',
  'Inicia la evaluación de tu ingreso al condominio. Un director de proyecto se comunicará contigo para revisar disponibilidad, planos técnicos y estructura legal.'
);

app = app.replace('ENVIAR SOLICITUD A LA ASOCIACIÓN', 'INICIAR EVALUACIÓN DE INGRESO');
app = app.replace('CHATEAR POR WHATSAPP AHORA', 'CONVERSACIÓN PRIVADA');

// Add Disclaimer to Form
app = app.replace(
  '{/* Left Column Fields */}',
  `<div className="md:col-span-2 mb-4 p-3 bg-stone-100 border-l-4 border-[#C4A484] text-xs text-stone-600 font-mono">
                Al solicitar asesoría, garantizamos absoluta confidencialidad sobre su estructuración de pagos.
              </div>
              {/* Left Column Fields */}`
);

// Change Placeholder Message
app = app.replace(
  'Deseo coordinar una videollamada para revisar el cronograma de financiamiento de mi lote y verificar de áreas comunes...',
  'Deseo revisar los planos arquitectónicos y evaluar la estructura de financiamiento directo para la Fase 1...'
);

fs.writeFileSync('src/App.tsx', app);
console.log('App.tsx Updated!');
