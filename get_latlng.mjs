import proj4 from 'proj4';

const projStr = "+proj=utm +zone=18 +south +datum=WGS84 +units=m +no_defs";
const wgs84 = "+proj=longlat +datum=WGS84 +no_defs";

const pts = [
  [374763.00, 8460135.00],
  [374552.00, 8460334.00],
  [374772.00, 8460646.00],
  [374993.00, 8460441.00]
];

pts.forEach((p, i) => {
  const [lng, lat] = proj4(projStr, wgs84, p);
  console.log(`Pt ${i+1}: lat=${lat}, lng=${lng}`);
});
