"""Build structured village_centroids.json from corrected GeoJSON.

Matches clan gods villages to Bhuvan tile features by extracting the
base name (first word/part before /, comma, or parenthesis), then
finding tile features whose name starts with or equals the base name.
For ambiguous names, prefers Dakshin Bastar Dantewada district.

Usage:
    python3 scripts/build_village_centroids.py
"""
import json
import re

CLAN_GODS_PATH = 'data/gods_and_goddesses/clan_gods.json'
GEOJSON_PATH = 'data/bhuvan_villages_merged.geojson'
OUT_PATH = 'data/gods_and_goddesses/village_centroids.json'

PREFERRED_DISTRICTS = ['Dakshin Bastar Dantewada', 'Dantewada', 'Bijapur', 'Bastar', 'Sukma', 'Kondagaon']


def compute_polygon_centroid(geom):
    if geom['type'] == 'Polygon':
        ring = geom['coordinates'][0]
    elif geom['type'] == 'MultiPolygon':
        ring = geom['coordinates'][0][0]

    n = len(ring)
    if n < 3:
        lngs = [c[0] for c in ring]
        lats = [c[1] for c in ring]
        return [round(sum(lats) / len(lats), 6), round(sum(lngs) / len(lngs), 6)]

    area = 0.0
    cx = 0.0
    cy = 0.0

    for i in range(n - 1):
        x0, y0 = ring[i][0], ring[i][1]
        x1, y1 = ring[i+1][0], ring[i+1][1]
        factor = (x0 * y1 - x1 * y0)
        area += factor
        cx += (x0 + x1) * factor
        cy += (y0 + y1) * factor

    if ring[0] != ring[-1]:
        x0, y0 = ring[-1][0], ring[-1][1]
        x1, y1 = ring[0][0], ring[0][1]
        factor = (x0 * y1 - x1 * y0)
        area += factor
        cx += (x0 + x1) * factor
        cy += (y0 + y1) * factor

    area *= 0.5
    if abs(area) < 1e-10:
        lngs = [c[0] for c in ring]
        lats = [c[1] for c in ring]
        return [round(sum(lats) / len(lats), 6), round(sum(lngs) / len(lngs), 6)]

    cx = cx / (6.0 * area)
    cy = cy / (6.0 * area)

    return [round(cy, 6), round(cx, 6)]


def extract_base_names(name):
    """Extract candidate base names from a clan gods village name.

    Returns a list of base names to try, in priority order.
    E.g. "Daler (near Marh)" → ["Daler"]
         "Omalwar/Samalwar" → ["Omalwar", "Samalwar"]
         "Kunjampara, near Ganjenar" → ["Kunjampara"]
         "Pendvela, Alnar" → ["Pendvela", "Alnar"]
         "Kamalnar? Kamalur" → ["Kamalnar", "Kamalur"]
         "Gumiyapal (Guyempad)" → ["Gumiyapal", "Guyempad"]
    """
    n = name.strip()
    # Remove parenthetical qualifiers
    n = re.sub(r'\([^)]*\)', '', n)
    # Split on /, comma, or "? " (with space after ?)
    parts = re.split(r'[/,?;]', n)
    bases = []
    for p in parts:
        p = p.strip()
        if not p:
            continue
        # Remove " near X" suffixes
        p = re.sub(r'\s+near\s+.*', '', p).strip()
        # Remove leading/trailing punctuation
        p = p.strip(' ?;.,')
        # Take first 1-2 words
        words = p.split()[:2]
        if words:
            candidate = ' '.join(words)
            if len(candidate) >= 3:  # minimum 3 chars
                bases.append(candidate)
    return bases


def find_features_by_prefix(prefix, name_to_features):
    """Find tile features whose name equals the prefix, or starts with prefix at a word boundary."""
    prefix_lower = prefix.lower()
    exact = []
    prefix_match = []
    for tile_name, feats in name_to_features.items():
        tn_lower = tile_name.lower()
        if tn_lower == prefix_lower:
            exact.extend(feats)
        elif tn_lower.startswith(prefix_lower + ' '):
            prefix_match.extend(feats)
        elif tn_lower.startswith(prefix_lower + '('):
            prefix_match.extend(feats)
    # Prefer exact matches
    results = exact if exact else prefix_match
    return results


def pick_best_feature(feats):
    """Pick best feature, preferring Dantewada district."""
    if not feats:
        return None
    if len(feats) == 1:
        return feats[0]
    for district in PREFERRED_DISTRICTS:
        for feat in feats:
            if feat['properties'].get('d_name', '') == district:
                return feat
    return feats[0]


def main():
    # Manual overrides for known name mismatches between clan gods and tile data
    # format: {clan_gods_name: tile_name}
    NAME_OVERRIDES = {
        'Itawar': 'Hitawar',
        'Pharaspal': 'Faraspal',
        'Kesapur': 'Keshapur',
        'Katural, Pumbad (near Gangalur)': 'Katur',
        'Kamalnar? Kamalur': 'Kamaloor',
        'Manganar': 'Mangalnar',
        'Rekavaya': 'Rekavaya',
        'Vechapal': 'Vechapal',
        'Vengpal (Vengur)': 'Vengpal',
        'Vengur': 'Vengur',
        'Benpal/Bayampal': 'Bengpal',
    }

    with open(CLAN_GODS_PATH) as f:
        clan_gods = json.load(f)

    with open(GEOJSON_PATH) as f:
        fc = json.load(f)['features']

    # Build lookups
    name_to_features = {}
    for feat in fc:
        vn = feat['properties'].get('v_name', '').strip()
        if vn:
            name_to_features.setdefault(vn, []).append(feat)

    # Expand NAME_OVERRIDES to also handle "Benpal/Bayampal" matching "Bengpal" etc.
    # Will handle in the match loop below.

    result = {}
    matched_real = 0
    matched_approx = 0
    missing = 0

    for v in clan_gods['villages']:
        vn = v['name']

        best_feat = None
        tile_name_used = None
        is_unique = False

        # 1. Check manual overrides
        override_tile = NAME_OVERRIDES.get(vn)
        if override_tile:
            feats = name_to_features.get(override_tile, [])
            if feats:
                best_feat = pick_best_feature(feats)
                tile_name_used = best_feat['properties']['v_name']
                is_unique = len(feats) == 1

        # 2. If override didn't match, try automatic matching
        if not best_feat:
            base_names = extract_base_names(vn)

            # Try each base name in order
            for base in base_names:
                feats = find_features_by_prefix(base, name_to_features)
                if not feats:
                    continue

                # Deduplicate by v_code
                seen = set()
                unique_feats = []
                for f in feats:
                    vc = f['properties']['v_code']
                    if vc not in seen:
                        seen.add(vc)
                        unique_feats.append(f)

                if len(unique_feats) == 1:
                    best_feat = unique_feats[0]
                    tile_name_used = best_feat['properties']['v_name']
                    is_unique = True
                    break
                elif len(unique_feats) > 1:
                    best_feat = pick_best_feature(unique_feats)
                    tile_name_used = best_feat['properties']['v_name']
                    is_unique = False
                    break

        if best_feat:
            props = best_feat['properties']
            centroid = compute_polygon_centroid(best_feat['geometry'])
            v_code = props['v_code']

            if is_unique:
                result[vn] = {
                    'centroid': centroid,
                    'code': v_code,
                    'approximate': False,
                }
                matched_real += 1
            else:
                result[vn] = {
                    'centroid': centroid,
                    'code': v_code,
                    'approximate': True,
                }
                matched_approx += 1
        else:
            result[vn] = {
                'centroid': [19.0, 81.35],
                'code': None,
                'approximate': True,
            }
            missing += 1

    with open(OUT_PATH, 'w') as f:
        json.dump(result, f, indent=2)

    print(f"Wrote {OUT_PATH}")
    print(f"  Matched (real v_code): {matched_real}")
    print(f"  Matched (approx/ambiguous): {matched_approx}")
    print(f"  No tile match: {missing}")
    print(f"  Total: {len(result)}")

    if matched_approx:
        print()
        print("Ambiguous matches (need review):")
        for v in clan_gods['villages']:
            vn = v['name']
            base_names = extract_base_names(vn)
            best_feat = None
            for base in base_names:
                feats = find_features_by_prefix(base, name_to_features)
                if feats:
                    seen = set()
                    unique_feats = []
                    for f in feats:
                        vc = f['properties']['v_code']
                        if vc not in seen:
                            seen.add(vc)
                            unique_feats.append(f)
                    if len(unique_feats) > 1:
                        best_feat = unique_feats
                        break
                    elif len(unique_feats) == 1:
                        break
            if best_feat and len(best_feat) > 1:
                options = [f"{f['properties']['v_code']} ({f['properties']['d_name']})" for f in best_feat]
                picked = pick_best_feature(best_feat)
                picked_str = f"{picked['properties']['v_code']} ({picked['properties']['d_name']})"
                print(f"  {vn:35s} options={options}  picked={picked_str}")

    if missing:
        print()
        print("Missing (no tile match):")
        for v in clan_gods['villages']:
            vn = v['name']
            if vn not in result or result[vn].get('code') is None:
                print(f"  {vn}  base_names={extract_base_names(vn)}")


if __name__ == '__main__':
    main()
