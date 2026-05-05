/* ── Coordinates bar ── */
map.on('mousemove', e => {
    const lat = e.latlng.lat.toFixed(5);
    const lng = e.latlng.lng.toFixed(5);
    document.getElementById('coords-text').textContent = `${lat}°N  ${lng}°E`;
});

/* ── Legend panel toggle ── */
const legendHeader = document.getElementById('legend-header');
const legendBody = document.getElementById('legend-body');
legendHeader.addEventListener('click', () => {
    const collapsed = legendHeader.classList.toggle('collapsed');
    legendBody.style.display = collapsed ? 'none' : 'block';
});

function toggleGroup(id) {
    const grp = document.getElementById(id);
    const header = grp.querySelector('.legend-group-header');
    const items = grp.querySelector('.legend-group-items');
    const collapsed = header.classList.toggle('collapsed');
    items.style.display = collapsed ? 'none' : 'block';
}

const layerMap = {
    major: majorMining, majorngdr: majorMiningNgdr, minor: minorMining,
    dep4: kmlLayer, dep4c: kmlLayerCompWise, dep4screenbenplant: kmlLayerScreenBenPlant,
    chittalnar: chittalnarTinOre,
    bacheli: kmlLayerBacheli,
    dist: cgDistrictsWMS, vil: cgVillagesWMS, bhuvan: bhuvanVillages,
    forest: forestCompartments, forest_bijapur: kmlLayercgforc_bijapur
};

function toggleLayer(key) {
    const layer = layerMap[key];
    if (!layer) return;
    const el = document.getElementById('item-' + key);
    if (activeState[key]) {
        map.removeLayer(layer);
        activeState[key] = false;
        el.classList.add('inactive');
    } else {
        map.addLayer(layer);
        activeState[key] = true;
        el.classList.remove('inactive');
    }
}

L.DomEvent.disableClickPropagation(document.getElementById('legend'));
L.DomEvent.disableScrollPropagation(document.getElementById('legend'));
const mapTitle = document.getElementById('map-title');
if (mapTitle) {
    L.DomEvent.disableClickPropagation(mapTitle);
}

/* ── Search Geocoder (Photon) ── */
const geocoder = L.Control.geocoder({
    defaultMarkGeocode: false,
    placeholder: 'Search location...',
    geocoder: L.Control.Geocoder.photon(),
    position: 'topleft'
})
.on('markgeocode', function(e) {
    const center = e.geocode.center;
    map.setView(center, 14);
    
    // Optional: Add a temporary marker or highlight
    L.circle(center, {
        radius: 200,
        color: '#CD9C69',
        fillColor: '#CD9C69',
        fillOpacity: 0.2,
        weight: 2
    }).addTo(map).fadeOut(3000);
})
.addTo(map);

// Move the geocoder container to a custom position if needed, 
// or just style it to match the zoom controls.
const geocoderContainer = geocoder.getContainer();
// We'll apply styles in CSS to position it correctly relative to map-title.

// Helper for fading out the highlight circle
L.Layer.prototype.fadeOut = function(duration) {
    const self = this;
    let opacity = self.options.opacity || 1;
    let fillOpacity = self.options.fillOpacity || 0.2;
    const interval = 50;
    const steps = duration / interval;
    const opacityStep = opacity / steps;
    const fillOpacityStep = fillOpacity / steps;

    const timer = setInterval(() => {
        opacity -= opacityStep;
        fillOpacity -= fillOpacityStep;
        if (opacity <= 0) {
            clearInterval(timer);
            map.removeLayer(self);
        } else {
            self.setStyle({ opacity, fillOpacity });
        }
    }, interval);
};
