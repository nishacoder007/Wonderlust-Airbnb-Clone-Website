document.addEventListener("DOMContentLoaded", () => {
  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  const coordsAttr = mapElement.getAttribute("data-coordinates");
  const title = mapElement.getAttribute("data-title");
  const location = mapElement.getAttribute("data-location");

  // Parse coordinates, fallback to New York City if missing or invalid
  let coordinates = [40.7128, -74.0060];
  try {
    if (coordsAttr) {
      const parsed = JSON.parse(coordsAttr);
      if (Array.isArray(parsed) && parsed.length === 2) {
        coordinates = parsed;
      }
    }
  } catch (err) {
    console.error("Error parsing map coordinates:", err);
  }

  // Initialize Leaflet Map centered on listing coordinates
  const map = L.map("map").setView(coordinates, 13);

  // Set OpenStreetMap tile layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Place listing marker
  const marker = L.marker(coordinates).addTo(map);

  // Bind premium styled popup
  marker
    .bindPopup(
      `<div style="font-family: 'Inter', sans-serif; font-size: 13px; line-height: 1.4;">
        <strong style="color: #FF385C; font-size: 14px;">${title}</strong>
        <p style="margin: 4px 0 0 0; color: #555;">${location}</p>
       </div>`
    )
    .openPopup();
});
