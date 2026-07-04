/* ── Clan Gods & Villages Data Layer ── */
let CLAN_GODS_DATA = null;
const CG_CENTROIDS = {};  // village_name → {centroid: [lat,lng], code, approximate}
const CG_VILLAGE_ENTRIES = {};  // village_name_lower → [entry, entry, ...]
const CG_PEN_LOOKUP = {};
const CG_CLAN_LOOKUP = {};
const CG_PEN_VILLAGE = {}; // penId → {name, id}
const CG_CODE_MAP = {};    // v_code → [entry, entry, ...] (multi-valued for cross-phratry)
const CG_CODE_CENTROID = {}; // v_code → [lat, lng]
const CG_BHUVAN_NAME = {};  // v_code → Bhuvan v_name
const CG_RELATION_LINES = L.layerGroup([]);
const CG_PEN_MARKER_POS = {}; // penId → [lat, lng] (actual offset position)
const CG_APPROXIMATE = new Set();
const ACTIVE_PHRATRIES = new Set(['kuhrami_kadiari', 'markami', 'madvi', 'kawasi', 'sodi']);

const CG_COLORS = {
    kuhrami_kadiari: { fill: '#cc2936', border: '#8b0000', label: 'Kuhrami / Kadiari' },
    markami:        { fill: '#2a6f97', border: '#003f5c', label: 'Markami' },
    madvi:          { fill: '#2d6a4f', border: '#1b4332', label: 'Madvi' },
    kawasi:         { fill: '#e76f00', border: '#9a4d00', label: 'Kawasi' },
    sodi:           { fill: '#9b59b6', border: '#6c3483', label: 'Sodi' },
};
const CG_GRAY = { fill: '#999', border: '#666' };

function cgStyle(properties) {
    const vc = properties.v_code;
    if (!vc) return { fill: false, stroke: false, opacity: 0 };
    const entries = CG_CODE_MAP[vc];
    if (!entries || entries.length === 0) return { fill: false, stroke: false, opacity: 0 };

    const activePhratries = [...new Set(
        entries.filter(e => ACTIVE_PHRATRIES.has(e.phratry)).map(e => e.phratry)
    )];
    if (activePhratries.length === 0) return { fill: false, stroke: false, opacity: 0 };
    if (activePhratries.length === 1) {
        const c = CG_COLORS[activePhratries[0]] || CG_GRAY;
        return { fillColor: c.fill, fill: true, fillOpacity: 0.45, stroke: true, color: c.border, weight: 0.15, nonScalingStroke: true };
    }
    return { fillColor: CG_GRAY.fill, fill: true, fillOpacity: 0.45, stroke: true, color: CG_GRAY.border, weight: 0.15, nonScalingStroke: true };
}

let clanGodsLayer = null;
let penCircleMarkers = null;
let villageLabelLayer = null;
const CG_LABEL_ENTRIES = [];
let penLabelLayer = null;
let leaderLineLayer = null;

function coordForVillage(villageName, villageId) {
    if (villageId && CG_CODE_CENTROID[villageId]) return CG_CODE_CENTROID[villageId];
    const k = Object.keys(CG_CENTROIDS).find(key =>
        key.toLowerCase() === villageName.trim().toLowerCase()
    );
    const entry = k ? CG_CENTROIDS[k] : null;
    return entry ? entry.centroid : null;
}

function buildPenPopup(villageName, entries) {
    const phratriesPresent = [...new Set(entries.map(e => e.phratry))];
    const rows = [];
    // Add Bhuvan village name as first row, if different from title
    const bhuvanName = entries.find(e => e.bhuvanName)?.bhuvanName;
    if (bhuvanName) {
        rows.push(['Bhuvan Village', bhuvanName]);
    }
    for (const e of entries) {
        const c = CG_COLORS[e.phratry] || { label: '?' };
        rows.push(
            [`Pen (${c.label})`, e.penName || (e.mainPenId ? '?' : '—')],
            ['Clan', e.clanName || '—'],
        );
    }
    if (CG_APPROXIMATE.has(villageName)) rows.push(['Location', 'Approx. location']);

    const pen = entries[0]?.penObj || null;
    if (pen) {
        // Show all associated villages if multiple
        const vs = pen.villages || [];
        if (vs.length > 1) rows.push(['Villages', vs.join(', ')]);
        if (pen.palli?.length) rows.push(['Palli (Offerings from)', pen.palli.join(', ')]);
        if (pen.notes) rows.push(['Notes', pen.notes]);
    }
    // Subordinate pens (merge from all entries)
    const allSubs = [...new Set(entries.flatMap(e => e.subPens || []))];
    if (allSubs.length) rows.push(['Subordinate Pens', allSubs.join(', ')]);
    // Relations in this village (merge all entries)
    const allRels = [...new Set(entries.flatMap(e => e.rels || []))];
    if (allRels.length) rows.push(['Relations (in this village)', allRels.join('<br>')]);

    const showBtn = entries[0]?.penId
        ? `<button class="zoom-btn" onclick="showRelationsForPen('${encodeURIComponent(entries[0].penId)}', this)">Show Relations</button>`
        : '';

    return buildPopup(entries[0].penName || villageName, rows, 'clan_gods')
        + (showBtn ? `<div style="margin-top:6px;">${showBtn}</div>` : '');
}

function penInVillage(pen, villageName, villageId) {
    const vids = pen.village_ids || [];
    const vs = pen.villages || [];
    if (villageId && vids.includes(villageId)) return true;
    if (villageName && vs.some(n => n.toLowerCase() === villageName.toLowerCase())) return true;
    // Fallback to legacy single fields
    if (villageId && pen.gudi_village_id === villageId) return true;
    if (villageName && pen.gudi_village && pen.gudi_village.toLowerCase() === villageName.toLowerCase()) return true;
    return false;
}

function buildPenRelations(pen, villageName, villageId) {
    if (!pen || !CLAN_GODS_DATA) return [];
    const rels = [];
    for (const r of CLAN_GODS_DATA.relationships) {
        const fp = CG_PEN_LOOKUP[r.from_pen_id];
        const tp = CG_PEN_LOOKUP[r.to_pen_id];
        if (!fp || !tp) continue;
        if (fp.id === pen.id) {
            if (penInVillage(tp, villageName, villageId))
                rels.push(`${fp.name} ${r.type} ${tp.name}`);
        } else if (tp.id === pen.id) {
            if (penInVillage(fp, villageName, villageId))
                rels.push(`${fp.name} ${r.type} ${tp.name}`);
        }
    }
    return rels;
}

const RELATION_STYLES = {
    spouse: { color: '#e74c3c', weight: 2.5, dashArray: null, label: 'Spouse' },
    sibling: { color: '#3498db', weight: 2.5, dashArray: '5, 5', label: 'Sibling' },
    parent: { color: '#2ecc71', weight: 2.5, dashArray: '2, 4', label: 'Parent' },
    child: { color: '#f39c12', weight: 2.5, dashArray: '2, 4', label: 'Child' },
    ghar_jamai: { color: '#9b59b6', weight: 2.5, dashArray: '3, 3', label: 'Ghar Jamai' },
};

function resolvePenRelations(penId) {
    if (!CLAN_GODS_DATA || !penId) return [];
    const results = [];
    const pen = CG_PEN_LOOKUP[penId];
    if (!pen) return [];

    for (const r of CLAN_GODS_DATA.relationships) {
        const otherPenId = r.from_pen_id === penId ? r.to_pen_id :
                           r.to_pen_id === penId ? r.from_pen_id : null;
        if (!otherPenId) continue;
        const otherPen = CG_PEN_LOOKUP[otherPenId];
        if (!otherPen) continue;
        const otherVillages = CG_PEN_VILLAGE[otherPenId];
        if (!otherVillages || otherVillages.length === 0) continue;
        // Use the primary (first) village for the other pen
        const primaryVillage = otherVillages[0];
        // Skip if the other pen shares any village with this pen
        const thisVillages = CG_PEN_VILLAGE[penId] || [];
        const sharesVillage = thisVillages.some(tv =>
            primaryVillage.id ? tv.id === primaryVillage.id : tv.name.toLowerCase() === primaryVillage.name.toLowerCase()
        );
        if (sharesVillage) continue;
        // Use pen marker position (offset circle) if available, fall back to village centroid
        const markerKey = primaryVillage.name.toLowerCase() + ':' + otherPenId;
        const coord = CG_PEN_MARKER_POS[markerKey] || coordForVillage(primaryVillage.name, primaryVillage.id);
        results.push({
            pen: otherPen,
            village: primaryVillage.name,
            coord,
            type: r.type,
            style: RELATION_STYLES[r.type] || RELATION_STYLES.sibling,
            direction: r.from_pen_id === penId ? 'from' : 'to',
        });
    }
    return results;
}

window.showRelationsForPen = function(penIdEncoded, btn) {
    if (btn) btn.textContent = 'Loading…';
    const penId = decodeURIComponent(penIdEncoded);
    const pen = CG_PEN_LOOKUP[penId];
    if (!pen) return;

    // Use pen marker position (offset circle) if available, fall back to village centroid
    const fromCoord = (() => {
        const penVillages = CG_PEN_VILLAGE[penId] || [];
        const primaryVillage = penVillages.length > 0 ? penVillages[0] : null;
        if (primaryVillage) {
            const markerKey = primaryVillage.name.toLowerCase() + ':' + penId;
            if (CG_PEN_MARKER_POS[markerKey]) return CG_PEN_MARKER_POS[markerKey];
        }
        return primaryVillage
            ? coordForVillage(primaryVillage.name, primaryVillage.id)
            : coordForVillage(pen.gudi_village, pen.gudi_village_id);
    })();
    if (!fromCoord) {
        if (btn) btn.textContent = 'No centroid for this village';
        return;
    }

    CG_RELATION_LINES.clearLayers();

    const rels = resolvePenRelations(penId);
    if (!rels.length) {
        if (btn) btn.textContent = 'No cross-village relations';
        return;
    }

    for (const rel of rels) {
        if (!rel.coord) continue;
        const line = L.polyline([fromCoord, rel.coord], {
            pane: 'relationPane',
            className: 'rel-line',
            color: rel.style.color,
            weight: rel.style.weight,
            dashArray: rel.style.dashArray,
            opacity: 0.8,
        }).addTo(CG_RELATION_LINES);

        const mid = [(fromCoord[0] + rel.coord[0]) / 2, (fromCoord[1] + rel.coord[1]) / 2];
        const midPt = map.latLngToContainerPoint(mid);

        const fromPt = map.latLngToContainerPoint(fromCoord);
        const toPt = map.latLngToContainerPoint(rel.coord);
        const angle = Math.atan2(toPt.y - fromPt.y, toPt.x - fromPt.x) * 180 / Math.PI;
        let finalAngle = angle;
        const norm = ((angle % 360) + 360) % 360;
        if (norm > 90 && norm < 270) finalAngle += 180;

        const perpAngle = (finalAngle + 90) * Math.PI / 180;
        const offsetPx = 12;
        const labelPt = L.point(
            midPt.x + Math.cos(perpAngle) * offsetPx,
            midPt.y + Math.sin(perpAngle) * offsetPx
        );
        const labelLatLng = map.containerPointToLatLng(labelPt);

        const labelText = (() => {
            const n = rel.pen.name;
            if (rel.type === 'spouse') return `married to ${n}`;
            if (rel.type === 'sibling') return `sibling of ${n}`;
            if (rel.type === 'parent') return rel.direction === 'from' ? `parent of ${n}` : `has parent ${n}`;
            if (rel.type === 'child') return rel.direction === 'from' ? `has child ${n}` : `child of ${n}`;
            if (rel.type === 'ghar_jamai') return rel.direction === 'from' ? `ghar jamai of ${n}` : `has ghar jamai ${n}`;
            return `${n} (${rel.type})`;
        })();

        L.marker(labelLatLng, {
            pane: 'relationPane',
            icon: L.divIcon({
                className: '',
                html: `<div style="position:absolute;transform:translate(-50%,-50%) rotate(${finalAngle}deg);transform-origin:center"><span style="background:${rel.style.color};color:#fff;padding:2px 6px;border-radius:3px;font-size:10px;white-space:nowrap;display:inline-block">${labelText}</span></div>`,
                iconSize: [0, 0],
                iconAnchor: [0, 0],
            }),
            interactive: false,
        }).addTo(CG_RELATION_LINES);
    }

    if (btn) btn.textContent = 'Hide Relations';
    btn.onclick = () => {
        CG_RELATION_LINES.clearLayers();
        btn.textContent = 'Show Relations';
        btn.onclick = () => showRelationsForPen(penIdEncoded, btn);
    };
};

function rebuildPhratryStyle() {
    if (clanGodsLayer) {
        clanGodsLayer.setVectorTileLayerStyles({ 'bhuvan_villages': cgStyle });
        clanGodsLayer.redraw();
    }
    rebuildCircleMarkers();
    rebuildLabels();
}

function offsetCoord(coord, index, total) {
    if (total <= 1) return coord;
    if (!map || typeof map.latLngToContainerPoint !== 'function' || !map.getZoom) {
        // Fallback to legacy degree-based offsets if map is not fully loaded/ready
        const radius = 0.0045;
        const angle = (index / total) * 2 * Math.PI;
        return [
            coord[0] + Math.cos(angle) * radius,
            coord[1] + Math.sin(angle) * radius,
        ];
    }

    // Dynamic pixel-based offset
    const markerRadius = 7;
    const spacing = 4;
    const pixelRadius = (markerRadius + spacing) * 1.5; // ~16.5px offset circle
    const angle = (index / total) * 2 * Math.PI;
    
    const centerPt = map.latLngToContainerPoint(coord);
    const offsetPt = L.point(
        centerPt.x + Math.cos(angle) * pixelRadius,
        centerPt.y + Math.sin(angle) * pixelRadius
    );
    const res = map.containerPointToLatLng(offsetPt);
    return [res.lat, res.lng];
}

function rebuildCircleMarkers() {
    if (penCircleMarkers) penCircleMarkers.clearLayers();
    if (!penCircleMarkers) penCircleMarkers = L.layerGroup([]);

    // Clear stale marker positions
    for (const pid in CG_PEN_MARKER_POS) delete CG_PEN_MARKER_POS[pid];

    const zoom = (map && typeof map.getZoom === 'function') ? map.getZoom() : 10;

    // At low zoom, populate CG_PEN_MARKER_POS from centroids but skip circles
    if (zoom < 10) {
        CG_RELATION_LINES.clearLayers();
        const seenPens = new Set();
        for (const key in CG_VILLAGE_ENTRIES) {
            for (const entry of CG_VILLAGE_ENTRIES[key]) {
                if (!entry.penId || !ACTIVE_PHRATRIES.has(entry.phratry)) continue;
                if (seenPens.has(entry.penId)) continue;
                seenPens.add(entry.penId);
                const cinfo = CG_CENTROIDS[entry.name];
                if (!cinfo) continue;
                CG_PEN_MARKER_POS[entry.penId] = cinfo.centroid;
            }
        }
        return;
    }

    // Collect all active entries with pens and their centroids
    const markerEntries = [];
    for (const key in CG_VILLAGE_ENTRIES) {
        for (const entry of CG_VILLAGE_ENTRIES[key]) {
            if (!entry.penId || !ACTIVE_PHRATRIES.has(entry.phratry)) continue;
            const cinfo = CG_CENTROIDS[entry.name];
            if (!cinfo) continue;
            markerEntries.push({ entry, coord: cinfo.centroid });
        }
    }

    // Group by coordinate key so same-centroid entries get offsets
    const groups = {};
    for (const me of markerEntries) {
        const ck = me.coord[0].toFixed(6) + ',' + me.coord[1].toFixed(6);
        if (!groups[ck]) groups[ck] = [];
        groups[ck].push(me);
    }

    for (const ck in groups) {
        const g = groups[ck];
        const coord = g[0].coord;
        g.sort((a, b) => (a.entry.penId || '').localeCompare(b.entry.penId || ''));
        for (let i = 0; i < g.length; i++) {
            const { entry } = g[i];
            const pt = offsetCoord(coord, i, g.length);
            const c = CG_COLORS[entry.phratry] || CG_GRAY;
            const marker = L.circleMarker(pt, {
                radius: entry.isSub ? 4.5 : 7,
                fillColor: c.fill,
                fillOpacity: 0.9,
                stroke: true,
                color: '#fff',
                weight: entry.isSub ? 1.5 : 2,
            });
            marker.bindPopup(buildPenPopup(entry.name, [entry]));
            penCircleMarkers.addLayer(marker);

            // Store marker position for relation arrow targeting
            if (entry.penId) {
                const key = entry.name.toLowerCase() + ':' + entry.penId;
                CG_PEN_MARKER_POS[key] = pt;
            }
        }
    }
}

function rebuildLabels() {
    CG_LABEL_ENTRIES.length = 0;
    penLabelLayer = penLabelLayer || L.layerGroup([]);
    leaderLineLayer = leaderLineLayer || L.layerGroup([]);
    penLabelLayer.clearLayers();
    leaderLineLayer.clearLayers();

    const seenVillage = new Set();
    const zoom = (map && typeof map.getZoom === 'function') ? map.getZoom() : 10;
    const bounds = (map && typeof map.getBounds === 'function') ? map.getBounds().pad(0.05) : null;

    for (const key in CG_VILLAGE_ENTRIES) {
        const active = CG_VILLAGE_ENTRIES[key].filter(e =>
            e.penId && ACTIVE_PHRATRIES.has(e.phratry)
        );
        if (active.length === 0) continue;

        // Add pen labels at all zoom levels
        for (const entry of active) {
            const key = entry.name.toLowerCase() + ':' + entry.penId;
            const pos = CG_PEN_MARKER_POS[key];
            if (!pos) continue;
            if (bounds && !bounds.contains(pos)) continue;
            CG_LABEL_ENTRIES.push({
                text: entry.penName || entry.penId,
                anchor: pos,
                priority: entry.isSub ? 2 : 1, // main pen=1, sub pen=2
                type: entry.isSub ? 'sub_pen' : 'pen',
                phratry: entry.phratry,
            });
        }

        // Village labels only at zoom >= 10
        if (zoom >= 10) {
            const first = active[0];
            const cinfo = CG_CENTROIDS[first.name];
            if (!cinfo) continue;
            if (bounds && !bounds.contains(cinfo.centroid)) continue;
            const ck = cinfo.centroid[0].toFixed(6) + ',' + cinfo.centroid[1].toFixed(6);
            if (seenVillage.has(ck)) continue;
            seenVillage.add(ck);
            CG_LABEL_ENTRIES.push({
                text: first.bhuvanName || first.name,
                anchor: cinfo.centroid,
                priority: 3, // village=3 (lowest priority, placed last)
                type: 'village',
                name: first.name,
            });
        }
    }

    CG_LABEL_ENTRIES.sort((a, b) => a.priority - b.priority);
    placeAllLabels();
}

function createLabel(entry, containerPt, labelW, labelH) {
    const latlng = map.containerPointToLatLng(containerPt);

    const makeMarker = (latlng, pane, style, w, h) => {
        const m = L.marker(latlng, {
            pane,
            draggable: false,
            interactive: false,
            icon: L.divIcon({
                className: '',
                html: `<div style="${style}; text-align: center; width: ${w}px; height: ${h}px; line-height: ${h}px;">${entry.text}</div>`,
                iconSize: [w, h],
                iconAnchor: [w / 2, h / 2],
            }),
        }).addTo(penLabelLayer);

        return m;
    };

    if (entry.type === 'village') {
        const style = 'color:#4a3520;font-size:11px;font-weight:600;white-space:nowrap;text-shadow:-1px -1px 0 #FEFBE3,1px -1px 0 #FEFBE3,-1px 1px 0 #FEFBE3,1px 1px 0 #FEFBE3';
        makeMarker(latlng, 'villageLabelPane', style, labelW, labelH);
    } else {
        const c = CG_COLORS[entry.phratry] || CG_GRAY;
        const st = entry.type === 'sub_pen'
            ? `color:#fff;text-shadow:0 0 3px ${c.border},0 0 3px ${c.border};font-size:9px;font-weight:600;white-space:nowrap`
            : `color:#fff;text-shadow:0 0 3px ${c.border},0 0 3px ${c.border};font-size:10px;font-weight:700;white-space:nowrap`;
        const m = makeMarker(latlng, 'penLabelPane', st, labelW, labelH);
        const pt = map.latLngToContainerPoint(latlng);
        const anchorPt = map.latLngToContainerPoint(entry.anchor);
        const dist = Math.sqrt(
            Math.pow(pt.x - anchorPt.x, 2) + Math.pow(pt.y - anchorPt.y, 2)
        );
        if (dist > 24) {
            updateLeaderLine(entry, latlng, m);
        }
    }
}

function updateLeaderLine(entry, labelLatLng, marker) {
    // Remove existing leader line if any
    if (marker._leaderLine) {
        leaderLineLayer.removeLayer(marker._leaderLine);
    }
    const pt = map.latLngToContainerPoint(labelLatLng);
    const anchorPt = map.latLngToContainerPoint(entry.anchor);
    const dist = Math.sqrt(
        Math.pow(pt.x - anchorPt.x, 2) + Math.pow(pt.y - anchorPt.y, 2)
    );
    if (dist > 24) {
        marker._leaderLine = L.polyline([entry.anchor, labelLatLng], {
            pane: 'leaderLinePane',
            color: '#999',
            weight: 0.5,
            opacity: 0.7,
            interactive: false,
        }).addTo(leaderLineLayer);
    }
}

function placeAllLabels() {
    penLabelLayer.clearLayers();
    leaderLineLayer.clearLayers();

    let tree;
    try {
        tree = new RBush();
    } catch (_) {
        placeLabelsFallback();
        return;
    }

    // Seed marker obstacles in rbush (markers are static, labels must avoid them)
    const markerPts = [];
    for (const penId in CG_PEN_MARKER_POS) {
        const pt = map.latLngToContainerPoint(CG_PEN_MARKER_POS[penId]);
        markerPts.push(pt);
        tree.insert({
            minX: pt.x - 10, minY: pt.y - 10,
            maxX: pt.x + 10, maxY: pt.y + 10,
        });
    }

    // Build simulation nodes
    const nodes = [];
    for (const entry of CG_LABEL_ENTRIES) {
        const anchorPt = map.latLngToContainerPoint(entry.anchor);
        const w = Math.max(entry.text.length * 8 + 12, 50);
        const h = 18;

        const x = anchorPt.x + (Math.random() - 0.5) * 6;
        const y = anchorPt.y - h / 2 - 8 + (Math.random() - 0.5) * 6;

        nodes.push({ entry, x, y, anchorX: anchorPt.x, anchorY: anchorPt.y, w, h });
    }

    // Force simulation
    const ITER = 120;
    for (let iter = 0; iter < ITER; iter++) {
        const alpha = 1 - iter / ITER;

        for (const a of nodes) {
            let fx = 0, fy = 0;

            // Repulsion from markers (labels must not cover circle markers)
            for (const m of markerPts) {
                const dx = a.x - m.x;
                const dy = a.y - m.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const threat = a.w / 2 + 20;
                if (dist < threat) {
                    const force = (threat - dist) / threat * 6;
                    fx += (dx / dist) * force;
                    fy += (dy / dist) * force;
                }
            }

            // Repulsion from nearby labels (maintain 16px minimum separation)
            for (const b of nodes) {
                if (a === b) continue;
                const gapX = Math.abs(a.x - b.x) - (a.w / 2 + b.w / 2);
                const gapY = Math.abs(a.y - b.y) - (a.h / 2 + b.h / 2);
                const repelRange = 16;
                if (gapX < repelRange && gapY < repelRange) {
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const closeness = 1 - Math.min(Math.max(gapX, gapY) / repelRange, 1);
                    const force = closeness * 10;
                    fx += (dx / dist) * force;
                    fy += (dy / dist) * force;
                }
            }

            // Attraction toward anchor (spring force, decays with alpha)
            const adx = a.anchorX - a.x;
            const ady = a.anchorY - a.y;
            const adist = Math.sqrt(adx * adx + ady * ady) || 1;
            const spring = adist * 0.06 * alpha;
            fx += (adx / adist) * spring;
            fy += (ady / adist) * spring;

            a.x += fx;
            a.y += fy;

            // Clamp to viewport
            const sz = map.getSize();
            a.x = Math.max(a.w / 2 + 2, Math.min(sz.x - a.w / 2 - 2, a.x));
            a.y = Math.max(a.h / 2 + 2, Math.min(sz.y - a.h / 2 - 2, a.y));
        }
    }

    // Render final positions
    for (const node of nodes) {
        createLabel(node.entry, L.point(node.x, node.y), node.w, node.h);
    }
}

function placeLabelsFallback() {
    for (const entry of CG_LABEL_ENTRIES) {
        const anchorPt = map.latLngToContainerPoint(entry.anchor);
        const labelW = Math.max(entry.text.length * 8 + 12, 50);
        const labelH = 18;

        const dx = entry.type === 'village' ? 18 : 0;
        const dy = entry.type === 'village' ? 0 : (entry.type === 'sub_pen' ? 18 : 20);
        const pt = L.point(anchorPt.x + dx, anchorPt.y + dy);

        createLabel(entry, pt, labelW, labelH);
    }
}



Promise.all([
    fetch('data/gods_and_goddesses/clan_gods.json').then(r => r.json()),
    fetch('data/gods_and_goddesses/village_centroids.json').then(r => r.json()).catch(() => ({})),
    fetch('data/gods_and_goddesses/vcode_bhuvan_name.json').then(r => r.json()).catch(() => ({})),
]).then(([godsData, centroidsData, bhuvanNameData]) => {
    CLAN_GODS_DATA = godsData;
    for (const p of godsData.pens) CG_PEN_LOOKUP[p.id] = p;
    for (const c of godsData.clans) CG_CLAN_LOOKUP[c.id] = c;

    // Build v_code → centroid lookup
    for (const [name, info] of Object.entries(centroidsData)) {
        if (info.code) {
            CG_CODE_CENTROID[info.code] = info.centroid;
        }
    }

    // Build v_code → Bhuvan name lookup
    for (const [vc, bhName] of Object.entries(bhuvanNameData)) {
        CG_BHUVAN_NAME[vc] = bhName;
    }

    // Populate lookups — allow duplicate village names
    for (const v of godsData.villages) {
        const key = v.name.trim().toLowerCase();
        const pen = v.main_pen_id ? CG_PEN_LOOKUP[v.main_pen_id] : null;
        const clan = CG_CLAN_LOOKUP[v.clan_id] || null;
        const rels = [];
        const villageId = v.id || null;
        if (pen) {
            for (const r of godsData.relationships) {
                const fp = CG_PEN_LOOKUP[r.from_pen_id];
                const tp = CG_PEN_LOOKUP[r.to_pen_id];
                if (fp && tp && penInVillage(fp, v.name, villageId) && penInVillage(tp, v.name, villageId))
                    rels.push(`${fp.name} ${r.type} ${tp.name}`);
            }
            if (!CG_PEN_VILLAGE[pen.id]) CG_PEN_VILLAGE[pen.id] = [];
            CG_PEN_VILLAGE[pen.id].push({ name: v.name, id: villageId });
        }
        for (const subId of v.subordinate_pen_ids) {
            if (!CG_PEN_VILLAGE[subId]) CG_PEN_VILLAGE[subId] = [];
            CG_PEN_VILLAGE[subId].push({ name: v.name, id: villageId });
        }

        const entry = {
            name: v.name, phratry: v.phratry_id,
            clanName: clan ? clan.name : v.clan_id,
            penId: v.main_pen_id, penName: pen ? pen.name : null,
            mainPenId: v.main_pen_id,
            id: villageId,
            bhuvanName: CG_BHUVAN_NAME[villageId] || null,
            subPens: v.subordinate_pen_ids.map(id => CG_PEN_LOOKUP[id]?.name || id),
            rels,
            penObj: pen,
            isSub: false,
        };

        if (!CG_VILLAGE_ENTRIES[key]) CG_VILLAGE_ENTRIES[key] = [];
        CG_VILLAGE_ENTRIES[key].push(entry);

        // Create entries for subordinate pens so they get their own circle markers
        const subEntries = [];
        for (const subId of v.subordinate_pen_ids) {
            const subPen = CG_PEN_LOOKUP[subId];
            const subEntry = {
                name: v.name, phratry: v.phratry_id,
                clanName: clan ? clan.name : v.clan_id,
                penId: subId, penName: subPen ? subPen.name : subId,
                mainPenId: v.main_pen_id,
                id: villageId,
                bhuvanName: CG_BHUVAN_NAME[villageId] || null,
                subPens: [],
                rels,
                penObj: subPen || null,
                isSub: true,
            };
            CG_VILLAGE_ENTRIES[key].push(subEntry);
            subEntries.push(subEntry);
        }

        // Track centroid info
        const cinfo = centroidsData[v.name];
        if (cinfo) {
            CG_CENTROIDS[v.name] = cinfo;
            if (cinfo.approximate) CG_APPROXIMATE.add(v.name);
            // Build v_code → entries lookup for PBF overlay (all entries, even approx)
            if (cinfo.code) {
                if (!CG_CODE_MAP[cinfo.code]) CG_CODE_MAP[cinfo.code] = [];
                CG_CODE_MAP[cinfo.code].push(entry);
                for (const se of subEntries) {
                    CG_CODE_MAP[cinfo.code].push(se);
                }
            }
        }
    }

    // Create PBF overlay
    clanGodsLayer = L.vectorGrid.protobuf(
        'https://indianopenmaps.com/not-so-open/villages/bhuvan/{z}/{x}/{y}.pbf',
        {
            maxNativeZoom: 11, maxZoom: 22,
            rendererFactory: L.svg.tile,
            vectorTileLayerStyles: { 'bhuvan_villages': cgStyle },
            interactive: true, detectRetina: true,
            getFeatureId: f => f.properties?.village_id || f.properties?.v_name || Math.random()
        }
    );

    // Village-level click handler
    clanGodsLayer.on('click', e => {
        const p = e.layer?.properties || e.propagatedFrom?.properties || {};
        const vName = (p.v_name || '').trim();
        const vc = p.v_code;
        const entries = vc ? (CG_CODE_MAP[vc] || []) : [];
        if (entries.length === 0) {
            L.popup({ closeButton: true }).setLatLng(e.latlng)
                .setContent(buildPopup(vName, [['Village', vName]], 'clan_gods')).openOn(map);
            return;
        }

        const active = entries.filter(en => ACTIVE_PHRATRIES.has(en.phratry));
        const display = active.length > 0 ? active : entries;
        const uniquePhratries = [...new Set(display.map(en => en.phratry))];

        const rows = [['Clan Gods Name', display[0].name]];
        for (const pId of uniquePhratries) {
            const c = CG_COLORS[pId] || { label: '?' };
            const en = display.find(en => en.phratry === pId);
            rows.push([`${c.label}`, `Clan: ${en.clanName}, Pen: ${en.penName || '—'}`]);
        }
        if (CG_APPROXIMATE.has(display[0].name)) rows.push(['Location', 'Approximate — not in Bhuvan census']);

        L.popup({ closeButton: true }).setLatLng(e.latlng)
            .setContent(buildPopup(vName, rows, 'clan_gods')).openOn(map);
    });

    // Create custom panes for z-ordering: leader lines → pen label bg → village label bg → pen markers → relation lines
    map.createPane('leaderLinePane');
    map.getPane('leaderLinePane').style.zIndex = 440;
    map.createPane('penLabelPane');
    map.getPane('penLabelPane').style.zIndex = 460;
    map.createPane('villageLabelPane');
    map.getPane('villageLabelPane').style.zIndex = 450;
    map.createPane('relationPane');
    map.getPane('relationPane').style.zIndex = 650;

    // Initial build of markers and labels
    rebuildCircleMarkers();
    rebuildLabels();

    // Rebuild markers and labels on pan/zoom only if the layer is currently active
    map.on('moveend', () => {
        if (typeof layerMap !== 'undefined' && layerMap.clan_gods && map.hasLayer(layerMap.clan_gods)) {
            rebuildCircleMarkers();
            rebuildLabels();
        }
    });

    // Register layer
    if (typeof layerMap !== 'undefined') {
        const clanGodsGroup = L.layerGroup([clanGodsLayer, penCircleMarkers, penLabelLayer, leaderLineLayer, CG_RELATION_LINES]);
        layerMap.clan_gods = clanGodsGroup;

        // Sync initial visibility based on config activeState
        if (activeState.clan_gods) {
            if (!map.hasLayer(clanGodsGroup)) map.addLayer(clanGodsGroup);
        } else {
            if (map.hasLayer(clanGodsGroup)) map.removeLayer(clanGodsGroup);
        }



        // Trigger updates when the layer is toggled visible
        map.on('layeradd', (e) => {
            if (e.layer === clanGodsGroup) {
                rebuildCircleMarkers();
                rebuildLabels();
            }
        });

        if (typeof initLayersFromConfig === 'function') initLayersFromConfig();
    }
});
