#!/usr/bin/env python3
import urllib.request
import urllib.parse
import json

def main():
    overpass_url = "https://overpass-api.de/api/interpreter"
    
    # Overpass query to get landuse=military in Chhattisgarh (area ID = 3600000000 + 1972004 = 3601972004)
    query = """[out:json][timeout:60];
area(3601972004)->.searchArea;
nwr["landuse"="military"](area.searchArea);
out geom;"""
    
    print("Fetching data from Overpass API...")
    data = urllib.parse.urlencode({'data': query}).encode('utf-8')
    req = urllib.request.Request(
        overpass_url, 
        data=data,
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Error fetching data: {e}")
        return

    elements = result.get('elements', [])
    print(f"Found {len(elements)} elements. Converting to GeoJSON...")
    
    features = []
    for elem in elements:
        elem_type = elem.get('type')
        tags = elem.get('tags', {})
        name = tags.get('name', 'OSM Landuse Military')
        
        # Determine geometry
        coords = None
        geom_type = None
        
        if elem_type == 'node':
            coords = [elem.get('lon'), elem.get('lat')]
            geom_type = 'Point'
        elif elem_type == 'way':
            geom = elem.get('geometry', [])
            if geom:
                # If closed, make polygon, otherwise LineString. Usually landuse=military is a polygon.
                # Let's check if the first and last points are the same
                pts = [[pt['lon'], pt['lat']] for pt in geom]
                if pts[0] == pts[-1]:
                    coords = [pts]
                    geom_type = 'Polygon'
                else:
                    coords = pts
                    geom_type = 'LineString'
        elif elem_type == 'relation':
            pts = []
            for member in elem.get('members', []):
                if 'geometry' in member:
                    pts.extend([[pt['lon'], pt['lat']] for pt in member['geometry']])
            if pts:
                lons = [p[0] for p in pts]
                lats = [p[1] for p in pts]
                centroid = [sum(lons)/len(lons), sum(lats)/len(lats)]
                coords = centroid
                geom_type = 'Point'

        if coords and geom_type:
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": geom_type,
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
    
    output_path = "data/police_military_camps/osm_landuse_military.geojson"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(geojson, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully saved {len(features)} features to {output_path}")

if __name__ == "__main__":
    main()
