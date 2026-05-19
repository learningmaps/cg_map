/* ── Layer badge configs ── */
const LAYER_META = {
    major: { label: 'Major Mining NCOG', color: 'rgba(255,165,0,0.18)', border: 'rgba(255,165,0,0.7)', text: '#7a4d00' },
    majorngdr: { label: 'Major Mining NGDR 2022', color: 'rgba(255,81,0,0.15)', border: 'rgba(255,81,0,0.7)', text: '#7a2800' },
    minor: { label: 'Minor Mining NCOG', color: 'rgba(0,0,255,0.12)', border: 'rgba(0,0,255,0.7)', text: '#00008b' },
    dep4: { label: 'Dep-04 ML Area', color: 'rgba(120,120,120,0.12)', border: 'rgba(41,41,41,0.55)', text: '#333' },
    dep4c: { label: 'Component-wise Breakdown', color: 'rgba(255,251,41,0.25)', border: 'rgba(200,196,0,0.8)', text: '#5a5400' },
    dep4screenbenplant: { label: 'Screening Cum Ben. Plant', color: 'rgba(255,161,106,0.25)', border: 'rgba(200,100,40,0.7)', text: '#6a3200' },
    bacheli: { label: 'Bacheli Airport', color: 'rgba(120, 250, 200, 0.25)', border: 'rgba(120, 250, 200, 0.85)', text: '#064d2c' },
    bhuvan: { label: 'Villages (Bhuvan)', color: 'rgba(255,255,0,0.18)', border: 'rgba(180,180,0,0.7)', text: '#545400' },
    shrug: { label: 'Census 2011 (SHRUG)', color: 'rgba(0,100,255,0.15)', border: 'rgba(0,100,255,0.7)', text: '#004080' },
    impacted: { label: 'Impacted Villages', color: 'rgba(255,0,50,0.25)', border: 'rgba(255,0,50,0.8)', text: '#8b0000' },
    tin: { label: 'Tin Ore Block', color: 'rgba(255, 215, 0, 0.2)', border: '#FFD700', text: '#6b5a00' },
};

const activeState = {
    major: false, majorngdr: true, minor: false,
    dep4: true, dep4c: true, dep4screenbenplant: true,
    chittalnar: true,
    bacheli: true,
    dist: false, vil: false, bhuvan: false, shrug: false, forest: false,
    forest_bijapur: false,
    impacted: true
};

const IMPACTED_VILLAGES = [
    { v: 'AMLIDHAR', d: 'BASTAR' },
    { v: 'BARSUR (NP)', d: 'DANTEWADA' },
    { v: 'BENGLOOR', d: 'BIJAPUR' },
    { v: 'BHATPAL', d: 'DANTEWADA' },
    { v: 'BHEJA', d: 'BASTAR', id: '449176' },
    { v: 'BINTA', d: 'BASTAR' },
    { v: 'CHANDELA', d: 'BASTAR' },
    { v: 'DHARMABEDA', d: 'BASTAR' },
    { v: 'ARPUND', d: 'BASTAR' },
    { v: 'HANDAPAL', d: 'KONDAGAON' },
    { v: 'HARRA KODER', d: 'BASTAR' },
    { v: 'HIRRAM', d: 'BASTAR' },
    { v: 'HITAMETA', d: 'DANTEWADA' },
    { v: 'HITAMETA', d: 'BASTAR' },
    { v: 'ITULKUDUM', d: 'BIJAPUR' },
    { v: 'KAKNAR', d: 'BASTAR', id: '449171' },
    { v: 'KAREKOT', d: 'BASTAR' },
    { v: 'KHADPADI', d: 'KONDAGAON' },
    { v: 'KODENAR', d: 'BASTAR', id: '449168' },
    { v: 'KORALI', d: 'BASTAR' },
    { v: 'KOYAM', d: 'BIJAPUR' },
    { v: 'KUDHUR', d: 'KONDAGAON' },
    { v: 'MAHIMA', d: 'BASTAR' },
    { v: 'MALEWAHI', d: 'BASTAR' },
    { v: 'MARDUM', d: 'BASTAR' },
    { v: 'MATNAR', d: 'BASTAR', id: '449191' },
    { v: 'MUCHNAR', d: 'DANTEWADA' },
    { v: 'MUNJER', d: 'BASTAR' },
    { v: 'NEURNAR', d: 'DANTEWADA' },
    { v: 'POHNAR', d: 'BASTAR' },
    { v: 'PALAM', d: 'BASTAR' },
    { v: 'PICHI KODER', d: 'BASTAR' },
    { v: 'PUNGARPAL', d: 'KONDAGAON' },
    { v: 'PUSPAL CHI', d: 'BASTAR' },
    { v: 'PUSPAL A', d: 'BASTAR' },
    { v: 'RAIGONDI', d: 'BASTAR' },
    { v: 'RAKASMETA', d: 'KONDAGAON' },
    { v: 'SADAR', d: 'BIJAPUR' },
    { v: 'SATASHPUR', d: 'BASTAR' },
    { v: 'TUMASKODAR', d: 'BASTAR' },
    { v: 'TUMDIWAL', d: 'KONDAGAON' },
    { v: 'UDENAR', d: 'DANTEWADA' }
];

const dpr = window.devicePixelRatio || 1;
const isRetina = dpr > 1;
