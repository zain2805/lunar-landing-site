r"""
Lunar Landing Site Navigator - Mathematical Calculation Engine
Module: backend/calculator.py
NASA Space Apps Challenge 2026

Implements the 8 core calculations:
1. Elevation calculation (Height of lunar terrain)
2. Slope calculation (Horn's method in degrees)
3. Surface roughness (Terrain Roughness Index - TRI)
4. Landing safety score (Multi-Criteria Evaluation 0.0 - 1.0)
5. Distance calculation (Great-Circle Haversine & 3D Euclidean)
6. Navigation path calculation (A* safe route finding)
7. Sunlight illumination (Horizon shadow ray-tracing)
8. Hazard detection (Craters and steep slope masking)
"""

import os
import json
import math
import heapq

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(os.path.dirname(BASE_DIR), "data")

class LunarCalculator:
    def __init__(self, data_dir=DATA_DIR):
        self.data_dir = data_dir
        self.load_datasets()

    def load_datasets(self):
        with open(os.path.join(self.data_dir, "lunar_elevation_grid_5m.json"), "r") as f:
            self.elevation_data = json.load(f)
        with open(os.path.join(self.data_dir, "lunar_waypoints.json"), "r") as f:
            self.waypoints_data = json.load(f)
        with open(os.path.join(self.data_dir, "crater_hazards.json"), "r") as f:
            self.craters_data = json.load(f)
        with open(os.path.join(self.data_dir, "solar_illumination_ephemeris.json"), "r") as f:
            self.solar_data = json.load(f)
        with open(os.path.join(self.data_dir, "calculation_parameters.json"), "r") as f:
            self.params = json.load(f)

        self.dem = self.elevation_data["elevation_matrix_m"]
        self.cell_size_m = self.elevation_data["metadata"]["cell_size_meters"]
        self.rows = len(self.dem)
        self.cols = len(self.dem[0])
        self.origin_x = self.elevation_data["metadata"].get("origin_x_meters", 0.0)
        self.origin_y = self.elevation_data["metadata"].get("origin_y_meters", -124360.0)

        # Pre-compute slope, roughness, and hazard masks
        self.slope_grid = self.calculate_slope_grid()
        self.roughness_grid = self.calculate_roughness_grid()
        self.hazard_grid = self.detect_hazard_grid()

    # 1. ELEVATION CALCULATION
    def get_elevation(self, x_m, y_m):
        """Bilinear interpolation of elevation at continuous (x, y) meters."""
        r = (y_m - self.origin_y) / self.cell_size_m
        c = (x_m - self.origin_x) / self.cell_size_m

        r0 = max(0, min(int(math.floor(r)), self.rows - 1))
        r1 = max(0, min(r0 + 1, self.rows - 1))
        c0 = max(0, min(int(math.floor(c)), self.cols - 1))
        c1 = max(0, min(c0 + 1, self.cols - 1))

        dr = r - r0
        dc = c - c0

        z00 = self.dem[r0][c0]
        z01 = self.dem[r0][c1]
        z10 = self.dem[r1][c0]
        z11 = self.dem[r1][c1]

        z = (1.0 - dr) * (1.0 - dc) * z00 + (1.0 - dr) * dc * z01 + dr * (1.0 - dc) * z10 + dr * dc * z11
        return round(z, 2)

    # 2. SLOPE CALCULATION
    def calculate_slope_grid(self):
        """Horn 3x3 convolution to compute slope grid in degrees."""
        slopes = [[0.0 for _ in range(self.cols)] for _ in range(self.rows)]
        for r in range(1, self.rows - 1):
            for c in range(1, self.cols - 1):
                dz_dx = ((self.dem[r-1][c+1] + 2*self.dem[r][c+1] + self.dem[r+1][c+1]) -
                         (self.dem[r-1][c-1] + 2*self.dem[r][c-1] + self.dem[r+1][c-1])) / (8.0 * self.cell_size_m)
                dz_dy = ((self.dem[r+1][c-1] + 2*self.dem[r+1][c] + self.dem[r+1][c+1]) -
                         (self.dem[r-1][c-1] + 2*self.dem[r-1][c] + self.dem[r-1][c+1])) / (8.0 * self.cell_size_m)
                grad = math.hypot(dz_dx, dz_dy)
                slopes[r][c] = round(math.degrees(math.atan(grad)), 2)

        # Fill borders
        for r in range(self.rows):
            slopes[r][0] = slopes[r][1]
            slopes[r][self.cols-1] = slopes[r][self.cols-2]
        for c in range(self.cols):
            slopes[0][c] = slopes[1][c]
            slopes[self.rows-1][c] = slopes[self.rows-2][c]

        return slopes

    # 3. SURFACE ROUGHNESS (TRI)
    def calculate_roughness_grid(self):
        """Terrain Roughness Index (TRI) - average elevation difference from 8 neighbors."""
        tri = [[0.0 for _ in range(self.cols)] for _ in range(self.rows)]
        for r in range(1, self.rows - 1):
            for c in range(1, self.cols - 1):
                center = self.dem[r][c]
                diff_sum = 0.0
                for dr in [-1, 0, 1]:
                    for dc in [-1, 0, 1]:
                        if dr == 0 and dc == 0:
                            continue
                        diff_sum += abs(self.dem[r+dr][c+dc] - center)
                tri[r][c] = round(diff_sum / 8.0, 3)
        return tri

    # 4. LANDING SAFETY SCORE
    def calculate_safety_score(self, slope_deg, tri_m, is_sunlit=True, is_hazard=False):
        """Multi-Criteria Decision Analysis landing suitability score [0.0 - 1.0]."""
        weights = self.params["calculation_4_landing_safety_score"]["weights"]
        crit_slope = self.params["calculation_2_slope"]["steep_slope_threshold_deg"]

        if is_hazard or slope_deg > crit_slope:
            return 0.0, "Hazardous (No-Go)"

        s_slope = max(0.0, 1.0 - (slope_deg / crit_slope))
        s_rough = max(0.0, 1.0 - (tri_m / 1.0))
        s_illum = 1.0 if is_sunlit else 0.2
        s_hazard = 1.0

        score = (
            weights["weight_slope"] * s_slope +
            weights["weight_roughness"] * s_rough +
            weights["weight_illumination"] * s_illum +
            weights["weight_hazard_avoidance"] * s_hazard
        )
        score = round(min(1.0, max(0.0, score)), 3)

        if score >= 0.80:
            tier = "Optimal"
        elif score >= 0.60:
            tier = "Acceptable"
        elif score >= 0.40:
            tier = "Marginal"
        else:
            tier = "High Risk"

        return score, tier

    # 5. DISTANCE CALCULATION
    def calculate_distance(self, lat1, lon1, lat2, lon2, z1=0.0, z2=0.0):
        """Great-circle distance (Haversine) on Moon (R=1737.4 km) and 3D Euclidean distance."""
        radius_m = self.params["constants"]["lunar_mean_radius_m"]
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlam = math.radians(lon2 - lon1)

        a = math.sin(dphi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2.0)**2
        c = 2.0 * math.asin(min(1.0, math.sqrt(a)))
        d_surf = radius_m * c
        d_3d = math.hypot(d_surf, z2 - z1)

        return round(d_surf, 2), round(d_3d, 2)

    # 6. NAVIGATION PATH CALCULATION (A*)
    def find_safe_navigation_path(self, start_cell, goal_cell):
        """Finds safe rover traverse path avoiding slopes > 15 deg and crater hazards."""
        sr, sc = start_cell
        gr, gc = goal_cell
        sr = max(0, min(sr, self.rows - 1))
        sc = max(0, min(sc, self.cols - 1))
        gr = max(0, min(gr, self.rows - 1))
        gc = max(0, min(gc, self.cols - 1))
        start = (sr, sc)
        goal = (gr, gc)

        def heuristic(a, b):
            return math.hypot((a[0] - b[0]) * self.cell_size_m, (a[1] - b[1]) * self.cell_size_m)

        open_set = []
        heapq.heappush(open_set, (0, start))
        came_from = {}
        g_score = {start: 0.0}

        moves = [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)]

        while open_set:
            _, current = heapq.heappop(open_set)

            if current == goal:
                path = []
                curr = current
                while curr in came_from:
                    path.append(curr)
                    curr = came_from[curr]
                path.append(start)
                path.reverse()
                total_dist = sum(heuristic(path[i], path[i+1]) for i in range(len(path)-1))
                waypoints_coords = [
                    {"row": r, "col": c, "x_m": round(c * self.cell_size_m, 1), "y_m": round(r * self.cell_size_m, 1), "elevation_m": self.dem[r][c], "slope_deg": self.slope_grid[r][c]}
                    for r, c in path
                ]
                return {
                    "status": "success",
                    "waypoint_count": len(path),
                    "total_distance_m": round(total_dist, 2),
                    "max_slope_on_path_deg": max(p["slope_deg"] for p in waypoints_coords),
                    "path": waypoints_coords
                }

            for dr, dc in moves:
                nr, nc = current[0] + dr, current[1] + dc
                neighbor = (nr, nc)

                if not (0 <= nr < self.rows and 0 <= nc < self.cols):
                    continue

                if self.hazard_grid[nr][nc] == 1 or self.slope_grid[nr][nc] > 15.0:
                    continue

                step_dist = self.cell_size_m * math.hypot(dr, dc)
                slope_penalty = 1.0 + 3.0 * ((self.slope_grid[nr][nc] / 15.0)**2)
                tentative_g = g_score[current] + step_dist * slope_penalty

                if tentative_g < g_score.get(neighbor, float("inf")):
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g
                    f_score = tentative_g + heuristic(neighbor, goal)
                    heapq.heappush(open_set, (f_score, neighbor))

        return {"status": "blocked", "message": "No safe route exists within slope limit"}

    # 7. SUNLIGHT ILLUMINATION (Ray-tracing)
    def calculate_illumination_map(self, sun_azimuth_deg, sun_elevation_deg):
        """Horizon ray-tracing shadow calculator across DEM."""
        illum = [[1 for _ in range(self.cols)] for _ in range(self.rows)]
        if sun_elevation_deg <= 0.0:
            return [[0 for _ in range(self.cols)] for _ in range(self.rows)]

        tan_elev = math.tan(math.radians(sun_elevation_deg))
        rad_az = math.radians(sun_azimuth_deg)
        dx = math.sin(rad_az)
        dy = math.cos(rad_az)
        max_steps = int(max(self.rows, self.cols) * 1.5)

        for r in range(self.rows):
            for c in range(self.cols):
                curr_elev = self.dem[r][c]
                in_shadow = False
                for step in range(1, max_steps):
                    sr = int(r + step * dy)
                    sc = int(c + step * dx)
                    if not (0 <= sr < self.rows and 0 <= sc < self.cols):
                        break
                    obs_elev = self.dem[sr][sc]
                    ray_height = curr_elev + (step * self.cell_size_m) * tan_elev
                    if obs_elev > ray_height:
                        in_shadow = True
                        break
                if in_shadow:
                    illum[r][c] = 0
        return illum

    # 8. HAZARD DETECTION
    def detect_hazard_grid(self):
        """Binary hazard map: slope >= 12 deg or within crater hazard buffer."""
        hazards = [[0 for _ in range(self.cols)] for _ in range(self.rows)]
        for r in range(self.rows):
            for c in range(self.cols):
                if self.slope_grid[r][c] >= 12.0:
                    hazards[r][c] = 1

        for cr in self.craters_data["craters"]:
            cr_row = cr.get("center_grid_row", -1)
            cr_col = cr.get("center_grid_col", -1)
            radius = cr.get("hazard_safety_radius_m", 0.0)

            if 0 <= cr_row < self.rows and 0 <= cr_col < self.cols:
                radius_cells = int(math.ceil(radius / self.cell_size_m))
                for r in range(max(0, cr_row - radius_cells), min(self.rows, cr_row + radius_cells + 1)):
                    for c in range(max(0, cr_col - radius_cells), min(self.cols, cr_col + radius_cells + 1)):
                        dist_m = math.hypot((r - cr_row) * self.cell_size_m, (c - cr_col) * self.cell_size_m)
                        if dist_m <= radius:
                            hazards[r][c] = 1

        return hazards
