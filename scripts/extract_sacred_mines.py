import json
import math
import os
import re
import sys
import xml.etree.ElementTree as ET
import requests
import mapbox_vector_tile
from shapely.geometry import shape, Polygon, MultiPolygon, mapping
from shapely.ops import unary_union

# ── Config ──
Z = 11
TILE_URL = 'https://indianopenmaps.com/not-so-open/mining/leases/major/ngdr/{z}/{x}/{y}.pbf'
MINES_TXT = 'data/gods_and_goddesses/mines_in_sacred_geography.txt'
SIJIMALI_KML = 'data/Extra Data/Sijimali Bauxite Mine/Sijimali bauxite mine KML.kml'
SIJIMALI_TXT = 'data/Extra Data/Sijimali Bauxite Mine/sijimali_properties.txt'
SACRED_KML = 'data/gods_and_goddesses/sacred_geography_v1.kml'
OUT_PATH = 'data/gods_and_goddesses/mines_in_sacred_geography.geojson'

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

def convert_geometry(geom, x_tile, y_tile, z, extent=4096):
    if geom['type'] == 'Polygon':
        rings = geom['coordinates']
        new_rings = []
        for r in rings:
            new_rings.append([[tile_local_to_wgs84(tx, ty, x_tile, y_tile, z, extent)[1], 
                               tile_local_to_wgs84(tx, ty, x_tile, y_tile, z, extent)[0]] for tx, ty in r])
        return {'type': 'Polygon', 'coordinates': new_rings}
    elif geom['type'] == 'MultiPolygon':
        polys = geom['coordinates']
        new_polys = []
        for poly in polys:
            new_rings = []
            for r in poly:
                new_rings.append([[tile_local_to_wgs84(tx, ty, x_tile, y_tile, z, extent)[1], 
                                   tile_local_to_wgs84(tx, ty, x_tile, y_tile, z, extent)[0]] for tx, ty in r])
            new_polys.append(new_rings)
        return {'type': 'MultiPolygon', 'coordinates': new_polys}
    return geom

def extract_target_ids():
    target_ids = set()
    if os.path.exists(MINES_TXT):
        with open(MINES_TXT, 'r') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                # Match code formats: e.g. 30CHG17001, BMCRAI22, etc.
                if re.match(r'^[A-Z0-9]{8,11}$', line):
                    target_ids.add(line)
    # Ensure they are printed
    print(f"Target Mine IDs extracted from text file: {sorted(list(target_ids))}")
    return target_ids

def parse_sijimali_properties():
    props = {}
    if os.path.exists(SIJIMALI_TXT):
        with open(SIJIMALI_TXT, 'r') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                parts = line.split('\t', 1)
                if len(parts) == 2:
                    k, v = parts[0].strip(), parts[1].strip()
                    props[k] = v
    return props

def parse_sijimali_kml():
    if not os.path.exists(SIJIMALI_KML):
        return None
    # Parse coordinates from KML
    tree = ET.parse(SIJIMALI_KML)
    root = tree.getroot()
    # Simple search for Coordinates element
    ns = {'kml': 'http://www.opengis.net/kml/2.2'}
    coords_els = root.findall('.//kml:coordinates', ns)
    if not coords_els:
        # Try namespace-less
        coords_els = root.findall('.//coordinates')
    
    if coords_els:
        coord_str = coords_els[0].text.strip()
        coords = []
        for triplet in coord_str.split():
            parts = triplet.split(',')
            if len(parts) >= 2:
                coords.append([float(parts[0]), float(parts[1])])
        return Polygon(coords)
    return None

def parse_sacred_geography_centroids():
    centroids = []
    if not os.path.exists(SACRED_KML):
        return centroids
    
    tree = ET.parse(SACRED_KML)
    root = tree.getroot()
    ns = {'kml': 'http://www.opengis.net/kml/2.2'}
    
    placemarks = root.findall('.//kml:Placemark', ns)
    if not placemarks:
        placemarks = root.findall('.//Placemark')
        
    for pm in placemarks:
        coords_el = pm.find('.//kml:coordinates', ns)
        if coords_el is None:
            coords_el = pm.find('.//coordinates')
            
        if coords_el is not None:
            coord_str = coords_el.text.strip()
            coords = []
            for triplet in coord_str.split():
                parts = triplet.split(',')
                if len(parts) >= 2:
                    coords.append((float(parts[0]), float(parts[1])))
            if len(coords) >= 3:
                poly = Polygon(coords)
                c = poly.centroid
                centroids.append((c.y, c.x)) # (lat, lng)
    print(f"Extracted {len(centroids)} centroids from {SACRED_KML}")
    return centroids

def main():
    target_ids = extract_target_ids()
    if not target_ids:
        print("No target mine IDs found!")
        return

    centroids = parse_sacred_geography_centroids()
    
    # Calculate target tiles (center + 8 neighbors)
    target_tiles = set()
    for lat, lng in centroids:
        cx, cy = deg2num(lat, lng, Z)
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                target_tiles.add((cx + dx, cy + dy))
                
    print(f"Scanning {len(target_tiles)} unique Z={Z} tiles around sacred geography centroids...")

    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (compatible; MineExtractor/1.0)',
        'Accept': 'application/x-protobuf',
    })

    matched_features = {}

    for x, y in sorted(list(target_tiles)):
        url = TILE_URL.format(z=Z, x=x, y=y)
        try:
            resp = session.get(url, timeout=15)
            if resp.status_code != 200 or len(resp.content) < 50:
                continue
            tile_data = mapbox_vector_tile.decode(resp.content, default_options={'y_coord_down': True})
            for layer_name, layer in tile_data.items():
                if layer_name != 'NGDR_Major_Mining_Leases_2022':
                    continue
                extent = layer.get('extent', 4096)
                for feat in layer.get('features', []):
                    props = feat.get('properties', {})
                    reg_id = props.get('reg_id', '')
                    mine_code = props.get('mine_code', '')
                    
                    # Match reg_id or mine_code
                    matched_id = None
                    if reg_id in target_ids:
                        matched_id = reg_id
                    elif mine_code in target_ids:
                        matched_id = mine_code
                    
                    if matched_id:
                        raw_geom = feat.get('geometry')
                        if not raw_geom:
                            continue
                        wgs84_geom = convert_geometry(raw_geom, x, y, Z, extent)
                        geom_shape = shape(wgs84_geom)
                        if matched_id not in matched_features:
                            matched_features[matched_id] = {
                                'properties': props,
                                'geoms': []
                            }
                        matched_features[matched_id]['geoms'].append(geom_shape)
        except Exception as e:
            print(f"Error checking tile {x},{y}: {e}")

    features = []

    # Process and union NGDR features
    for mine_id, data in matched_features.items():
        props = data['properties']
        geoms = data['geoms']
        try:
            union_geom = unary_union(geoms)
        except Exception as e:
            print(f"Error unioning geometries for {mine_id}: {e}")
            union_geom = geoms[0]
            
        features.append({
            'type': 'Feature',
            'properties': props,
            'geometry': mapping(union_geom)
        })
        print(f"Successfully extracted NGDR mine: {props.get('mine_name', 'Unknown')} ({mine_id})")

    # Add Sijimali
    sijimali_poly = parse_sijimali_kml()
    if sijimali_poly:
        sijimali_props = parse_sijimali_properties()
        # Ensure we have essential keys for popup mapping consistency
        sijimali_props['mine_name'] = sijimali_props.get('Mine Name', 'Sijimali Bauxite Mine')
        sijimali_props['reg_id'] = 'Sijimali'
        features.append({
            'type': 'Feature',
            'properties': sijimali_props,
            'geometry': mapping(sijimali_poly)
        })
        print("Successfully added Sijimali Bauxite Mine from local KML")

    fc = {
        'type': 'FeatureCollection',
        'features': features
    }

    with open(OUT_PATH, 'w') as f:
        json.dump(fc, f, indent=2)
    print(f"Wrote {len(features)} mine features to {OUT_PATH}")

if __name__ == '__main__':
    main()
