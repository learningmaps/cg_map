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
L.DomEvent.disableClickPropagation(document.getElementById('map-title'));
