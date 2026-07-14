var map = L.map('map', {
    center: [18.95, 81.44],
    zoom: 10,
    maxZoom: 19,
    zoomSnap: 0.5,
    zoomControl: false,
});

// Create a custom pane for labels to ensure they stay on top of everything
map.createPane('labels');
map.getPane('labels').style.zIndex = 650;
map.getPane('labels').style.pointerEvents = 'none';

L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

// Update map container class based on current zoom level for CSS styling
function updateMapZoomClass() {
    const zoom = map.getZoom();
    const container = map.getContainer();
    
    // Remove previous zoom classes
    container.className = container.className.replace(/\bmap-zoom-\S+/g, '');
    
    let zoomClass = 'map-zoom-close';
    if (zoom < 9.5) {
        zoomClass = 'map-zoom-far';
    } else if (zoom < 13) {
        zoomClass = 'map-zoom-medium';
    }
    container.classList.add(zoomClass);
}

map.on('zoomend', updateMapZoomClass);
updateMapZoomClass();

