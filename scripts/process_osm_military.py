#!/usr/bin/env python3
import json
import os

def calculate_centroid(geom):
    if not geom:
        return None
    lons = [pt['lon'] for pt in geom]
    lats = [pt['lat'] for pt in geom]
    return [sum(lons) / len(lons), sum(lats) / len(lats)]

def main():
    raw_path = "data/Extra Data/osm_landuse_military_raw.json"
    output_path = "data/police_military_camps/osm_landuse_military.geojson"
    
    if not os.path.exists(raw_path):
        print(f"Error: {raw_path} not found")
        return
        
    with open(raw_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    elements = data.get('elements', [])
    features = []
    
    for elem in elements:
        elem_type = elem.get('type')
        tags = elem.get('tags', {})
        # Use name if present, otherwise default to military type or generic label
        name = tags.get('name')
        if not name:
            mil_type = tags.get('military', '').replace('_', ' ').title()
            if mil_type:
                name = f"OSM Military ({mil_type})"
            else:
                name = "OSM Military Area"
                
        coords = None
        
        if elem_type == 'node':
            coords = [elem.get('lon'), elem.get('lat')]
        elif elem_type == 'way':
            geom = elem.get('geometry', [])
            coords = calculate_centroid(geom)
        elif elem_type == 'relation':
            # Accumulate all geometry points of member ways
            all_pts = []
            for member in elem.get('members', []):
                if 'geometry' in member:
                    all_pts.extend(member['geometry'])
            if all_pts:
                coords = calculate_centroid(all_pts)
                
        if coords:
            lon, lat = coords
            # Chhattisgarh bounding box filter
            if 17.76 <= lat <= 24.12 and 80.24 <= lon <= 84.41:
                # We want point geometries for dot markers
                feature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": coords
                    },
                    "properties": {
                        "id": elem.get('id'),
                        "osm_type": elem_type,
                        "name": name,
                        **tags
                    }
                }
                features.append(feature)
            
    geojson = {
        "type": "FeatureCollection",
        "features": features
    }
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(geojson, f, indent=2, ensure_ascii=False)
        
    print(f"Processed {len(features)} military features into {output_path}")

if __name__ == "__main__":
    main()
