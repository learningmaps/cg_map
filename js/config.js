/* ── Layer badge configs ── */
const LAYER_META = {
    major: { label: 'Major Mining NCOG', color: 'rgba(255,165,0,0.18)', border: 'rgba(255,165,0,0.5)', text: '#7a4d00' },
    majorngdr: { label: 'Major Mining NGDR 2022', color: 'rgba(255,81,0,0.15)', border: 'rgba(255,81,0,0.5)', text: '#7a2800' },
    minor: { label: 'Minor Mining NCOG', color: 'rgba(0,0,255,0.12)', border: 'rgba(0,0,255,0.5)', text: '#00008b' },
    dep4: { label: 'Dep-04 ML Area', color: 'rgba(120,120,120,0.12)', border: 'rgba(41,41,41,0.55)', text: '#333' },
    dep4c: { label: 'Component-wise Breakdown', color: 'rgba(255,251,41,0.25)', border: 'rgba(200,196,0,0.8)', text: '#5a5400' },
    dep4screenbenplant: { label: 'Screening Cum Ben. Plant', color: 'rgba(255,161,106,0.25)', border: 'rgba(200,100,40,0.7)', text: '#6a3200' },
    bacheli: { label: 'Bacheli Airport', color: 'rgba(120, 250, 200, 0.25)', border: 'rgba(120, 250, 200, 0.85)', text: '#064d2c' },
    bhuvan: { label: 'Villages (Bhuvan)', color: 'rgba(255,255,0,0.18)', border: 'rgba(255,255,0,0.5)', text: '#545400' },
    shrug: { label: 'Census 2011 (SHRUG)', color: 'rgba(0,100,255,0.15)', border: 'rgba(0,100,255,0.5)', text: '#004080' },
    impacted: { label: 'Impacted Villages', color: 'rgba(255,0,50,0.25)', border: 'rgba(255, 235, 235, 0.8)', text: '#8b0000' },
    tin: { label: 'Tin Ore Block', color: 'rgba(255, 215, 0, 0.2)', border: '#FFD700', text: '#6b5a00' },
    dep4photos: { label: 'Geotagged Photos', color: 'rgba(100,200,255,0.2)', border: 'rgba(44,95,138,0.7)', text: '#1a3d5c' },
    police_camps: { label: 'Police/Mil Camps', color: 'rgba(107,142,35,0.2)', border: '#6B8E23', text: '#3a4e0a' },
    osm_military: { label: 'OSM Landuse Military', color: 'rgba(70,130,180,0.2)', border: '#4682B4', text: '#1b4d75' },
    clan_gods: { label: 'Clan Gods Villages', color: 'rgba(204,41,54,0.25)', border: '#8b0000', text: '#8b0000' },
    sacred_geography: { label: 'Sacred Geography', color: 'rgba(46, 204, 113, 0.25)', border: '#2ecc71', text: '#1b7e42' },
    mines_sacred: { label: 'Mines in Sacred Areas', color: 'rgba(231, 76, 60, 0.25)', border: '#e74c3c', text: '#922b21' },
    dep5: { label: 'Dep-05 ML Area', color: 'rgba(0,150,136,0.15)', border: 'rgba(0,150,136,0.6)', text: '#004d40' },
    pekb: { label: 'PEKB & Parsa Coal Block', color: 'rgba(255,140,0,0.2)', border: '#ff8c00', text: '#b35c00' },
    alnar: { label: 'Alnar Iron Ore Mine', color: 'rgba(178,34,34,0.18)', border: 'rgba(178,34,34,0.7)', text: '#7a1515' },
    indravati_tiger_reserve: { label: 'Indravati Tiger Reserve', color: 'rgba(224,117,36,0.18)', border: 'rgba(224,117,36,0.5)', text: '#a04a00' }
};

const activeState = {
    major: false, majorngdr: true, minor: false,
    dep4: true, dep4c: true, dep4screenbenplant: true,
    dep5: true, pekb: true,
    chittalnar: true,
    bacheli: true,
    alnar: true,
    dist: false, vil: false, bhuvan: false, shrug: false, forest: false,
    forest_bijapur: false,
    impacted: true,
    dep4photos: true,
    police_camps: false,
    osm_military: false,
    clan_gods: false,
    sacred_geography: false,
    mines_sacred: false,
    indravati_tiger_reserve: true
};

const IMPACTED_VILLAGES = [
    { v: 'AMLIDHAR', d: 'BASTAR', total_population: 235, affected_population: 235, total_land_ha: 388.47, private_land_ha: 179.735, forest_land_ha: 88.452, revenue_land_ha: 120.272, remarks: 'To be displaced fully', status: 'Land under submergence', left_bank_right_bank: 'Right Bank' },
    { v: 'BARSUR (NP)', d: 'DANTEWADA', total_population: 2641, affected_population: null, total_land_ha: 218.907, private_land_ha: 39.394, forest_land_ha: null, revenue_land_ha: 179.513, remarks: 'Population not affected', status: null, left_bank_right_bank: null },
    { v: 'BENGLOOR', d: 'BIJAPUR', total_population: 213, affected_population: 213, total_land_ha: 196.527, private_land_ha: 107.176, forest_land_ha: 86.705, revenue_land_ha: 2.646, remarks: 'To be displaced fully', status: 'Land under submergence', left_bank_right_bank: 'Left Bank' },
    { v: 'BHATPAL', d: 'DANTEWADA', total_population: 435, affected_population: 395, total_land_ha: 535.846, private_land_ha: 201.12, forest_land_ha: 248.355, revenue_land_ha: 86.371, remarks: 'To be displaced partially', status: 'Land under submergence', left_bank_right_bank: 'Left Bank' },
    { v: 'BHEJA', d: 'BASTAR', id: '449176', total_population: 950, affected_population: 950, total_land_ha: 514.01, private_land_ha: 348.648, forest_land_ha: 108.605, revenue_land_ha: 56.757, remarks: 'To be displaced fully', status: 'Land under submergence', left_bank_right_bank: 'Left Bank' },
    { v: 'BINTA', d: 'BASTAR', total_population: 837, affected_population: 837, total_land_ha: 466.648, private_land_ha: 266.741, forest_land_ha: 164.697, revenue_land_ha: 35.21, remarks: 'To be displaced fully', status: 'Land under submergence', left_bank_right_bank: 'Left Bank' },
    { v: 'CHANDELA', d: 'BASTAR', total_population: 441, affected_population: 441, total_land_ha: 723.372, private_land_ha: 198.589, forest_land_ha: 361.973, revenue_land_ha: 162.81, remarks: 'To be displaced fully', status: 'Land under submergence', left_bank_right_bank: 'Right Bank' },
    { v: 'DHARMABEDA', d: 'BASTAR', total_population: 95, affected_population: 95, total_land_ha: 193.901, private_land_ha: 69.507, forest_land_ha: 40.061, revenue_land_ha: 84.333, remarks: 'To be displaced fully', status: 'Land under submergence', left_bank_right_bank: 'Right Bank' },
    { v: 'ARPUND', d: 'BASTAR', total_population: 247, affected_population: 247, total_land_ha: 476.549, private_land_ha: 143.313, forest_land_ha: 214.453, revenue_land_ha: 118.783, remarks: 'To be displaced fully', status: 'Land under submergence', left_bank_right_bank: 'Right Bank' },
    { v: 'HANDAPAL', d: 'KONDAGAON', total_population: 137, affected_population: 21, total_land_ha: 56.126, private_land_ha: 25.92, forest_land_ha: 16.206, revenue_land_ha: 14, remarks: 'To be displaced partially', status: 'Land under submergence', left_bank_right_bank: 'Right Bank' },
    { v: 'HARRA KODER', d: 'BASTAR', total_population: 524, affected_population: 524, total_land_ha: 877.395, private_land_ha: 342.087, forest_land_ha: 355.897, revenue_land_ha: 179.411, remarks: 'To be displaced fully', status: 'Land under submergence', left_bank_right_bank: 'Right Bank' },
    { v: 'HIRRAM', d: 'BASTAR', total_population: null, affected_population: null, total_land_ha: 60.35, private_land_ha: null, forest_land_ha: 60.35, revenue_land_ha: null, remarks: 'Population not affected', status: 'Land under submergence', left_bank_right_bank: 'Right Bank' },
    { v: 'HITAMETA', d: 'DANTEWADA', total_population: 481, affected_population: 165, total_land_ha: 587.589, private_land_ha: 218.256, forest_land_ha: 180.41, revenue_land_ha: 188.923, remarks: 'To be displaced partially', status: null, left_bank_right_bank: null },
    { v: 'HITAMETA', d: 'BASTAR', total_population: null, affected_population: null, total_land_ha: 119.915, private_land_ha: null, forest_land_ha: 119.915, revenue_land_ha: null, remarks: 'Population not affected', status: 'Land under submergence', left_bank_right_bank: 'Right Bank' },
    { v: 'ITULKUDUM', d: 'BIJAPUR', total_population: 61, affected_population: 61, total_land_ha: 23.703, private_land_ha: 23.703, forest_land_ha: null, revenue_land_ha: null, remarks: 'To be displaced fully', status: null, left_bank_right_bank: null },
    { v: 'KAKNAR', d: 'BASTAR', id: '449171', total_population: null, affected_population: null, total_land_ha: 40.008, private_land_ha: null, forest_land_ha: 40.008, revenue_land_ha: null, remarks: null, status: 'Land under submergence', left_bank_right_bank: 'Right Bank' },
    { v: 'KHADPADI', d: 'KONDAGAON', total_population: 392, affected_population: null, total_land_ha: 33.92, private_land_ha: null, forest_land_ha: 33.92, revenue_land_ha: null, remarks: 'Population not affected', status: 'Land under submergence', left_bank_right_bank: 'Right Bank' },
    { v: 'KODENAR', d: 'BASTAR', id: '449168', total_population: 119, affected_population: 119, total_land_ha: 360.022, private_land_ha: 48.264, forest_land_ha: 165.125, revenue_land_ha: 146.633, remarks: 'To be displaced fully', status: 'Land under submergence', left_bank_right_bank: 'Right Bank' },
    { v: 'KORALI', d: 'BASTAR', total_population: 112, affected_population: 112, total_land_ha: 297.392, private_land_ha: 84.703, forest_land_ha: 128.987, revenue_land_ha: 83.702, remarks: 'To be displaced fully', status: 'Land under submergence', left_bank_right_bank: 'Left Bank' },
    { v: 'KOYAM', d: 'BIJAPUR', total_population: 65, affected_population: 65, total_land_ha: 214.438, private_land_ha: 44.632, forest_land_ha: 117.336, revenue_land_ha: 52.47, remarks: 'To be displaced fully', status: 'Land under submergence', left_bank_right_bank: 'Left Bank' },
    { v: 'KUDHUR', d: 'KONDAGAON', total_population: 888, affected_population: 888, total_land_ha: 1028.385, private_land_ha: 587.041, forest_land_ha: 287.89, revenue_land_ha: 153.454, remarks: 'To be displaced fully', status: 'Land under submergence', left_bank_right_bank: 'Right Bank' },
    { v: 'KAREKOT', d: 'BASTAR', total_population: 461, affected_population: 461, total_land_ha: 598.297, private_land_ha: 346.468, forest_land_ha: 152.947, revenue_land_ha: 98.882, remarks: 'To be displaced fully', status: 'Land under submergence', left_bank_right_bank: 'Left Bank' },
    { v: 'MAHIMA', d: 'BASTAR', total_population: 155, affected_population: 155, total_land_ha: 226.5, private_land_ha: 114.733, forest_land_ha: 87.101, revenue_land_ha: 24.666, remarks: 'To be displaced fully', status: 'Land under submergence', left_bank_right_bank: 'Right Bank' },
    { v: 'MALEWAHI', d: 'BASTAR', total_population: 63, affected_population: 63, total_land_ha: 322.301, private_land_ha: 74.754, forest_land_ha: 227.495, revenue_land_ha: 20.052, remarks: 'To be displaced fully', status: 'Land under submergence', left_bank_right_bank: 'Right Bank' },
    { v: 'MARDUM', d: 'BASTAR', total_population: 1708, affected_population: null, total_land_ha: 108.987, private_land_ha: 46.544, forest_land_ha: null, revenue_land_ha: 62.443, remarks: 'Population not affected', status: 'Land under submergence', left_bank_right_bank: 'Left Bank' },
    { v: 'MATNAR', d: 'BASTAR', id: '449191', total_population: 1186, affected_population: null, total_land_ha: 53.998, private_land_ha: 17.287, forest_land_ha: 3, revenue_land_ha: 33.711, remarks: 'Population not affected', status: 'Land under submergence', left_bank_right_bank: 'Left Bank' },
    { v: 'MUCHNAR', d: 'DANTEWADA', total_population: null, affected_population: null, total_land_ha: 12.28, private_land_ha: 12.28, forest_land_ha: null, revenue_land_ha: null, remarks: 'Population not affected', status: null, left_bank_right_bank: null },
    { v: 'MUNJER', d: 'BASTAR', total_population: null, affected_population: null, total_land_ha: 28.24, private_land_ha: 27.161, forest_land_ha: 0.877, revenue_land_ha: 0.202, remarks: 'Population not affected', status: 'Land under submergence', left_bank_right_bank: 'Left Bank' },
    { v: 'NEURNAR', d: 'DANTEWADA', total_population: 113, affected_population: 113, total_land_ha: 270.782, private_land_ha: 81.425, forest_land_ha: 28.009, revenue_land_ha: 161.348, remarks: 'To be displaced fully', status: 'Land under submergence', left_bank_right_bank: 'Left Bank' },
    { v: 'POHNAR', d: 'BASTAR', total_population: null, affected_population: null, total_land_ha: 106.6, private_land_ha: null, forest_land_ha: 106.6, revenue_land_ha: null, remarks: 'Population not affected', status: 'Land under submergence', left_bank_right_bank: 'Right Bank' },
    { v: 'PALAM', d: 'BASTAR', total_population: 133, affected_population: 133, total_land_ha: 246.988, private_land_ha: 58.652, forest_land_ha: 167.033, revenue_land_ha: 21.303, remarks: 'To be displaced fully', status: 'Land under submergence', left_bank_right_bank: 'Right Bank' },
    { v: 'PICHI KODER', d: 'BASTAR', total_population: 127, affected_population: 127, total_land_ha: 397.799, private_land_ha: 59.355, forest_land_ha: 232.452, revenue_land_ha: 105.992, remarks: 'To be displaced fully', status: 'Land under submergence', left_bank_right_bank: 'Right Bank' },
    { v: 'PUNGARPAL', d: 'KONDAGAON', total_population: 138, affected_population: 38, total_land_ha: 142.791, private_land_ha: 14.811, forest_land_ha: 125.98, revenue_land_ha: 2, remarks: 'To be displaced partially', status: 'Land under submergence', left_bank_right_bank: 'Right Bank' },
    { v: 'PUSPAL CHI', d: 'BASTAR', total_population: 42, affected_population: 42, total_land_ha: 361.632, private_land_ha: 67.117, forest_land_ha: 213.571, revenue_land_ha: 80.944, remarks: 'To be displaced fully', status: 'Land under submergence', left_bank_right_bank: 'Right Bank' },
    { v: 'PUSPAL A', d: 'BASTAR', total_population: 42, affected_population: 42, total_land_ha: 361.632, private_land_ha: 67.117, forest_land_ha: 213.571, revenue_land_ha: 80.944, remarks: 'To be displaced fully', status: 'Land under submergence', left_bank_right_bank: 'Right Bank' },
    { v: 'RAIGONDI', d: 'BASTAR', total_population: 186, affected_population: 186, total_land_ha: 301.758, private_land_ha: 83.395, forest_land_ha: 145.613, revenue_land_ha: 72.75, remarks: 'To be displaced fully', status: 'Land under submergence', left_bank_right_bank: 'Left Bank' },
    { v: 'RAKASMETA', d: 'KONDAGAON', total_population: 47, affected_population: 47, total_land_ha: 158.141, private_land_ha: 27.139, forest_land_ha: 91.85, revenue_land_ha: 39.151, remarks: 'To be displaced fully', status: 'Land under submergence', left_bank_right_bank: 'Right Bank' },
    { v: 'SADAR', d: 'BIJAPUR', total_population: 28, affected_population: 28, total_land_ha: 100.191, private_land_ha: 18.466, forest_land_ha: null, revenue_land_ha: 81.725, remarks: 'To be displaced fully', status: null, left_bank_right_bank: null },
    { v: 'SATASHPUR', d: 'BASTAR', total_population: 445, affected_population: 445, total_land_ha: 315.222, private_land_ha: 134.955, forest_land_ha: 89.96, revenue_land_ha: 90.307, remarks: 'To be displaced fully', status: 'Land under submergence', left_bank_right_bank: 'Left Bank' },
    { v: 'TUMASKODAR', d: 'BASTAR', total_population: null, affected_population: null, total_land_ha: 215.452, private_land_ha: null, forest_land_ha: 215.452, revenue_land_ha: null, remarks: 'Population not affected', status: 'Land under submergence', left_bank_right_bank: 'Right Bank' },
    { v: 'TUMDIWAL', d: 'KONDAGAON', total_population: 560, affected_population: 560, total_land_ha: 819.464, private_land_ha: 535.973, forest_land_ha: 212.045, revenue_land_ha: 71.446, remarks: 'To be displaced fully', status: 'Land under submergence', left_bank_right_bank: 'Right Bank' },
    { v: 'UDENAR', d: 'DANTEWADA', total_population: 243, affected_population: 243, total_land_ha: 487.908, private_land_ha: 116.534, forest_land_ha: 121.861, revenue_land_ha: 249.515, remarks: 'To be displaced fully', status: 'Land under submergence', left_bank_right_bank: 'Left Bank' }
];

const dpr = window.devicePixelRatio || 1;
const isRetina = dpr > 1;

/* ── Legend Groups and Items Configuration ── */
const LEGEND_CONFIG = [
    {
        id: 'grp-basemaps',
        label: 'Base Maps',
        isBaseMap: true,
        items: [
            { id: 'satellite', label: 'ESRI Satellite', swatch: { background: '#222', border: '#444' }, hasLabels: true },
            { id: 'google_satellite', label: 'Google Satellite', swatch: { background: '#111', border: '#333' } },
            { id: 'osm', label: 'OpenStreetMap', swatch: { background: '#fff', border: '#ccc' } },
            { id: 'topo', label: 'OpenTopoMap', swatch: { background: '#e0e0e0', border: '#999' } },
            { id: 'stamen_terrain', label: 'Stamen Terrain', swatch: { background: '#c8d9c0', border: '#7a9a6e' } },
            { id: 'thunderforest_dark', label: 'CartoDB Dark Matter', swatch: { background: '#1a1a2e', border: '#444' } }
        ]
    },
    {
        id: 'grp-mining',
        label: 'Mining Leases (NCOG/NGDR Data)',
        items: [
            { id: 'major', label: 'Major Mining NCOG', swatch: { background: 'rgba(255,165,0,0.5)', border: 'rgba(255,165,0,0.5)' } },
            { id: 'majorngdr', label: 'Major Mining NGDR 2022', swatch: { background: 'rgba(255,81,0,0.5)', border: 'rgba(255,81,0,0.5)' } },
            { id: 'minor', label: 'Minor Mining NCOG', swatch: { background: 'rgba(0,0,255,0.5)', border: 'rgba(0,0,255,0.5)' } }
        ]
    },
    {
        id: 'grp-dep4',
        label: 'Deposit 4',
        items: [
            { id: 'dep4', label: 'Dep-04 ML Area', swatch: { background: 'rgba(255,255,255,0.12)', border: 'rgba(41,41,41,0.685)' }, zoomTarget: 'kmlLayer' },
            { id: 'dep4c', label: 'Component wise Breakdown', swatch: { background: 'rgb(255,251,41)', border: 'rgb(255,251,41)' }, zoomTarget: 'kmlLayerCompWise' },
            { id: 'dep4screenbenplant', label: 'Screening Cum Beneficiation Plant', swatch: { background: 'rgb(255,161,106)', border: 'rgb(255,161,106)' }, zoomTarget: 'kmlLayerScreenBenPlant' },
            { id: 'dep4photos', label: 'Geotagged Photos', swatch: { background: 'rgba(100,200,255,0.4)', border: 'rgba(44,95,138,0.8)' }, zoomTarget: 'dep4photos_custom' }
        ]
    },
    {
        id: 'grp-dep5',
        label: 'Deposit 5',
        items: [
            { id: 'dep5', label: 'Dep-05 ML Area', swatch: { background: 'rgba(0,150,136,0.15)', border: 'rgba(0,150,136,0.6)' }, zoomTarget: 'kmlLayerDep5' }
        ]
    },
    {
        id: 'grp-pekb',
        label: 'PEKB (Parsa East and Kanta Basan)',
        items: [
            { id: 'pekb', label: 'PEKB & Parsa Coal Block', swatch: { background: 'rgba(255,140,0,0.3)', border: '#ff8c00' }, zoomTarget: 'kmlLayerPekb' }
        ]
    },
    {
        id: 'grp-chittalnar',
        label: 'Chittalnar–Kumakoleng Tin Ore Block',
        items: [
            { id: 'chittalnar', label: 'Tin Ore Block', swatch: { background: 'rgba(255, 215, 0, 0.5)', border: '#FFD700' }, zoomTarget: 'chittalnarTinOre' }
        ]
    },
    {
        id: 'grp-alnar',
        label: 'Alnar Iron Ore Mine',
        items: [
            { id: 'alnar', label: 'Alnar Iron Ore Mine', swatch: { background: 'rgba(178,34,34,0.5)', border: 'rgba(178,34,34,0.7)' }, zoomTarget: 'kmlLayerAlnar' }
        ]
    },
    {
        id: 'grp-bacheli',
        label: 'Bacheli Airport',
        items: [
            { id: 'bacheli', label: 'Bacheli Airport', swatch: { background: 'rgba(120, 250, 200, 0.884)', border: 'rgba(120, 250, 200, 0.884)' }, zoomTarget: 'kmlLayerBacheli' }
        ]
    },
    {
        id: 'grp-bodhghat',
        label: 'Bodhghat Hydro',
        items: [
            { id: 'impacted', label: 'Impacted Villages', swatch: { background: 'rgba(255,0,50,0.5)', border: 'rgba(255, 235, 235, 0.8)' }, zoomTarget: 'bodhghat_coords' }
        ]
    },
    {
        id: 'grp-indravati',
        label: 'Indravati Tiger Reserve',
        items: [
            { id: 'indravati_tiger_reserve', label: 'Affected Villages', swatch: { background: 'rgba(224,117,36,0.5)', border: 'rgba(224,117,36,0.5)' }, zoomTarget: 'indravati_coords' }
        ]
    },
    {
        id: 'grp-admin',
        label: 'Administrative',
        items: [
            { id: 'dist', label: 'Districts (ATREE)', swatch: { type: 'line', background: '#888' } },
            { id: 'vil', label: 'Villages (ATREE)', swatch: { type: 'line', background: '#e55' } },
            { id: 'bhuvan', label: 'Villages (Bhuvan)', swatch: { background: 'yellow', border: 'rgba(255,255,0,0.5)' } },
            { id: 'shrug', label: 'Census of India 2011 (SHRUG)', swatch: { background: 'rgba(0,100,255,0.5)', border: 'rgba(0,100,255,0.5)' } }
        ]
    },
    {
        id: 'grp-police',
        label: 'Police/Military Camps',
        items: [
            { id: 'police_camps', label: 'Police/Mil Camps', swatch: { background: '#6B8E23', border: '#6B8E23' }, isCamp: true },
            { id: 'osm_military', label: 'OSM Landuse Military', swatch: { background: '#4682B4', border: '#4682B4' }, isOsmMilitary: true }
        ]
    },
    {
        id: 'grp-forest',
        label: 'Forest',
        items: [
            { id: 'forest', label: 'Forest Compartments (ATREE)', swatch: { type: 'line', background: 'rgb(36, 181, 56)' } },
            { id: 'forest_bijapur', label: 'Bijapur Forest Compts (Chhattisgarh Forest Department)', swatch: { type: 'line', background: 'rgb(164, 254, 131)' }, hasExternalLink: 'https://forest.cg.gov.in/FMIS_AllApp/Forest%20Working%20Plan/FWP_Indx.html' }
        ]
    },
    {
        id: 'grp-sacred-geography',
        label: 'Sacred Geography',
        items: [
            { id: 'clan_gods', label: 'Village Overlay (by Phratry)', swatch: { background: 'rgba(204,41,54,0.5)', border: '#8b0000' } },
            { id: 'sacred_geography', label: 'Sacred Geography', swatch: { background: 'rgba(46, 204, 113, 0.5)', border: '#2ecc71' }, zoomTarget: 'sacredGeographyLayer' },
            { id: 'mines_sacred', label: 'Mines in Sacred Areas', swatch: { background: 'rgba(231, 76, 60, 0.5)', border: '#e74c3c' }, zoomTarget: 'minesSacredLayer' }
        ]
    }
];

