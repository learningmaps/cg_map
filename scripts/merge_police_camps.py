#!/usr/bin/env python3
"""Merge duplicate KML files from data/police_military_camps/ into one clean file."""

import xml.etree.ElementTree as ET
import copy
import os

INPUT_FILES = [
    "data/police_military_camps/SC 1.kml",
    "data/police_military_camps/SC-2.kml",
]
OUTPUT_FILE = "data/police_military_camps/merged.kml"

NS_KML = "http://www.opengis.net/kml/2.2"
NS_GX = "http://www.google.com/kml/ext/2.2"

# Register namespaces: KML as default, gx with prefix
ET.register_namespace("", NS_KML)
ET.register_namespace("gx", NS_GX)
ET.register_namespace("atom", "http://www.w3.org/2005/Atom")


def make_dedup_key(pm):
    fid = pm.find(f"{{{NS_GX}}}fid")
    if fid is not None and fid.text:
        return ("fid", fid.text)
    name_el = pm.find(f"{{{NS_KML}}}name")
    coords_el = pm.find(f".//{{{NS_KML}}}coordinates")
    name_text = name_el.text.strip() if name_el is not None and name_el.text else ""
    coords_text = coords_el.text.strip() if coords_el is not None and coords_el.text else ""
    return ("geo", f"{name_text}|{coords_text}")


def main():
    seen = {}
    merged_placemarks = []

    for path in INPUT_FILES:
        if not os.path.exists(path):
            print(f"WARNING: {path} not found, skipping")
            continue
        print(f"Reading {path}...")
        tree = ET.parse(path)
        root = tree.getroot()
        for pm in root.findall(f".//{{{NS_KML}}}Placemark"):
            # Skip non-point features (polygons, lines, etc.) — only keep camp markers
            if pm.find(f".//{{{NS_KML}}}Point") is None:
                continue
            key = make_dedup_key(pm)
            if key not in seen:
                seen[key] = True
                merged_placemarks.append(copy.deepcopy(pm))

    print(f"Unique placemarks: {len(merged_placemarks)}")

    # Build clean output document
    kml = ET.Element("kml")
    doc = ET.SubElement(kml, "Document")
    name_el = ET.SubElement(doc, "name")
    name_el.text = "Police/Military Camps (merged)"

    for pm in merged_placemarks:
        doc.append(pm)

    tree_out = ET.ElementTree(kml)
    tree_out.write(OUTPUT_FILE, xml_declaration=True, encoding="UTF-8")
    size = os.path.getsize(OUTPUT_FILE)
    print(f"Written {OUTPUT_FILE} ({size} bytes)")


if __name__ == "__main__":
    main()
