var map = L.map('map', {
    center: [18.95, 81.44],
    zoom: 10,
    detectRetina: true,
    zoomControl: false,
});

// Create a custom pane for labels to ensure they stay on top of everything
map.createPane('labels');
map.getPane('labels').style.zIndex = 650;
map.getPane('labels').style.pointerEvents = 'none';

L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);
