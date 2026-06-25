/* ── Geotagged Photographs (Deposit 4) — Clustered ── */
let geoImagesLayer;
var PHOTO_LIST = [];

fetch('data/geotag_metadata.json')
    .then(res => res.json())
    .then(images => {
        PHOTO_LIST.push(...images);
        window.dispatchEvent(new CustomEvent('photos-loaded'));
        if (images.length === 0) return;

        const mcg = L.markerClusterGroup({
            zoomToBoundsOnClick: false,
            spiderfyOnMaxZoom: false,
            iconCreateFunction: cluster => L.divIcon({
                html: `<div class="photo-cluster-icon">
                    <span class="photo-cluster-badge">${cluster.getChildCount()}</span>
                    <svg viewBox="0 0 24 24" width="28" height="28">
                        <circle cx="12" cy="12" r="10" fill="#2c5f8a" stroke="#fff" stroke-width="2"/>
                        <path d="M16 9.5H8a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1z" fill="none" stroke="#fff" stroke-width="1.2"/>
                        <circle cx="12" cy="12" r="2" fill="none" stroke="#fff" stroke-width="1.2"/>
                        <path d="M15 9.5l-1-1.5h-4L9 9.5" fill="none" stroke="#fff" stroke-width="1.2"/>
                    </svg>
                </div>`,
                className: '',
                iconSize: L.point(32, 32),
            }),
        });

        const geojson = {
            type: 'FeatureCollection',
            features: images.map(img => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [img.longitude, img.latitude],
                },
                properties: { ...img },
            })),
        };

        const geoLayer = L.geoJson(geojson, {
            pointToLayer: (feature, latlng) => L.marker(latlng, {
                icon: L.divIcon({
                    className: 'photo-marker-icon',
                    html: '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="#2c5f8a" stroke="#fff" stroke-width="2"/><path d="M16 9.5H8a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1z" fill="none" stroke="#fff" stroke-width="1.2"/><circle cx="12" cy="12" r="2" fill="none" stroke="#fff" stroke-width="1.2"/><path d="M15 9.5l-1-1.5h-4L9 9.5" fill="none" stroke="#fff" stroke-width="1.2"/></svg>',
                    iconSize: [28, 28],
                    iconAnchor: [14, 14],
                    popupAnchor: [0, -16],
                }),
            }),
            onEachFeature: (feature, layer) => {
                layer.bindPopup(buildGalleryPopup([feature.properties]));
            },
        });

        geoLayer.eachLayer(l => mcg.addLayer(l));
        geoImagesLayer = mcg;

        mcg.on('clusterclick', function (a) {
            const markers = a.layer.getAllChildMarkers();
            const items = markers.map(m => {
                const p = (m.feature && m.feature.properties) || {};
                const meta = [
                    ['Latitude', `${p.latitude}°N`],
                    ['Longitude', `${p.longitude}°E`],
                    ['Elevation', `${p.elevation_m} ± ${p.elevation_err} m`],
                    ['Accuracy', `${p.accuracy_m} m`],
                    ['Time', formatTimestamp(p.timestamp)],
                ];
                if (p.caption) meta.unshift(['Caption', p.caption]);
                const trs = meta.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('');
                return `<div class="gallery-item">
                    <img class="gallery-thumb" src="${p.url}" alt="${p.filename}" onclick="openPhotoOverlay('${p.id}')" loading="lazy" />
                    <table class="gallery-meta">${trs}</table>
                </div>`;
            }).join('');

            const badgeMeta = LAYER_META.dep4photos;
            const badge = badgeMeta ? `
                <div class="popup-layer-badge" style="background:${badgeMeta.color}; border:1px solid ${badgeMeta.border}; color:${badgeMeta.text};">
                    <span class="badge-dot" style="background:${badgeMeta.border};"></span>
                    ${badgeMeta.label}
                </div>` : '';

            L.popup()
                .setLatLng(a.latlng)
                .setContent(`<div class="popup-inner gallery-popup cluster-popup">
                    ${badge}
                    <div class="popup-title">Geotagged Photos (${markers.length})</div>
                    ${items}
                </div>`)
                .openOn(map);
        });

        if (typeof layerMap !== 'undefined') {
            layerMap.dep4photos = mcg;
            if (typeof initLayersFromConfig === 'function') initLayersFromConfig();
        }
    });

function buildGalleryPopup(images) {
    const items = images.map(img => {
        const meta = [
            ['Latitude', `${img.latitude}°N`],
            ['Longitude', `${img.longitude}°E`],
            ['Elevation', `${img.elevation_m} ± ${img.elevation_err} m`],
            ['Accuracy', `${img.accuracy_m} m`],
            ['Time', formatTimestamp(img.timestamp)]
        ];
        if (img.caption) meta.unshift(['Caption', img.caption]);

        const trs = meta.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('');

        return `<div class="gallery-item">
            <img class="gallery-thumb" src="${img.url}" alt="${img.filename}" onclick="openPhotoOverlay('${img.id}')" loading="lazy" />
            <table class="gallery-meta">${trs}</table>
        </div>`;
    }).join('');

    const badgeMeta = LAYER_META.dep4photos;
    const badge = badgeMeta ? `
        <div class="popup-layer-badge" style="background:${badgeMeta.color}; border:1px solid ${badgeMeta.border}; color:${badgeMeta.text};">
            <span class="badge-dot" style="background:${badgeMeta.border};"></span>
            ${badgeMeta.label}
        </div>` : '';

    return `<div class="popup-inner gallery-popup">
        ${badge}
        <div class="popup-title">Geotagged Photos (${images.length})</div>
        ${items}
    </div>`;
}

function formatTimestamp(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    });
}
