const map = L.map('map', {
    center: [18.58, 81.03],
    zoom: 7,
    detectRetina: true,
    zoomControl: false,
});

L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

const satellite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { maxZoom: 22, maxNativeZoom: 19, attribution: '© Esri' }
).addTo(map);
