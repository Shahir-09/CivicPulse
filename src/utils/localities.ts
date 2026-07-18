export interface Locality {
  name: string;
  lat: number;
  lng: number;
  city: string;
}

// Fallback localities (Kolkata-focused) used if GPS/Nominatim is unavailable
export const LOCALITIES: Locality[] = [
  { name: "Park Street", lat: 22.5539, lng: 88.3531, city: "Kolkata" },
  { name: "Salt Lake Sector V", lat: 22.5735, lng: 88.4331, city: "Kolkata" },
  { name: "Gariahat", lat: 22.5190, lng: 88.3653, city: "Kolkata" },
  { name: "New Town", lat: 22.5804, lng: 88.4813, city: "Kolkata" },
  { name: "Howrah", lat: 22.5850, lng: 88.3184, city: "Kolkata" },
  { name: "Jadavpur", lat: 22.4985, lng: 88.3726, city: "Kolkata" },
  { name: "Dum Dum", lat: 22.6140, lng: 88.3999, city: "Kolkata" },
  { name: "Behala", lat: 22.4921, lng: 88.3152, city: "Kolkata" },
  { name: "Tollygunge", lat: 22.5032, lng: 88.3481, city: "Kolkata" },
  { name: "Shyambazar", lat: 22.5960, lng: 88.3686, city: "Kolkata" },
  { name: "Rajpur Sonarpur", lat: 22.4428, lng: 88.3978, city: "Kolkata" },
  { name: "Lake Town", lat: 22.5897, lng: 88.3981, city: "Kolkata" },
  { name: "Barasat", lat: 22.7208, lng: 88.4807, city: "North 24 Parganas" },
  { name: "Baranagar", lat: 22.6432, lng: 88.3781, city: "Kolkata" },
  { name: "Alipore", lat: 22.5274, lng: 88.3337, city: "Kolkata" },
];
