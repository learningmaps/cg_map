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
    dep5: kmlLayerDep5, pekb: kmlLayerPekb,
    chittalnar: chittalnarTinOre,
    bacheli: kmlLayerBacheli,
    alnar: kmlLayerAlnar,
    dist: cgDistrictsWMS, vil: cgVillagesWMS, bhuvan: bhuvanVillages,
    bhuvan_states: bhuvanStates, bhuvan_districts: bhuvanDistricts,
    impacted: impactedVillages,
    dep4photos: undefined,
    forest: forestCompartments, forest_bijapur: kmlLayercgforc_bijapur,
    police_camps: geoLayerPoliceCamps,
    osm_military: geoLayerOsmMilitary,
    clan_gods: undefined,  // populated async by clan-gods.js
    sacred_geography: sacredGeographyGroup,
    mines_sacred: minesSacredLayer,
    indravati_tiger_reserve: indravatiTigerReserve
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
let currentPoliceCampView = 'individual'; // 'individual' or 'cluster'

function togglePoliceCampView(event) {
    if (event) event.stopPropagation();

    const btn = document.getElementById('toggle-camp-view-btn');
    const isLayerActive = activeState.police_camps;

    if (currentPoliceCampView === 'individual') {
        currentPoliceCampView = 'cluster';
        btn.title = 'Switch to Individual View';
        btn.classList.add('active');
        layerMap.police_camps = kmlLayerPoliceCamps;

        if (isLayerActive) {
            map.removeLayer(geoLayerPoliceCamps);
            map.addLayer(kmlLayerPoliceCamps);
        }
    } else {
        currentPoliceCampView = 'individual';
        btn.title = 'Switch to Cluster View';
        btn.classList.remove('active');
        layerMap.police_camps = geoLayerPoliceCamps;

        if (isLayerActive) {
            map.removeLayer(kmlLayerPoliceCamps);
            map.addLayer(geoLayerPoliceCamps);
        }
    }
}

/* ── OSM Landuse Military View Toggle ── */
let currentOsmMilitaryView = 'individual'; // 'individual' or 'cluster'

function toggleOsmMilitaryView(event) {
    if (event) event.stopPropagation();

    const btn = document.getElementById('toggle-osm-view-btn');
    const isLayerActive = activeState.osm_military;

    if (currentOsmMilitaryView === 'individual') {
        currentOsmMilitaryView = 'cluster';
        btn.title = 'Switch to Individual View';
        btn.classList.add('active');
        layerMap.osm_military = osmMilitaryCluster;

        if (isLayerActive) {
            map.removeLayer(geoLayerOsmMilitary);
            map.addLayer(osmMilitaryCluster);
        }
    } else {
        currentOsmMilitaryView = 'individual';
        btn.title = 'Switch to Cluster View';
        btn.classList.remove('active');
        layerMap.osm_military = geoLayerOsmMilitary;

        if (isLayerActive) {
            map.removeLayer(osmMilitaryCluster);
            map.addLayer(geoLayerOsmMilitary);
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

/* ── Dynamic Legend Rendering ── */
function renderLegend() {
    const legendBody = document.getElementById('legend-body');
    if (!legendBody) return;
    legendBody.innerHTML = '';

    LEGEND_CONFIG.forEach((group, index) => {
        // Create divider before every group except the first one
        if (index > 0) {
            const divider = document.createElement('div');
            divider.className = 'legend-divider';
            legendBody.appendChild(divider);
        }

        // Create group container
        const grpDiv = document.createElement('div');
        grpDiv.className = 'legend-group';
        grpDiv.id = group.id;

        // Create group header
        const grpHeader = document.createElement('div');
        grpHeader.className = 'legend-group-header';
        grpHeader.onclick = () => toggleGroup(group.id);

        const chevron = document.createElement('span');
        chevron.className = 'group-chevron';
        chevron.textContent = '▼';

        const label = document.createElement('span');
        label.className = 'group-label';
        label.textContent = group.label;

        grpHeader.appendChild(chevron);
        grpHeader.appendChild(label);
        grpDiv.appendChild(grpHeader);

        // Create items container
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'legend-group-items';

        group.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'legend-item';

            if (group.isBaseMap) {
                itemDiv.id = `base-${item.id}`;
                itemDiv.onclick = () => switchBaseLayer(item.id);

                // Create swatch
                const swatch = document.createElement('div');
                swatch.className = 'legend-swatch';
                swatch.style.background = item.swatch.background;
                swatch.style.borderColor = item.swatch.border || 'transparent';
                itemDiv.appendChild(swatch);

                // Label
                const itemLabel = document.createElement('span');
                itemLabel.className = 'legend-item-label';
                itemLabel.textContent = item.label;
                itemDiv.appendChild(itemLabel);

                // Extra controls (e.g. labels button)
                if (item.hasLabels) {
                    const extra = document.createElement('div');
                    extra.className = 'legend-item-extra';
                    const btn = document.createElement('button');
                    btn.className = 'label-btn';
                    btn.title = 'Google Hybrid Labels';
                    btn.textContent = 'Labels';
                    btn.onclick = (e) => toggleLabels(e, 'google');
                    extra.appendChild(btn);
                    itemDiv.appendChild(extra);
                }
            } else {
                itemDiv.id = `item-${item.id}`;
                itemDiv.onclick = () => toggleLayer(item.id);

                // Create swatch
                const swatch = document.createElement('div');
                if (item.swatch.type === 'line') {
                    swatch.className = 'legend-swatch line';
                    swatch.style.background = item.swatch.background;
                    swatch.style.width = '14px';
                    swatch.style.height = '2px';
                } else {
                    swatch.className = 'legend-swatch';
                    swatch.style.background = item.swatch.background;
                    swatch.style.borderColor = item.swatch.border || 'transparent';
                }
                itemDiv.appendChild(swatch);

                // Label
                const itemLabel = document.createElement('span');
                itemLabel.className = 'legend-item-label';
                itemLabel.textContent = item.label;

                // Add special inline buttons or links
                if (item.isCamp) {
                    const btn = document.createElement('button');
                    btn.className = 'zoom-btn';
                    btn.id = 'toggle-camp-view-btn';
                    btn.title = 'Switch to Cluster View';
                    btn.textContent = '⛶';
                    btn.onclick = (e) => togglePoliceCampView(e);
                    itemLabel.appendChild(document.createTextNode(' '));
                    itemLabel.appendChild(btn);
                } else if (item.isOsmMilitary) {
                    const btn = document.createElement('button');
                    btn.className = 'zoom-btn';
                    btn.id = 'toggle-osm-view-btn';
                    btn.title = 'Switch to Cluster View';
                    btn.textContent = '⛶';
                    btn.onclick = (e) => toggleOsmMilitaryView(e);
                    itemLabel.appendChild(document.createTextNode(' '));
                    itemLabel.appendChild(btn);
                } else if (item.hasExternalLink) {
                    const link = document.createElement('a');
                    link.href = item.hasExternalLink;
                    link.target = '_blank';
                    link.textContent = 'Source';
                    link.onclick = (e) => e.stopPropagation();
                    itemLabel.appendChild(document.createTextNode(' '));
                    itemLabel.appendChild(link);
                }

                itemDiv.appendChild(itemLabel);

                // Zoom controls
                if (item.zoomTarget) {
                    const extra = document.createElement('div');
                    extra.className = 'legend-item-extra';
                    const btn = document.createElement('button');
                    btn.className = 'zoom-btn';
                    btn.textContent = '⊕ Zoom';
                    btn.onclick = (e) => {
                        e.stopPropagation();
                        if (item.zoomTarget === 'dep4photos_custom') {
                            if (typeof geoImagesLayer !== 'undefined' && geoImagesLayer && geoImagesLayer.getBounds) {
                                map.fitBounds(geoImagesLayer.getBounds(), {padding:[40,40], maxZoom:17});
                            }
                        } else if (item.zoomTarget === 'bodhghat_coords') {
                            map.setView([19.21, 81.58], 11);
                        } else if (item.zoomTarget === 'indravati_coords') {
                            if (typeof geoJsonIndravatiLayer !== 'undefined' && geoJsonIndravatiLayer.getBounds) {
                                const bounds = geoJsonIndravatiLayer.getBounds();
                                if (bounds && typeof bounds.isValid === 'function' && bounds.isValid()) {
                                    map.fitBounds(bounds, {padding:[40,40], maxZoom:17});
                                    return;
                                }
                            }
                            map.setView([18.90, 80.85], 11);
                        } else {
                            const targetVar = layerMap[item.id];
                            if (targetVar) {
                                zoomToLayer(e, targetVar);
                            }
                        }
                    };
                    extra.appendChild(btn);
                    itemDiv.appendChild(extra);
                }
            }

            itemsContainer.appendChild(itemDiv);
        });

        grpDiv.appendChild(itemsContainer);
        legendBody.appendChild(grpDiv);
    });
}

// Run init on DOM content load
document.addEventListener('DOMContentLoaded', () => {
    renderLegend();
    initLayersFromConfig();
    
    const satBtn = document.getElementById('base-satellite');
    if (satBtn) satBtn.classList.remove('inactive');

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
    google_satellite: L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'], attribution: '© Google'
    }),
    stamen_terrain: L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain_background/{z}/{x}/{y}{r}.png', {
        minZoom: 0, maxZoom: 18,
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }),
    thunderforest_dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20
    }),
    soi_topo: L.tileLayer('https://indianopenmaps.com/soi/osm/{z}/{x}/{y}.webp', {
        maxZoom: 18,
        maxNativeZoom: 14,
        attribution: '© Survey of India | OpenStreetMap contributors'
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

// Initialization runs in the DOMContentLoaded block registered earlier

/* ── Clean Map View / Screenshot Mode ── */
function toggleCleanView(event) {
    if (event) event.stopPropagation();
    const isClean = document.body.classList.toggle('clean-map-mode');
    const btn = document.getElementById('clean-view-btn');
    if (btn) {
        btn.title = isClean ? 'Exit Screenshot Mode (Esc)' : 'Clean View / Screenshot Mode';
        btn.innerHTML = isClean ? '✕' : '📷';
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('clean-map-mode')) {
        toggleCleanView();
    }
});

/* ── Clear All Layers ── */
window.clearAllLayers = function(event) {
    if (event) event.stopPropagation(); // Prevents collapsing/expanding the legend header
    
    // Set all overlay activeStates to false
    Object.keys(activeState).forEach(key => {
        activeState[key] = false;
    });
    
    // Sync the map and legend checkboxes
    initLayersFromConfig();
};

