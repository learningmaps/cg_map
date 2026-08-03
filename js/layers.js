/* ── Major mining NCOG ── */
const majorMining = L.vectorGrid.protobuf(
    "https://indianopenmaps.fly.dev/not-so-open/mining/leases/major/ncog/{z}/{x}/{y}.pbf",
    {
        maxNativeZoom: 11, maxZoom: 22,
        rendererFactory: L.svg.tile,
        vectorTileLayerStyles: {
            'NCOG_Major_Mining_Leases': {
                fillColor: 'rgba(255,165,0,0.5)', fill: true, fillOpacity: 0.3,
                stroke: true, color: 'rgba(255,165,0,0.5)', weight: 0.1,
                nonScalingStroke: true
            }
        },
        interactive: true,
        detectRetina: true,
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
                stroke: true, color: 'rgba(255,81,0,0.5)', weight: 0.1,
                nonScalingStroke: true
            }
        },
        interactive: true,
        detectRetina: true,
        getFeatureId: f => f.properties?.id || f.properties?.lease_id || Math.random()
    }
);

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
                stroke: true, color: 'rgba(0,0,255,0.5)', weight: 0.1,
                nonScalingStroke: true
            }
        },
        interactive: true,
        detectRetina: true,
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
                stroke: true, color: 'rgba(255, 255, 0, 0.5)', weight: 0.1,
                nonScalingStroke: true
            }
        },
        interactive: true,
        detectRetina: true,
        getFeatureId: f => f.properties?.id || f.properties?.village_id || Math.random()
    }
);

bhuvanVillages.on('click', e => {
    const p = e.layer?.properties || e.propagatedFrom?.properties || {};
    L.popup({ closeButton: true })
        .setLatLng(e.latlng)
        .setContent(buildPopup(p.v_name || 'Village', [
            ['District', p.d_name],
            ['Block', p.b_name],
            ['Gram Panchayat', p.gp_name],
            ['Village ID', p.v_code]
        ], 'bhuvan')).openOn(map);
});

/* ── SHRUG Census 2011 ── */
const shrugCensus = L.vectorGrid.protobuf(
    "https://indianopenmaps.com/shrug-census2011/villages/{z}/{x}/{y}.pbf",
    {
        maxNativeZoom: 9, maxZoom: 22,
        rendererFactory: L.svg.tile,
        vectorTileLayerStyles: {
            'shrug': {
                fillColor: 'rgba(0,100,255,0.5)', fill: true, fillOpacity: 0.3,
                stroke: true, color: 'rgba(0,100,255, 0.5)', weight: 0.1,
                nonScalingStroke: true
            },
            'village': {
                fillColor: 'rgba(0,100,255,0.5)', fill: true, fillOpacity: 0.3,
                stroke: true, color: 'rgba(0,100,255, 0.5)', weight: 0.1,
                nonScalingStroke: true
            },
            'pc11': {
                fillColor: 'rgba(0,100,255,0.5)', fill: true, fillOpacity: 0.3,
                stroke: true, color: 'rgba(0,100,255, 0.5)', weight: 0.1,
                nonScalingStroke: true
            }
        },
        interactive: true,
        detectRetina: true,
        getFeatureId: f => f.properties?.pc11_tv_id || f.properties?.id || Math.random()
    }
);

shrugCensus.on('click', e => {
    const p = e.layer?.properties || e.propagatedFrom?.properties || {};
    L.popup({ closeButton: true })
        .setLatLng(e.latlng)
        .setContent(buildPopup(p.tv_name || 'Village (Census 2011)', [
            ['Village ID', p.pc11_tv_id],
            ['Sub-Dist ID', p.pc11_sd_id],
            ['District ID', p.pc11_d_id],
            ['State ID', p.pc11_s_id]
        ], 'shrug')).openOn(map);
});

/* ── Impacted villages (GeoJSON with Dynamic Centroid Labels) ── */
const impactedLabelLayer = L.layerGroup([]);
const geoJsonImpactedLayer = L.geoJson(null, {
    style: feature => {
        const target = feature.properties.impact_data;
        if (target) {
            const isPartial = target.remarks === 'To be displaced partially';
            const isNoPop = target.remarks === 'Population not affected';
            
            let fillColor = '#b33939'; // Default: Deep Crimson (Fully displaced)
            if (isPartial) {
                fillColor = '#e67e22'; // Medium: Warm Terracotta Orange (Partially displaced)
            } else if (isNoPop) {
                fillColor = '#ffd255'; // Low: Soft Golden Yellow (Population not affected)
            }

            return {
                fillColor: fillColor, fill: true, fillOpacity: 0.45,
                stroke: true, color: 'rgba(255, 235, 235, 0.8)', weight: 0.8,
                nonScalingStroke: true
            };
        }
        return { fill: false, stroke: false, opacity: 0 };
    }
});

// Load the filtered GeoJSON file asynchronously
fetch("data/bodhghat_impacted_villages.geojson")
    .then(r => r.json())
    .then(data => {
        geoJsonImpactedLayer.addData(data);
        rebuildImpactedLabels();
    })
    .catch(err => console.error("Error loading impacted GeoJSON:", err));

const impactedVillages = L.layerGroup([geoJsonImpactedLayer, impactedLabelLayer]);

function rebuildImpactedLabels() {
    if (typeof map === 'undefined' || !map || !impactedLabelLayer) return;
    impactedLabelLayer.clearLayers();

    const zoom = map.getZoom();
    if (zoom < 11.5) return; // Only display labels when zoomed in (Z11.5+)

    geoJsonImpactedLayer.eachLayer(layer => {
        if (typeof layer.getBounds !== 'function') return;
        
        const props = layer.feature?.properties || {};
        const rawName = props.v_name || '';
        // Format to Title Case (Proper Noun)
        const vName = rawName.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        
        // Use true precomputed centroid to prevent label collisions/off-polygon placement
        const center = props.centroid || layer.getBounds().getCenter();

        const style = 'color:#5c2500; font-size:9.5px; font-weight:600; white-space:nowrap; text-shadow:-1px -1px 0 #FEFBE3, 1px -1px 0 #FEFBE3, -1px 1px 0 #FEFBE3, 1px 1px 0 #FEFBE3; text-align:center; width:120px;';
        
        const labelMarker = L.marker(center, {
            interactive: false,
            icon: L.divIcon({
                className: '',
                html: `<div style="${style}">${vName}</div>`,
                iconSize: [120, 20],
                iconAnchor: [60, 10]
            })
        });
        impactedLabelLayer.addLayer(labelMarker);
    });
}

// Bind zoom/pan events to rebuild labels dynamically when the layer is active
map.on('moveend', () => {
    if (map.hasLayer(impactedVillages)) {
        rebuildImpactedLabels();
    }
});

map.on('layeradd', (e) => {
    if (e.layer === impactedVillages) {
        rebuildImpactedLabels();
    }
});

// Bind click handler directly to geoJsonImpactedLayer to guarantee correct polygon resolution
geoJsonImpactedLayer.on('click', e => {
    const p = e.layer?.feature?.properties || e.layer?.properties || e.propagatedFrom?.properties || {};
    const vName = (p.v_name || "").toUpperCase();
    const dName = (p.d_name || "").toUpperCase();
    
    const target = IMPACTED_VILLAGES.find(t => {
        if (t.id) {
            return String(p.v_code) === String(t.id);
        }
        return t.v === vName && dName.includes(t.d);
    }) || {};

    L.popup({ closeButton: true })
        .setLatLng(e.latlng)
        .setContent(buildPopup(p.v_name || 'Impacted Village', [
            ['Remarks', target.remarks],
            ['District', p.d_name],
            ['Block', p.b_name],
            ['Gram Panchayat', p.gp_name],
            ['Village ID', p.v_code],
            ['Total Population', target.total_population],
            ['Affected Population', target.affected_population],
            ['Total Land (ha)', target.total_land_ha],
            ['Private Land (ha)', target.private_land_ha],
            ['Forest Land (ha)', target.forest_land_ha],
            ['Revenue Land (ha)', target.revenue_land_ha],
            ['Status', target.status ? `<span style="color:#d00; font-weight:bold;">${target.status}</span>` : '<span style="color:#d00; font-weight:bold;">Project Impacted</span>'],
            ['Left Bank/Right Bank', target.left_bank_right_bank]
        ], 'impacted')).openOn(map);
});

/* ── KML layers ── */
const kmlStyle = { color: 'rgba(255,255,255,0.7)', weight: 1.5, fillColor: 'white', fillOpacity: 0.2 };

const kmlLayerBacheli = omnivore.kml("data/Bacheli Airport/site 1 - bacheli_airport_proposed_project_ec.kml", null, L.geoJson(null, {
    style: () => ({ ...kmlStyle, fillColor: 'rgba(120, 250, 200)', color: 'rgba(120, 250, 200)' }),
    onEachFeature: (feature, layer) => {
        const props = feature.properties || {};
        layer.bindPopup(kmlPopup(props, "bacheli"));
    }
}));

const kmlLayerAlnar = omnivore.kml(
    "data/Alnar Iron Ore Mine/1211212351211zys37alnarkml.kml",
    null, L.geoJson(null, {
        style: () => ({ ...kmlStyle, fillColor: 'rgb(178,34,34)', color: 'rgb(178,34,34)' }),
        onEachFeature: (feature, layer) => layer.bindPopup(kmlPopup(feature.properties || {}, 'alnar'))
    })
);

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
}));

const kmlLayerCompWise = omnivore.kml(
    'data/dep4_segments/4112212521214727y5compartmentwiseandcomponentwiselandbreakupdep4.kml',
    null, L.geoJson(null, {
        style: () => ({ ...kmlStyle, fillColor: 'rgb(255,251,41)', color: 'rgb(255,251,41)' }),
        onEachFeature: (feature, layer) => layer.bindPopup(kmlPopup(feature.properties || {}, 'comp'))
    })
);

const kmlLayerScreenBenPlant = omnivore.kml(
    'data/dep4_segments/Dep4OML_Screening Cum Beneficiation Plant.kml',
    null, L.geoJson(null, {
        style: () => ({ ...kmlStyle, fillColor: 'rgb(255,161,106)', color: 'rgb(255,161,106)' }),
        onEachFeature: (feature, layer) => layer.bindPopup(kmlPopup(feature.properties || {}, 'screenbenplant'))
    })
);

const kmlLayerDep5 = omnivore.kml(
    'data/deposit_5/Dep-5_Kml file.kml',
    null, L.geoJson(null, {
        style: () => ({ ...kmlStyle, fillColor: 'rgb(0,150,136)', color: 'rgb(0,150,136)' }),
        onEachFeature: (feature, layer) => layer.bindPopup(kmlPopup(feature.properties || {}, 'dep5'))
    })
);

const kmlLayerPekbBase = omnivore.kml(
    'data/PEKB/pekb.kml',
    null, L.geoJson(null, {
        style: () => ({ ...kmlStyle, fillColor: 'rgba(255,140,0,0.3)', color: '#ff8c00', weight: 2 }),
        onEachFeature: (feature, layer) => layer.bindPopup(kmlPopup({
            name: 'Parsa East & Kanta Basan (PEKB) Mine Block',
            block: 'Parsa East & Kanta Basan (PEKB)',
            operator: 'Adani Mining (MDO) / Parsa Kente Collieries Ltd',
            allottee: 'Rajasthan Rajya Vidyut Utpadan Nigam Ltd (RRVUNL)',
            capacity: '15 MTPA',
            coalfield: 'Hasdeo-Arand Coalfield',
            district: 'Surguja',
            state: 'Chhattisgarh'
        }, 'pekb'))
    })
);

const kmlLayerParsaCoal = omnivore.kml(
    'data/PEKB/Parsa_Coal_Block.kml',
    null, L.geoJson(null, {
        style: () => ({ ...kmlStyle, fillColor: 'rgba(255,140,0,0.2)', color: '#ff8c00', weight: 2 }),
        pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
            radius: 5,
            fillColor: '#ff8c00',
            color: '#ffffff',
            weight: 1,
            fillOpacity: 0.9
        }),
        onEachFeature: (feature, layer) => {
            const isPolygon = feature.geometry && feature.geometry.type === 'Polygon';
            const featureName = isPolygon ? 'Parsa Coal Block Boundary' : `Boundary Point ${feature.properties?.name || ''}`;
            const featureDesc = feature.properties?.description || '';
            layer.bindPopup(kmlPopup({
                name: featureName,
                block: 'Parsa Coal Block',
                operator: 'Adani Group (MDO) / Parsa Kente Collieries Ltd',
                allottee: 'Rajasthan Rajya Vidyut Utpadan Nigam Ltd (RRVUNL)',
                capacity: '5 MTPA',
                coalfield: 'Hasdeo-Arand Coalfield',
                district: 'Surguja & Surajpur',
                state: 'Chhattisgarh',
                details: featureDesc
            }, 'pekb'));
        }
    })
);

const kmlLayerPekb = L.featureGroup([kmlLayerPekbBase, kmlLayerParsaCoal]);

/* ── Police/Military Camps (merged, clustered) ── */
const kmlLayerPoliceCamps = L.markerClusterGroup({
    zoomToBoundsOnClick: false,
    iconCreateFunction: cluster => L.divIcon({
        html: `<div class="police-cluster-icon">${cluster.getChildCount()}</div>`,
        className: '',
        iconSize: L.point(24, 24),
    }),
});

const geoLayerPoliceCamps = L.geoJson(null, {
    pointToLayer: (feature, latlng) => L.marker(latlng, {
        icon: L.divIcon({
            className: '',
            html: '<div class="police-marker-icon"></div>',
            iconSize: [12, 12],
            iconAnchor: [6, 6],
        }),
    }),
    onEachFeature: (feature, layer) => {
        layer.bindPopup(kmlPopup(feature.properties || {}, "police_camps"));
    },
});

omnivore.kml("data/police_military_camps/merged.kml", null, geoLayerPoliceCamps)
    .on("ready", function () {
        geoLayerPoliceCamps.eachLayer(l => kmlLayerPoliceCamps.addLayer(l));
    });

kmlLayerPoliceCamps.on("clusterclick", function (a) {
    const markers = a.layer.getAllChildMarkers();
    const items = markers.map(m => {
        const p = (m.feature && m.feature.properties) || {};
        return `<div class="cluster-item">
            <strong>${p.name || "Unknown"}</strong><br/>
            <span class="cluster-item-type">${extractForceType(p.name)}</span>
        </div>`;
    }).join("");

    L.popup()
        .setLatLng(a.latlng)
        .setContent(`
            <div class="popup-inner cluster-popup">
                <div class="popup-layer-badge" style="background:rgba(107,142,35,0.2);border:1px solid #6B8E23;color:#3a4e0a;">
                    <span class="badge-dot" style="background:#6B8E23;"></span>
                    Police/Military Camps
                </div>
                <div class="popup-title">${markers.length} camps in this area</div>
                ${items}
            </div>
        `)
        .openOn(map);
});

/* ── OSM Landuse Military (downloaded, clustered) ── */
const osmMilitaryCluster = L.markerClusterGroup({
    zoomToBoundsOnClick: false,
    iconCreateFunction: cluster => L.divIcon({
        html: `<div class="osm-military-cluster-icon">${cluster.getChildCount()}</div>`,
        className: '',
        iconSize: L.point(24, 24),
    }),
});

const geoLayerOsmMilitary = L.geoJson(null, {
    pointToLayer: (feature, latlng) => L.marker(latlng, {
        icon: L.divIcon({
            className: '',
            html: '<div class="osm-military-marker-icon"></div>',
            iconSize: [12, 12],
            iconAnchor: [6, 6],
        }),
    }),
    onEachFeature: (feature, layer) => {
        const p = feature.properties || {};
        const rows = [
            ['OSM ID', p.id],
            ['OSM Type', p.osm_type],
            ['Military', p.military || '—'],
            ['Landuse', p.landuse || '—'],
        ];
        if (p.barrier) rows.push(['Barrier', p.barrier]);
        if (p.notes) rows.push(['Notes', p.notes]);
        layer.bindPopup(buildPopup(p.name || 'OSM Military Area', rows, 'osm_military'));
    },
});

fetch("data/police_military_camps/osm_landuse_military.geojson")
    .then(r => r.json())
    .then(data => {
        geoLayerOsmMilitary.addData(data);
        geoLayerOsmMilitary.eachLayer(l => osmMilitaryCluster.addLayer(l));
    })
    .catch(err => console.error("Error loading OSM military GeoJSON:", err));

osmMilitaryCluster.on("clusterclick", function (a) {
    const markers = a.layer.getAllChildMarkers();
    const items = markers.map(m => {
        const p = (m.feature && m.feature.properties) || {};
        return `<div class="cluster-item">
            <strong>${p.name || "OSM Military Area"}</strong><br/>
            <span class="cluster-item-type-osm">${p.military || p.landuse || "Military"}</span>
        </div>`;
    }).join("");

    L.popup()
        .setLatLng(a.latlng)
        .setContent(`
            <div class="popup-inner cluster-popup">
                <div class="popup-layer-badge" style="background:rgba(70,130,180,0.2);border:1px solid #4682B4;color:#1b4d75;">
                    <span class="badge-dot" style="background:#4682B4;"></span>
                    OSM Landuse Military
                </div>
                <div class="popup-title">${markers.length} military locations in this area</div>
                ${items}
            </div>
        `)
        .openOn(map);
});


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
        });
        // Register in UI layer map after loading
        if (typeof layerMap !== 'undefined') {
            layerMap.chittalnar = chittalnarTinOre;
            if (typeof initLayersFromConfig === 'function') initLayersFromConfig();
        }
    });

/* ── WMS layers ── */
const cgDistrictsWMS = L.tileLayer.wms('https://cfr.atree.org/geoserver/cfr/wms', {
    layers: 'cfr:cg_district_en', format: 'image/png', transparent: true, version: '1.3.0', opacity: 0.7, pane: 'wmsOverlayPane'
});

const cgVillagesWMS = L.tileLayer.wms('https://cfr.atree.org/geoserver/cfr/wms', {
    layers: 'cfr:cg_village_en', format: 'image/png', transparent: true, version: '1.3.0', opacity: 0.6, pane: 'wmsOverlayPane'
});

/* ── Label Layers ── */
const googleLabels = L.tileLayer('https://{s}.google.com/vt/lyrs=h&x={x}&y={y}&z={z}', {
    maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'], attribution: '© Google', pane: 'labels'
});

const forestCompartments = L.tileLayer.wms('https://cfr.atree.org/geoserver/cfr/wms', {
    layers: 'cfr:cg_forest_compartments', format: 'image/png', transparent: true, version: '1.3.0', CRS: 'EPSG:4326', opacity: 0.6, pane: 'wmsOverlayPane'
});
