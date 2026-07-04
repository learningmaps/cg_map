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
    dist: cgDistrictsWMS, vil: cgVillagesWMS, bhuvan: bhuvanVillages, shrug: shrugCensus,
    impacted: impactedVillages,
    dep4photos: undefined,
    forest: forestCompartments, forest_bijapur: kmlLayercgforc_bijapur,
    police_camps: kmlLayerPoliceCamps,
    clan_gods: undefined  // populated async by clan-gods.js
};

const labelStyles = {
    google: googleLabels
};

function toggleLabels(event, type = 'google') {
    if (event) event.stopPropagation();
    const btn = event.target;
    
    const targetLayer = labelStyles[type];
    if (!targetLayer) return;

    if (map.hasLayer(targetLayer)) {
        map.removeLayer(targetLayer);
        btn.classList.remove('active');
    } else {
        // Remove any other active label layers first to avoid overlap
        Object.values(labelStyles).forEach(layer => {
            if (map.hasLayer(layer)) map.removeLayer(layer);
        });
        // Deactivate all label buttons in the UI
        document.querySelectorAll('.label-btn').forEach(b => b.classList.remove('active'));

        map.addLayer(targetLayer);
        btn.classList.add('active');
    }
}

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

/* ── Police/Military Camps View Toggle ── */
let currentPoliceCampView = 'cluster'; // 'cluster' or 'individual'

function togglePoliceCampView(event) {
    if (event) event.stopPropagation();

    const btn = document.getElementById('toggle-camp-view-btn');
    const isLayerActive = activeState.police_camps;

    if (currentPoliceCampView === 'cluster') {
        currentPoliceCampView = 'individual';
        btn.title = 'Switch to Cluster View';
        btn.classList.add('active');
        layerMap.police_camps = geoLayerPoliceCamps;

        if (isLayerActive) {
            map.removeLayer(kmlLayerPoliceCamps);
            map.addLayer(geoLayerPoliceCamps);
        }
    } else {
        currentPoliceCampView = 'cluster';
        btn.title = 'Switch to Individual View';
        btn.classList.remove('active');
        layerMap.police_camps = kmlLayerPoliceCamps;

        if (isLayerActive) {
            map.removeLayer(geoLayerPoliceCamps);
            map.addLayer(kmlLayerPoliceCamps);
        }
    }
}

L.DomEvent.disableClickPropagation(document.getElementById('legend'));
L.DomEvent.disableScrollPropagation(document.getElementById('legend'));

/* ── Initialization ── */
function initLayersFromConfig() {
    Object.keys(activeState).forEach(key => {
        const layer = layerMap[key];
        const el = document.getElementById('item-' + key);
        if (!layer || !el) return;

        if (activeState[key]) {
            if (!map.hasLayer(layer)) map.addLayer(layer);
            el.classList.remove('inactive');
        } else {
            if (map.hasLayer(layer)) map.removeLayer(layer);
            el.classList.add('inactive');
        }
    });
}

// Run init on DOM content load
document.addEventListener('DOMContentLoaded', () => {
    initLayersFromConfig();
    
    const satBtn = document.getElementById('base-satellite');
    if (satBtn) satBtn.classList.remove('inactive');
});

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
    
    L.circle(center, {
        radius: 200, color: '#CD9C69', fillColor: '#CD9C69', fillOpacity: 0.2, weight: 2
    }).addTo(map).fadeOut(3000);
})
.addTo(map);

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

/* ── Base Layer switching ── */
window.baseLayers = {
    osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '© OpenStreetMap contributors'
    }),
    topo: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17, attribution: 'Map data: © OSM contributors, SRTM | Style: © OpenTopoMap'
    }),
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 22, maxNativeZoom: 18, attribution: '© Esri'
    }),
    stamen_terrain: L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain_background/{z}/{x}/{y}{r}.png', {
        minZoom: 0, maxZoom: 18,
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }),
    thunderforest_dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20
    })
};

window.switchBaseLayer = function(key) {
    const newBase = window.baseLayers[key];
    if (!newBase) return;

    // Remove current base layer if it exists
    if (window.activeBaseLayer && map.hasLayer(window.activeBaseLayer)) {
        map.removeLayer(window.activeBaseLayer);
    }

    // Add and track the new base layer
    window.activeBaseLayer = newBase;
    newBase.addTo(map);
    newBase.bringToBack();

    // Whenever user changes base layer, the labels for ESRI layer should toggle off automatically
    const targetLabelLayer = labelStyles['google'];
    if (map.hasLayer(targetLabelLayer)) {
        map.removeLayer(targetLabelLayer);
        document.querySelectorAll('.label-btn').forEach(b => b.classList.remove('active'));
    }

    // Update UI
    document.querySelectorAll('[id^="base-"]').forEach(el => el.classList.add('inactive'));
    const btn = document.getElementById(`base-${key}`);
    if (btn) btn.classList.remove('inactive');
};

// Initialize state
window.switchBaseLayer('satellite');

document.addEventListener('DOMContentLoaded', () => {
    initLayersFromConfig();

    const satBtn = document.getElementById('base-satellite');
    if (satBtn) {
        satBtn.classList.remove('inactive');
        // Labels are off by default
    }

    // Collapse all legend groups on default load
    document.querySelectorAll('.legend-group').forEach(grp => {
        const header = grp.querySelector('.legend-group-header');
        const items = grp.querySelector('.legend-group-items');
        if (header && items) {
            header.classList.add('collapsed');
            items.style.display = 'none';
        }
    });
});
