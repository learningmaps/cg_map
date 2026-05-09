/* ── Major mining NCOG ── */
const majorMining = L.vectorGrid.protobuf(
    "https://indianopenmaps.fly.dev/not-so-open/mining/leases/major/ncog/{z}/{x}/{y}.pbf",
    {
        maxNativeZoom: 11, maxZoom: 22,
        rendererFactory: L.svg.tile,
        vectorTileLayerStyles: {
            'NCOG_Major_Mining_Leases': {
                fillColor: 'rgba(255,165,0,0.5)', fill: true, fillOpacity: 0.3,
                stroke: true, color: 'rgba(255,165,0)', weight: 0.1
            }
        },
        interactive: true,
        getFeatureId: f => f.properties?.id || f.properties?.lease_id || Math.random()
    }
);

majorMining.on('click', e => {
    const p = e.layer?.properties || e.propagatedFrom?.properties || {};
    L.popup({ closeButton: true })
        .setLatLng(e.latlng)
        .setContent(buildPopup(p.mine_name || p.name || 'Major Mine (NCOG)', [
            ['Mine Code', p.mine_code],
            ['Lessor', p.name_of_le],
            ['Area (Ha)', p.area],
            ['Village', p.vil_name11],
            ['District', p.district],
            ['GID', p.gid]
        ], 'major')).openOn(map);
});

/* ── Major mining NGDR ── */
const majorMiningNgdr = L.vectorGrid.protobuf(
    "https://indianopenmaps.com/not-so-open/mining/leases/major/ngdr/{z}/{x}/{y}.pbf",
    {
        maxNativeZoom: 11, maxZoom: 22,
        rendererFactory: L.svg.tile,
        vectorTileLayerStyles: {
            'NGDR_Major_Mining_Leases_2022': {
                fillColor: 'rgba(255,81,0,0.5)', fill: true, fillOpacity: 0.3,
                stroke: true, color: 'rgba(255,81,0)', weight: 0.1
            }
        },
        interactive: true,
        getFeatureId: f => f.properties?.id || f.properties?.lease_id || Math.random()
    }
).addTo(map);

majorMiningNgdr.on('click', e => {
    const p = e.layer?.properties || e.propagatedFrom?.properties || {};
    L.popup({ closeButton: true })
        .setLatLng(e.latlng)
        .setContent(buildPopup(p.mine_name || p.name || 'Major Mine (NGDR)', [
            ['Mine Code', p.mine_code],
            ['Lease Area (ha)', p.lease_area],
            ['Area (m²)', p.area],
            ['Mineral Category', p.mineral_ca],
            ['Mineral Name', p.mineral_na],
            ['Class', p.class],
            ['Type (ML/PL)', p.type_miner],
            ['End Use', p.end_use],
            ['Mode of Grant', p.mode_of_gr],
            ['Method of Mining', p.method_of_],
            ['PSU / Private', p.psu_privat],
            ['Ministry', p.ministry_o],
            ['Lessee', p.name_of_le],
            ['Associated Name', p.name_of_as],
            ['Address', p.address],
            ['District', p.district],
            ['Taluka', p.taluka],
            ['Village', p.village_na],
            ['Survey Nos.', p.survey_num],
            ['Region', p.region],
            ['State', p.state],
            ['PIN Code', p.pin_code],
            ['IBM Registration', p.ibm_regist],
            ['Registration ID', p.reg_id],
            ['Mobile', p.mobile],
            ['Email', p.email_id],
            ['Dispatches 19–20/20–21/21–22 (t)', p.dispatches_tons_1920_2021_2122],
            ['GID', p.gid]
        ], 'majorngdr')).openOn(map);
});

/* ── Minor mining ── */
const minorMining = L.vectorGrid.protobuf(
    "https://indianopenmaps.fly.dev/not-so-open/mining/leases/minor/ncog/{z}/{x}/{y}.pbf",
    {
        maxNativeZoom: 10, maxZoom: 22,
        rendererFactory: L.svg.tile,
        vectorTileLayerStyles: {
            'NCOG_Minor_Mining_Leases': {
                fillColor: 'rgba(0,0,255,0.5)', fill: true, fillOpacity: 0.3,
                stroke: true, color: 'rgba(0,0,255)', weight: 0.1
            }
        },
        interactive: true,
        getFeatureId: f => f.properties?.id || f.properties?.lease_id || Math.random()
    }
);

minorMining.on('click', e => {
    const p = e.layer?.properties || e.propagatedFrom?.properties || {};
    L.popup({ closeButton: true })
        .setLatLng(e.latlng)
        .setContent(buildPopup(p.mine_name || p.name || 'Minor Mine (NCOG)', [
            ['Mine Code', p.mine_code],
            ['Survey No.', p.survey_no],
            ['GID', p.gid]
        ], 'minor')).openOn(map);
});

/* ── Bhuvan villages ── */
const bhuvanVillages = L.vectorGrid.protobuf(
    "https://indianopenmaps.com/not-so-open/villages/bhuvan/{z}/{x}/{y}.pbf",
    {
        maxNativeZoom: 11, maxZoom: 22,
        rendererFactory: L.svg.tile,
        vectorTileLayerStyles: {
            'bhuvan_villages': {
                fillColor: 'yellow', fill: true, fillOpacity: 0.3,
                stroke: true, color: 'yellow', weight: 0.05
            }
        },
        interactive: true,
        getFeatureId: f => f.properties?.id || f.properties?.village_id || Math.random()
    }
);

bhuvanVillages.on('click', e => {
    const p = e.layer?.properties || e.propagatedFrom?.properties || {};
    L.popup({ closeButton: true })
        .setLatLng(e.latlng)
        .setContent(buildPopup(p.v_name || 'Village', [
            ['District', p.d_name]
        ], 'bhuvan')).openOn(map);
});

/* ── KML layers ── */
const kmlStyle = { color: 'rgba(255,255,255,0.7)', weight: 1.5, fillColor: 'white', fillOpacity: 0.2 };

const kmlLayerBacheli = omnivore.kml("data/Bacheli Airport/site 1 - bacheli_airport_proposed_project_ec.kml", null, L.geoJson(null, {
    style: () => ({ ...kmlStyle, fillColor: 'rgba(120, 250, 200)', color: 'rgba(120, 250, 200)' }),
    onEachFeature: (feature, layer) => {
        const props = feature.properties || {};
        layer.bindPopup(kmlPopup(props, "bacheli"));
    }
})).addTo(map);

const kmlLayercgforc_bijapur = omnivore.kml("data/bijapur.kml", null, L.geoJson(null, {
    style: () => ({ ...kmlStyle, fillColor: 'rgb(164, 254, 131)', color: 'rgb(164, 254, 131)' }),
    onEachFeature: (feature, layer) => {
        const desc = feature.properties?.description || "";
        const props = parseKmlDescription(desc);
        Object.assign(props, feature.properties);
        layer.bindPopup(kmlPopup(props, "forest"));
    }
}));

const kmlLayer = omnivore.kml('data/Dep4MLArea.kml', null, L.geoJson(null, {
    style: () => kmlStyle,
    onEachFeature: (feature, layer) => layer.bindPopup(kmlPopup(feature.properties || {}, 'main'))
})).addTo(map);

const kmlLayerCompWise = omnivore.kml(
    'data/dep4_segments/4112212521214727y5compartmentwiseandcomponentwiselandbreakupdep4.kml',
    null, L.geoJson(null, {
        style: () => ({ ...kmlStyle, fillColor: 'rgb(255,251,41)', color: 'rgb(255,251,41)' }),
        onEachFeature: (feature, layer) => layer.bindPopup(kmlPopup(feature.properties || {}, 'comp'))
    })
).addTo(map);

const kmlLayerScreenBenPlant = omnivore.kml(
    'data/dep4_segments/Dep4OML_Screening Cum Beneficiation Plant.kml',
    null, L.geoJson(null, {
        style: () => ({ ...kmlStyle, fillColor: 'rgb(255,161,106)', color: 'rgb(255,161,106)' }),
        onEachFeature: (feature, layer) => layer.bindPopup(kmlPopup(feature.properties || {}, 'screenbenplant'))
    })
).addTo(map);

/* ── Chittalnar–Kumakoleng Tin Ore Block ── */
let chittalnarTinOre;
fetch('data/chittalnar_tin_ore.geojson')
    .then(res => res.json())
    .then(data => {
        chittalnarTinOre = L.geoJson(data, {
            style: {
                color: '#FFD700', // Gold/Tin-like
                weight: 2,
                fillColor: '#FFD700',
                fillOpacity: 0.3
            },
            onEachFeature: (feature, layer) => {
                const p = feature.properties;
                layer.bindPopup(buildPopup(p.name, [
                    ['Minerals', p.minerals],
                    ['Area (Ha)', p.area_ha],
                    ['Districts', p.districts],
                    ['Tehsils', p.tehsils],
                    ['Villages', p.villages],
                    ['Auction Date', p.auction_date],
                    ['Preferred Bidder', p.bidder],
                    ['Resource (G4)', p.resource_g4],
                    ['Exploration', p.exploration],
                    ['Status', p.status]
                ], 'tin'));
            }
        }).addTo(map);
        // Register in UI layer map after loading
        if (typeof layerMap !== 'undefined') layerMap.chittalnar = chittalnarTinOre;
    });

/* ── WMS layers ── */
const cgDistrictsWMS = L.tileLayer.wms('https://cfr.atree.org/geoserver/cfr/wms', {
    layers: 'cfr:cg_district_en', format: 'image/png', transparent: true, version: '1.3.0', opacity: 0.7
}).addTo(map);

const cgVillagesWMS = L.tileLayer.wms('https://cfr.atree.org/geoserver/cfr/wms', {
    layers: 'cfr:cg_village_en', format: 'image/png', transparent: true, version: '1.3.0', opacity: 0.6
});

const forestCompartments = L.tileLayer.wms('https://cfr.atree.org/geoserver/cfr/wms', {
    layers: 'cfr:cg_forest_compartments', format: 'image/png', transparent: true, version: '1.3.0', CRS: 'EPSG:4326', opacity: 0.6
});
