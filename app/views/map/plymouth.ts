import L from 'leaflet';

export const PLYMOUTH_CENTER: L.LatLngExpression = [50.3755, -4.1427];
export const PLYMOUTH_BOUNDS = L.latLngBounds(
  [50.32, -4.25],
  [50.45, -4.02],
);

export const PLYMOUTH_MAP_OPTIONS: L.MapOptions = {
  center: PLYMOUTH_CENTER,
  zoom: 13,
  minZoom: 12,
  maxZoom: 18,
  maxBounds: PLYMOUTH_BOUNDS,
  maxBoundsViscosity: 1,
};

export function addPlymouthTiles(map: L.Map): L.TileLayer {
  return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    minZoom: 12,
    maxZoom: 18,
  }).addTo(map);
}

export function createLocationMarkerIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<svg width="30" height="39" viewBox="0 0 30 39" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.72 0 0 6.72 0 15c0 10 15 24 15 24s15-14 15-24C30 6.72 23.28 0 15 0z"
            fill="#2EC4B6" stroke="#07111d" stroke-width="1.5"/>
      <circle cx="15" cy="15" r="5.5" fill="#E6FFFA"/>
    </svg>`,
    iconSize: [30, 39],
    iconAnchor: [15, 39],
  });
}
