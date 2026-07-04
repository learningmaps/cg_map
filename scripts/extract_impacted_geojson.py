import json
import re
import ast

CLAN_CONFIG_PATH = 'js/config.js'
GEOJSON_PATH = 'data/bhuvan_villages_merged.geojson'
OUT_PATH = 'data/bodhghat_impacted_villages.geojson'

def compute_polygon_centroid(geom):
    """Calculate the Shoelace area-weighted centroid of a polygon."""
    if geom['type'] == 'Polygon':
        ring = geom['coordinates'][0]
    elif geom['type'] == 'MultiPolygon':
        # Default to largest outline
        ring = geom['coordinates'][0][0]
    else:
        return None

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

def main():
    # 1. Load config.js and parse IMPACTED_VILLAGES
    with open(CLAN_CONFIG_PATH, 'r', encoding='utf-8') as f:
        config_text = f.read()

    match = re.search(r'const IMPACTED_VILLAGES = \[(.*?)\];', config_text, re.DOTALL)
    if not match:
        print("Error: Could not locate IMPACTED_VILLAGES in config.js")
        return

    js_clean = match.group(1).strip()
    js_clean = re.sub(r'//.*', '', js_clean)
    js_clean = re.sub(r'/\*.*?\*/', '', js_clean, flags=re.DOTALL)
    js_clean = re.sub(r'(\w+):', r'"\1":', js_clean) # Quote keys
    js_clean = js_clean.replace("'", '"')            # Replace single quotes
    js_clean = re.sub(r', \s*\]', ']', js_clean)
    js_clean = re.sub(r',\s*\}', '}', js_clean)
    js_clean = re.sub(r'null', 'null', js_clean)
    js_clean = re.sub(r'true', 'true', js_clean)
    js_clean = re.sub(r'false', 'false', js_clean)
    
    impacted_list = json.loads('[' + js_clean + ']')
    print(f"Loaded {len(impacted_list)} target impacted villages from configuration.")

    # 2. Load merged geojson
    with open(GEOJSON_PATH, 'r', encoding='utf-8') as f:
        geojson = json.load(f)

    features = geojson.get('features', [])
    matched_features = []

    # 3. Filter features
    for iv in impacted_list:
        v_name = iv['v'].upper()
        d_name = iv['d'].upper()
        iv_id = iv.get('id')
        
        match_feat = None
        for feat in features:
            props = feat.get('properties', {})
            g_vname = (props.get('v_name') or '').upper()
            g_dname = (props.get('d_name') or '').upper()
            g_vcode = props.get('v_code')
            
            # Match by ID first, string-cast to avoid type issues
            if iv_id and str(g_vcode) == str(iv_id):
                match_feat = feat
                break
            # Fall back to name-based match if no ID was specified
            elif not iv_id and g_vname == v_name:
                # Prevent substring matching errors (like "Bastar" matching "Uttar Bastar Kanker")
                if g_dname == d_name or g_dname == f"DAKSHIN BASTAR {d_name}" or g_dname == f"UTTAR BASTAR {d_name}":
                    match_feat = feat
                    break
        
        if match_feat:
            # Copy to prevent modification of original and attach extra config properties
            new_feat = json.loads(json.dumps(match_feat))
            new_feat['properties']['impact_data'] = iv
            # Compute true mathematical centroid
            new_feat['properties']['centroid'] = compute_polygon_centroid(new_feat['geometry'])
            matched_features.append(new_feat)
        else:
            print(f"Warning: Could not match village {iv['v']} ({iv['d']}) in Bhuvan GeoJSON.")

    # 4. Save filtered GeoJSON
    out_geojson = {
        "type": "FeatureCollection",
        "features": matched_features
    }

    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(out_geojson, f, indent=2)

    print(f"Successfully generated {OUT_PATH} with {len(matched_features)} features.")

if __name__ == '__main__':
    main()
