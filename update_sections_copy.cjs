const fs = require('fs');

// ParacasHistory.tsx
let h = fs.readFileSync('src/components/ParacasHistory.tsx', 'utf8');
h = h.replace('El Viento y El Desierto', 'Lectura del desierto antes de construir');
h = h.replace(
  "Inspirado en la fuerza del legendario viento 'El Paracas', nuestra arquitectura de adobe y pircas de piedra natural se mimetiza orgánicamente con las majestuosas dunas del desierto, creando un refugio de paz absoluta.",
  "Nuestra propuesta no impone arquitectura; la integra. Entendimos la dinámica eólica y la topografía milenaria de Paracas para diseñar un refugio donde el confort es resultado directo de la sensatez estructural."
);
h = h.replace('Textiles Antiguos y Diseño Interior', 'El criterio de la integración');
h = h.replace(
  "El misticismo de la cultura milenaria de Paracas vive en los interiores de nuestras villas. Tonos terracota, ocres y vigas de eucalipto crean una atmósfera rústica de lujo que conecta el pasado con el presente.",
  "La materialidad (tonos terracota, ocres y madera) no es un capricho estético. Responde a la necesidad térmica del territorio, creando un hábitat que dialoga con el entorno en lugar de competir con él."
);
h = h.replace('La Historia Inmortal', 'Preservación del contexto');
h = h.replace(
  "Cada muro de piedra que levantamos honra la resistencia y sabiduría de las culturas ancestrales de la bahía. Construimos para que las futuras generaciones vivan esta misma herencia intocable.",
  "Una inversión patrimonial a largo plazo exige un diseño que no envejezca prematuramente. Usamos técnicas pasivas de climatización ancladas en la tradición local."
);
fs.writeFileSync('src/components/ParacasHistory.tsx', h);

// ConceptGallery.tsx
let c = fs.readFileSync('src/components/ConceptGallery.tsx', 'utf8');
c = c.replace('Galería de Concepto y Estilo', 'Identidad Preservada');
c = c.replace(
  'Explora los acabados rústicos, texturas de adobe y el lujo minimalista.',
  'Un lenguaje visual unificado que protege la inversión de cada propietario.'
);
fs.writeFileSync('src/components/ConceptGallery.tsx', c);

// ArchitecturalRecommendations.tsx
let a = fs.readFileSync('src/components/ArchitecturalRecommendations.tsx', 'utf8');
a = a.replace('Recomendaciones de Arquitectura', 'Estética Reglamentada');
a = a.replace(
  'Te asesoramos para que el diseño de tu casa de campo se integre perfectamente con el desierto, respetando la normativa del eco-condominio.',
  'Garantizamos la plusvalía del conjunto mediante parámetros arquitectónicos estrictos. Adobe, piedra y terracota.'
);
fs.writeFileSync('src/components/ArchitecturalRecommendations.tsx', a);

// LifestyleAmenities.tsx
let l = fs.readFileSync('src/components/LifestyleAmenities.tsx', 'utf8');
l = l.replace('Un Estilo de Vida Diferente', 'El valor de la baja densidad');
l = l.replace(
  'Descubre todas las áreas comunes y beneficios exclusivos diseñados para brindar tranquilidad y desconexión a tu familia.',
  'Diseñamos espacios comunes que privilegian el silencio y el espacio personal. Un oasis central y áreas de convergencia pensadas para una comunidad que valora la privacidad.'
);
fs.writeFileSync('src/components/LifestyleAmenities.tsx', l);

console.log('Sections Updated!');
