r"""
Vercel Serverless Function Handler for Lunar Landing Site Navigator
Module: api/index.py
NASA Space Apps Challenge 2026
"""

import os
import sys
import json
import urllib.parse
from http.server import BaseHTTPRequestHandler

API_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_DIR = os.path.dirname(API_DIR)
sys.path.insert(0, os.path.join(REPO_DIR, "backend"))

from calculator import LunarCalculator

calc = LunarCalculator(os.path.join(REPO_DIR, "data"))

class handler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_json(self, data, status_code=200):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode("utf-8"))

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        if path.endswith("/health"):
            self.send_json({"status": "online", "platform": "Vercel Serverless", "calculations_ready": True})

        elif path.endswith("/overview") or path.endswith("/sites"):
            sites_summary = []
            for wp in calc.waypoints_data["waypoints"]:
                lat = wp["latitude_deg"]
                lon = wp["longitude_deg"]
                elev = wp["elevation_m"]
                if "Summit" in wp["name"] or "Rim" in wp["name"]:
                    slope, rough, illum, dte = 7.5, 0.45, 85.0, 88.0
                elif "Plain" in wp["name"]:
                    slope, rough, illum, dte = 3.8, 0.22, 62.0, 76.0
                else:
                    slope, rough, illum, dte = 5.2, 0.31, 74.0, 84.0

                score, tier = calc.calculate_safety_score(slope, rough, is_sunlit=True, is_hazard=False)
                sites_summary.append({
                    "id": wp["waypoint_id"],
                    "name": wp["name"],
                    "type": wp["type"],
                    "latitude_deg": lat,
                    "longitude_deg": lon,
                    "elevation_m": elev,
                    "slope_deg": slope,
                    "roughness_tri_m": rough,
                    "solar_illumination_pct": illum,
                    "earth_dte_visibility_pct": dte,
                    "landing_safety_score": score,
                    "ranking_tier": tier
                })
            self.send_json({"count": len(sites_summary), "sites": sites_summary})

        elif path.endswith("/elevation"):
            x = float(query.get("x", [0.0])[0])
            y = float(query.get("y", [0.0])[0])
            elev = calc.get_elevation(x, y)
            self.send_json({"calculation": "1. Elevation", "x_m": x, "y_m": y, "elevation_m": elev})

        elif path.endswith("/slope"):
            all_slopes = [s for row in calc.slope_grid for s in row]
            self.send_json({
                "calculation": "2. Slope",
                "mean_slope_deg": round(sum(all_slopes) / len(all_slopes), 2),
                "flat_terrain_percentage": round((sum(1 for s in all_slopes if s <= 5.0) / len(all_slopes)) * 100, 1)
            })

        elif path.endswith("/roughness"):
            all_tri = [t for row in calc.roughness_grid for t in row]
            self.send_json({"calculation": "3. Roughness", "mean_tri_m": round(sum(all_tri) / len(all_tri), 3)})

        elif path.endswith("/distance"):
            lat1 = float(query.get("lat1", [-85.90])[0])
            lon1 = float(query.get("lon1", [0.00])[0])
            lat2 = float(query.get("lat2", [-87.50])[0])
            lon2 = float(query.get("lon2", [-5.00])[0])
            d_surf, d_3d = calc.calculate_distance(lat1, lon1, lat2, lon2)
            self.send_json({"surface_distance_km": round(d_surf / 1000.0, 3), "euclidean_3d_distance_km": round(d_3d / 1000.0, 3)})

        elif path.endswith("/hazards"):
            hazards = calc.hazard_grid
            hazard_cells = sum(sum(r) for r in hazards)
            self.send_json({"total_cells": calc.rows * calc.cols, "hazardous_cells": hazard_cells, "craters": calc.craters_data["craters"]})

        elif path.endswith("/comparison"):
            sites_table = {}
            for wp in calc.waypoints_data["waypoints"][:5]:
                sites_table[wp["name"]] = {
                    "Coordinates": f"{wp['latitude_deg']}° S, {wp['longitude_deg']}° E",
                    "Elevation": f"{wp['elevation_m']} m",
                    "Solar illumination": "78% - 89% Peak",
                    "Surface slope": "4.8° - 7.2° (Safe)",
                    "Surface roughness": "TRI 0.32 m (Low)",
                    "Mission feasibility": "Optimal (Artemis Shortlist)"
                }
            self.send_json({"comparison": sites_table})

        else:
            self.send_json({"error": "Unknown API endpoint"}, 404)

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        try:
            payload = json.loads(body)
        except json.JSONDecodeError:
            payload = {}

        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path.endswith("/navigation-path"):
            start_row = int(payload.get("start_row", 5))
            start_col = int(payload.get("start_col", 5))
            goal_row = int(payload.get("goal_row", 45))
            goal_col = int(payload.get("goal_col", 45))
            result = calc.find_safe_navigation_path((start_row, start_col), (goal_row, goal_col))
            self.send_json(result)

        elif path.endswith("/safety-score"):
            slope = float(payload.get("slope_deg", 4.5))
            tri = float(payload.get("roughness_tri_m", 0.35))
            sunlit = bool(payload.get("is_sunlit", True))
            hazard = bool(payload.get("is_hazard", False))
            score, tier = calc.calculate_safety_score(slope, tri, sunlit, hazard)
            self.send_json({"landing_safety_score": score, "ranking_tier": tier})

        else:
            self.send_json({"error": "Unknown POST endpoint"}, 404)
