/* ── Popup builder with layer badge ── */
function buildPopup(title, rows, layerKey) {
    const meta = layerKey ? LAYER_META[layerKey] : null;

    const badge = meta ? `
        <div class="popup-layer-badge" style="
            background:${meta.color};
            border:1px solid ${meta.border};
            color:${meta.text};
        ">
            <span class="badge-dot" style="background:${meta.border};"></span>
            ${meta.label}
        </div>` : '';

    const trs = rows
        .filter(([, v]) => v !== null && v !== undefined && v !== '' && v !== 'NA' && v !== 'NaN')
        .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
        .join('');

    return `<div class="popup-inner">
        ${badge}
        <div class="popup-title">${title}</div>
        <table>${trs}</table>
    </div>`;
}

function parseKmlDescription(htmlText) {
    const obj = {};

    const tableMatch = htmlText.match(/<table[^>]*>([\s\S]+)<\/table>/);
    if (!tableMatch) return obj;

    const table = tableMatch[1];
    const re = /<td[^>]*>([^<]+)<\/td>\s*<td[^>]*>([^<]*)<\/td>/g;
    let m;
    while ((m = re.exec(table)) !== null) {
        const key = m[1].trim();
        const value = m[2].trim();
        obj[key] = value;
    }

    return obj;
}

function kmlPopup(p, type) {
    if (type === 'main') {
        return buildPopup(p.Facility || 'Dep-04 ML Area', [
            ['Compartment', p.Compartmen],
            ['Old Compartment', p.Old_Compar],
            ['Area (ha)', p.Area_1],
            ['Forest Type', p.ForestType],
            ['Division', p.Division],
            ['Range', p.Range],
            ['RF', p.RF]
        ], 'dep4');
    }
    if (type === 'comp') {
        return buildPopup(p.Facility || 'Overburden/Waste dumping', [
            ['Area (ha)', p.AREA],
            ['New Compartment', p.New_compartment_no],
            ['Old Compartment', p.Old_compartment_no],
            ['Forest Type', p.Forest_Type],
            ['Division', p.Division],
            ['Range', p.Range],
            ['RF', p.RF],
            ['Village', p.Village],
            ['Khasra No.', p.Khasra_no],
            ['Land Type', p.Land_Type]
        ], 'dep4c');
    }
    if (type === 'screenbenplant') {
        return buildPopup(p.Facility || p.Land_breakup || 'Screening Plant', [
            ['Compartment', p.Compartmen],
            ['Old Compartment', p.Old_Compar],
            ['Area', p.AREA],
            ['Forest Type', p.Forest_Type],
            ['Division', p.Division],
            ['Range', p.Range],
            ['RF', p.RF],
            ['Village', p.Village],
            ['Khasra No.', p.Khasra_No],
            ['Land Type', p.Land_type],
            ['Land Breakup', p.Land_breakup]
        ], 'dep4screenbenplant');
    }

    if (type === "bacheli") {
        return buildPopup(p.name || "Bacheli Airport", [
            ["Type", p.description || "Airport"],
            ["Status", p.Status || "Proposed"],
        ], 'bacheli');
    }

    if (type === "forest") {
        return buildPopup(p.CIRCLE_NAM || "Forest Compartment", [
            ["Cluster / Circle", p.Circle_Nam],
            ["Division", p.Division_N],
            ["PA FDC Name", p.PA_FDC_Nam],
            ["Range Name", p.Range_Name],
            ["Beat Name", p.Beat_Name],
            ["Legal Status", p.Legal_Stat],
            ["Old Compartment", p.Old_Compt],
            ["New Compartment", p.New_Compt],
            ["Area (ha)", p.AREA],
            ["Working Circle", p.Working_Ci],
            ["Felling Series", p.Felling_Se],
            ["JFMC", p.JFMC],
            ["Others", p.OTHERS]
        ]);
    }
}

function zoomToLayer(e, layer) {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!layer || !layer.getBounds) return;
    const b = layer.getBounds();
    if (b && b.isValid && b.isValid()) map.fitBounds(b, { padding: [40, 40] });
}
