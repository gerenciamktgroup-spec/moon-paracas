import proj4 from 'proj4';
import { terrain } from '../data/terrain';

// UTM Zone 18S (WGS84) EPSG:32718
proj4.defs("EPSG:32718", "+proj=utm +zone=18 +south +datum=WGS84 +units=m +no_defs");

export function utmToLatLng(e: number, n: number) {
  const [lng, lat] = proj4("EPSG:32718", "EPSG:4326", [e, n]);
  return { lat, lng };
}

export const terrainLatLng = terrain.vertices.map(v => {
  const ll = utmToLatLng(v.utm.e, v.utm.n);
  return { id: v.id, lat: ll.lat, lng: ll.lng };
});
