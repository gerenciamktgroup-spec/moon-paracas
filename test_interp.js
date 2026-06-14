// Test the interpolation logic
const PTL_lat = -13.92154136234862;
const PTL_lng = -76.15915493004064;

const PBL_lat = -13.924352210046587;
const PBL_lng = -76.16120511525484;

const PBR_lat = -13.926160504335892;
const PBR_lng = -76.15926125390634;

const PTR_lat = -13.923404320685826;
const PTR_lng = -76.15711879211142;

function getLatLng(x, y) {
  // Normalize local coordinates
  const u = x / 290.0;
  const v = y / 305.0;

  // Bilinear interpolation
  const top_lat = PTL_lat + u * (PTR_lat - PTL_lat);
  const top_lng = PTL_lng + u * (PTR_lng - PTL_lng);

  const bottom_lat = PBL_lat + u * (PBR_lat - PBL_lat);
  const bottom_lng = PBL_lng + u * (PBR_lng - PBL_lng);

  const lat = top_lat + v * (bottom_lat - top_lat);
  const lng = top_lng + v * (bottom_lng - top_lng);

  return { lat, lng };
}

console.log('TL', getLatLng(0, 0));
console.log('BL', getLatLng(0, 305));
console.log('BR', getLatLng(290, 305));
console.log('TR', getLatLng(290, 0));
console.log('Center', getLatLng(145, 150));
