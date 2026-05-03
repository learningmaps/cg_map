/* ── Layer badge configs ── */
const LAYER_META = {
    major: { label: 'Major Mining NCOG', color: 'rgba(255,165,0,0.18)', border: 'rgba(255,165,0,0.7)', text: '#7a4d00' },
    majorngdr: { label: 'Major Mining NGDR 2022', color: 'rgba(255,81,0,0.15)', border: 'rgba(255,81,0,0.7)', text: '#7a2800' },
    minor: { label: 'Minor Mining NCOG', color: 'rgba(0,0,255,0.12)', border: 'rgba(80,80,255,0.7)', text: '#1a1a7a' },
    dep4: { label: 'Dep-04 ML Area', color: 'rgba(120,120,120,0.12)', border: 'rgba(41,41,41,0.55)', text: '#333' },
    dep4c: { label: 'Component-wise Breakdown', color: 'rgba(255,251,41,0.25)', border: 'rgba(200,196,0,0.8)', text: '#5a5400' },
    dep4screenbenplant: { label: 'Screening Cum Ben. Plant', color: 'rgba(255,161,106,0.25)', border: 'rgba(200,100,40,0.7)', text: '#6a3200' },
    bacheli: { label: 'Bacheli Airport', color: 'rgba(120, 250, 200, 0.25)', border: 'rgba(120, 250, 200, 0.85)', text: '#064d2c' },
    bhuvan: { label: 'Villages (Bhuvan)', color: 'rgba(255,255,0,0.18)', border: 'rgba(180,180,0,0.7)', text: '#545400' },
};

const activeState = {
    major: false, majorngdr: true, minor: false,
    dep4: true, dep4c: true, dep4screenbenplant: true,
    bacheli: true,
    dist: true, vil: false, bhuvan: false, forest: false,
    forest_bijapur: false
};

const dpr = window.devicePixelRatio || 1;
const isRetina = dpr > 1;
