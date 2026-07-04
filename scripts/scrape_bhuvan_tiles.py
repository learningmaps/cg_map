"""Scrape Bhuvan PBF village tiles → GeoJSON with computed centroids.

Usage:
    python3 scripts/scrape_bhuvan_tiles.py

Output: data/bhuvan_villages_merged.geojson
"""

import json, math, os, sys, time
import requests
import mapbox_vector_tile
from shapely.geometry import shape
from shapely.ops import transform

# ── Config ──
Z = 11
TILE_URL = 'https://indianopenmaps.com/not-so-open/villages/bhuvan/{z}/{x}/{y}.pbf'
OUT_PATH = 'data/bhuvan_villages_merged.geojson'
VILLAGE_CENTROIDS_PATH = 'data/gods_and_goddesses/village_centroids.json'

# Bounding box covering Dantewada, Bastar, Bijapur, Kondagaon (approx)
# Extended slightly to catch edge villages
MIN_LAT, MAX_LAT = 18.3, 20.7
MIN_LNG, MAX_LNG = 80.1, 82.3


def deg2num(lat, lng, z):
    n = 1 << z
    x = int((lng + 180.0) / 360.0 * n)
    y = int((1.0 - math.log(math.tan(math.radians(lat)) + 1.0 / math.cos(math.radians(lat))) / math.pi) / 2.0 * n)
    return x, y


def tile_local_to_wgs84(tx, ty, x_tile, y_tile, z, extent=4096):
    n = 1 << z
    lng = (x_tile + tx / extent) / n * 360.0 - 180.0
    lat = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * (y_tile + ty / extent) / n))))
    return lat, lng


def tile_coords_to_wgs84(coords, x_tile, y_tile, z, extent=4096):
    """Convert a list of tile-local [tx, ty] pairs to WGS84 [lng, lat]."""
    result = []
    for tx, ty in coords:
        lat, lng = tile_local_to_wgs84(tx, ty, x_tile, y_tile, z, extent)
        result.append([lng, lat])
    return result


def convert_ring(ring, x_tile, y_tile, z, extent):
    return [tile_coords_to_wgs84(ring, x_tile, y_tile, z, extent)]


def convert_geometry(geom, x_tile, y_tile, z, extent):
    """Convert a tile-local geometry dict to WGS84 GeoJSON geometry dict."""
    if geom['type'] == 'Polygon':
        rings = geom['coordinates']
        new_rings = [tile_coords_to_wgs84(r, x_tile, y_tile, z, extent) for r in rings]
        return {'type': 'Polygon', 'coordinates': new_rings}
    elif geom['type'] == 'MultiPolygon':
        polys = geom['coordinates']
        new_polys = []
        for poly in polys:
            new_polys.append([tile_coords_to_wgs84(r, x_tile, y_tile, z, extent) for r in poly])
        return {'type': 'MultiPolygon', 'coordinates': new_polys}
    else:
        return geom


def main():
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)

    min_x, max_y_low = deg2num(MAX_LAT, MIN_LNG, Z)
    max_x, min_y_high = deg2num(MIN_LAT, MAX_LNG, Z)
    # y in TMS increases southward: max_y_low is north (smaller), min_y_high is south (larger)

    x_range = range(min_x, max_x + 1)
    y_range = range(max_y_low, min_y_high + 1)
    total_tiles = len(x_range) * len(y_range)

    print(f'Z={Z} scan: x={min_x}–{max_x}, y={max_y_low}–{min_y_high} ({total_tiles} tiles)')
    print(f'  Bounding box: {MIN_LAT}–{MAX_LAT}°N, {MIN_LNG}–{MAX_LNG}°E')
    print()

    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (compatible; BhuvanTileScraper/1.0)',
        'Accept': 'application/x-protobuf',
    })

    # Group features by v_code to merge split polygons
    vcode_to_slices = {}
    no_code_features = []
    tile_count = 0
    feat_total = 0

    for x in x_range:
        for y in y_range:
            url = TILE_URL.format(z=Z, x=x, y=y)
            try:
                resp = session.get(url, timeout=20)
                if resp.status_code != 200 or len(resp.content) < 50:
                    continue
                tile_data = mapbox_vector_tile.decode(resp.content, default_options={'y_coord_down': True})
                for layer_name, layer in tile_data.items():
                    extent = layer.get('extent', 4096)
                    layer_features = layer.get('features', [])
                    for feat in layer_features:
                        props = feat.get('properties', {})
                        v_code = props.get('v_code', '')

                        # Skip features without valid geometry
                        raw_geom = feat.get('geometry')
                        if not raw_geom:
                            continue

                        # Convert geometry to WGS84
                        wgs84_geom = convert_geometry(raw_geom, x, y, Z, extent)
                        geom_shape = shape(wgs84_geom)

                        if v_code:
                            vcode_to_slices.setdefault(v_code, []).append((props, geom_shape))
                        else:
                            no_code_features.append((props, geom_shape))
                        
                        feat_total += 1

                    tile_count += 1
            except requests.Timeout:
                print(f'  [timeout] ({x},{y})')
            except Exception as e:
                print(f'  [error] ({x},{y}): {e}')

            if tile_count > 0 and tile_count % 20 == 0:
                print(f'  ... {tile_count}/{total_tiles} tiles, {feat_total} features raw')

    print()
    print(f'Done scanning: {tile_count} tiles, {feat_total} raw features collected.')
    print("Merging sliced geometries...")
    
    from shapely.ops import unary_union
    from shapely.geometry import mapping

    features = []
    centroids_out = {}

    # 1. Process features with v_code (merge duplicate slices)
    for v_code, slices in vcode_to_slices.items():
        base_props = slices[0][0]
        v_name = base_props.get('v_name', '').strip()
        shapes = [item[1] for item in slices]
        
        try:
            merged_shape = unary_union(shapes)
        except Exception as e:
            print(f"Error merging slices for {v_name} ({v_code}): {e}")
            merged_shape = shapes[0]

        merged_geom = mapping(merged_shape)

        feature = {
            'type': 'Feature',
            'properties': {
                'v_name': v_name,
                'v_code': v_code,
                'd_name': base_props.get('d_name', ''),
                'd_code': base_props.get('d_code', ''),
                'b_name': base_props.get('b_name', ''),
                'b_code': base_props.get('b_code', ''),
                'gp_name': base_props.get('gp_name', ''),
                'gp_code': base_props.get('gp_code', ''),
                's_name': base_props.get('s_name', ''),
                's_code': base_props.get('s_code', ''),
            },
            'geometry': merged_geom,
        }
        features.append(feature)

        # Compute centroid for clan_gods on merged geometry
        if v_name:
            c = merged_shape.centroid
            centroids_out[v_name] = [round(c.y, 6), round(c.x, 6)]

    # 2. Process features without v_code
    for props, geom_shape in no_code_features:
        v_name = props.get('v_name', '').strip()
        feature = {
            'type': 'Feature',
            'properties': props,
            'geometry': mapping(geom_shape),
        }
        features.append(feature)
        if v_name:
            c = geom_shape.centroid
            centroids_out[v_name] = [round(c.y, 6), round(c.x, 6)]

    # Build GeoJSON FeatureCollection
    fc = {
        'type': 'FeatureCollection',
        'metadata': {
            'source': 'Bhuvan PBF tiles (indianopenmaps.com)',
            'z': Z,
            'bounds': [MIN_LNG, MIN_LAT, MAX_LNG, MAX_LAT],
            'feature_count': len(features),
            'generated': time.strftime('%Y-%m-%d'),
        },
        'features': features,
    }

    with open(OUT_PATH, 'w') as f:
        json.dump(fc, f)
    file_mb = os.path.getsize(OUT_PATH) / 1_000_000
    print(f'Wrote {OUT_PATH} ({file_mb:.1f} MB, {len(features)} merged features)')

    # Write clan_gods centroids separately
    centroid_count = len(centroids_out)
    with open(VILLAGE_CENTROIDS_PATH, 'w') as f:
        json.dump(centroids_out, f, indent=2)
    print(f'Wrote {VILLAGE_CENTROIDS_PATH} ({centroid_count} villages)')

    return True


if __name__ == '__main__':
    main()
