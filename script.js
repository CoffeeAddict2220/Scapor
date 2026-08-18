// Karte erstellen
const map = L.map('map').setView(
    [51.7, 10.0],
    10
);


// OpenStreetMap-Kartenkacheln hinzufügen
L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution:
            '&copy; OpenStreetMap contributors'
    }
).addTo(map);


// Verschiebbaren Marker erstellen
const marker = L.marker(
    [51.7, 10.0],
    {
        draggable: true
    }
).addTo(map);


// Popup beim Marker
marker
    .bindPopup('Ich bin verschiebbar!')
    .openPopup();


// Wird ausgelöst, wenn der Marker verschoben
// und die Maustaste losgelassen wird
marker.on('dragend', function (event) {

    const position = event.target.getLatLng();

    console.log(
        'Neue Position:',
        position.lat,
        position.lng
    );

    // Position im Popup anzeigen
    marker.bindPopup(`
        <strong>Marker-Position</strong><br>
        Breitengrad: ${position.lat.toFixed(6)}<br>
        Längengrad: ${position.lng.toFixed(6)}
    `).openPopup();
});
