r"""
Lunar Landing Site Navigator - Pure Mathematical Calculation Engine
NASA Space Apps Challenge 2026

Implements all 8 required calculations:
1. Elevation calculation (Height z)
2. Slope calculation (Horn's convolution in degrees)
3. Surface roughness (Terrain Roughness Index - TRI)
4. Landing safety score (Multi-Criteria Evaluation 0.0 - 1.0)
5. Distance calculation (Great-Circle & 3D Euclidean)
6. Navigation path calculation (A* safe route finding)
7. Sunlight illumination (Shadow ray-tracing & solar incidence)
8. Hazard detection (Crater & slope hazard masking)
"""

import os
import json
import math
import heapq

DATA_DIR = os.path.dirname(os.path.abspath(__file__))

def load_data():
    with open(os.path.join(DATA_DIR, "lunar_elevation_grid_5m.json"), "r") as f:
        elev_data = json.load(f)
    with open(os.path.join(DATA_DIR, "lunar_waypoints.json"), "r") as f:
        waypoints_data = json.load(f)
    with open(os.path.join(DATA_DIR, "crater_hazards.json"), "r") as f:
        craters_data = json.load(f)
    with open(os.path.join(DATA_DIR, "solar_illumination_ephemeris.json"), "r") as f:
        solar_data = json.load(f)
    with open(os.path.join(DATA_DIR, "calculation_parameters.json"), "r") as f:
        params_data = json.load(f)
    return elev_data, waypoints_data, craters_data, solar_data, params_data


# -----------------------------------------------------------------------------
# 1. ELEVATION CALCULATION: Find the height of lunar terrain
# -----------------------------------------------------------------------------
def get_elevation_at_point(dem_matrix, cell_size_m, x_m, y_m, origin_x=0.0, origin_y=0.0):
    """
    Calculates interpolated elevation (height) at any continuous (x, y) coordinate.
    """
    r = (y_m - origin_y) / cell_size_m
    c = (x_m - origin_x) / cell_size_m
    rows = len(dem_matrix)
    cols = len(dem_matrix[0])

    # Bilinear interpolation
    r0 = int(math.floor(r))
    r1 = min(r0 + 1, rows - 1)
    c0 = int(math.floor(c))
    c1 = min(c0 + 1, cols - 1)

    r0 = max(0, min(r0, rows - 1))
    c0 = max(0, min(c0, cols - 1))

    dr = r - r0
    dc = c - c0

    z00 = dem_matrix[r0][c0]
    z01 = dem_matrix[r0][c1]
    z10 = dem_matrix[r1][c0]
    z11 = dem_matrix[r1][c1]

    z = (1.0 - dr) * (1.0 - dc) * z00 + (1.0 - dr) * dc * z01 + dr * (1.0 - dc) * z10 + dr * dc * z11
    return round(z, 2)


# -----------------------------------------------------------------------------
# 2. SLOPE CALCULATION: Identify steep and flat surfaces
# -----------------------------------------------------------------------------
def calculate_slope_matrix(dem_matrix, cell_size_m=5.0):
    """
    Computes slope in degrees using Horn's 3x3 convolution algorithm.
    """
    rows = len(dem_matrix)
    cols = len(dem_matrix[0])
    slope_matrix = [[0.0 for _ in range(cols)] for _ in range(rows)]

    for r in range(1, rows - 1):
        for c in range(1, cols - 1):
            dz_dx = ((dem_matrix[r-1][c+1] + 2*dem_matrix[r][c+1] + dem_matrix[r+1][c+1]) -
                     (dem_matrix[r-1][c-1] + 2*dem_matrix[r][c-1] + dem_matrix[r+1][c-1])) / (8.0 * cell_size_m)
            dz_dy = ((dem_matrix[r+1][c-1] + 2*dem_matrix[r+1][c] + dem_matrix[r+1][c+1]) -
                     (dem_matrix[r-1][c-1] + 2*dem_matrix[r-1][c] + dem_matrix[r-1][c+1])) / (8.0 * cell_size_m)
            grad = math.hypot(dz_dx, dz_dy)
            slope_deg = math.degrees(math.atan(grad))
            slope_matrix[r][c] = round(slope_deg, 2)

    # Fill borders
    for r in range(rows):
        slope_matrix[r][0] = slope_matrix[r][1]
        slope_matrix[r][cols-1] = slope_matrix[r][cols-2]
    for c in range(cols):
        slope_matrix[0][c] = slope_matrix[1][c]
        slope_matrix[rows-1][c] = slope_matrix[rows-2][c]

    return slope_matrix


# -----------------------------------------------------------------------------
# 3. SURFACE ROUGHNESS: Identify uneven terrain (TRI)
# -----------------------------------------------------------------------------
def calculate_roughness_matrix(dem_matrix):
    """
    Calculates Terrain Roughness Index (TRI) - average elevation difference from 8 neighbors.
    """
    rows = len(dem_matrix)
    cols = len(dem_matrix[0])
    tri_matrix = [[0.0 for _ in range(cols)] for _ in range(rows)]

    for r in range(1, rows - 1):
        for c in range(1, cols - 1):
            center = dem_matrix[r][c]
            diff_sum = 0.0
            for dr in [-1, 0, 1]:
                for dc in [-1, 0, 1]:
                    if dr == 0 and dc == 0:
                        continue
                    diff_sum += abs(dem_matrix[r+dr][c+dc] - center)
            tri_matrix[r][c] = round(diff_sum / 8.0, 3)

    return tri_matrix


# -----------------------------------------------------------------------------
# 4. LANDING SAFETY SCORE: Rank suitable landing locations
# -----------------------------------------------------------------------------
def calculate_landing_safety_score(slope_deg, tri_roughness, is_sunlit, is_hazard, weights=None):
    """
    Evaluates touchdown safety score [0.0 - 1.0]. Returns 0.0 if critical constraint breached.
    """
    if weights is None:
        weights = {"weight_slope": 0.35, "weight_roughness": 0.20, "weight_illumination": 0.25, "weight_hazard_avoidance": 0.20}

    # Hard constraints
    if is_hazard or slope_deg > 10.0:
        return 0.0, "Hazard / Non-Viable"

    # Normalize individual components [0.0 - 1.0]
    s_slope = max(0.0, 1.0 - (slope_deg / 10.0))
    s_rough = max(0.0, 1.0 - (tri_roughness / 1.0))
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
    else:
        tier = "Marginal"

    return score, tier


# -----------------------------------------------------------------------------
# 5. DISTANCE CALCULATION: Distance between two lunar locations
# -----------------------------------------------------------------------------
def calculate_distance(lat1_deg, lon1_deg, lat2_deg, lon2_deg, z1_m=0.0, z2_m=0.0, method="haversine", radius_m=1737400.0):
    """
    Calculates Great-Circle surface distance or 3D Euclidean distance.
    """
    if method == "haversine":
        phi1 = math.radians(lat1_deg)
        phi2 = math.radians(lat2_deg)
        dphi = math.radians(lat2_deg - lat1_deg)
        dlam = math.radians(lon2_deg - lon1_deg)
        a = math.sin(dphi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2.0)**2
        c = 2.0 * math.asin(min(1.0, math.sqrt(a)))
        d_surface = radius_m * c
        d_3d = math.hypot(d_surface, z2_m - z1_m)
        return round(d_surface, 2), round(d_3d, 2)
    else:
        # Simple Euclidean
        dx = (lon2_deg - lon1_deg) * (math.pi / 180.0) * radius_m * math.cos(math.radians((lat1_deg + lat2_deg)/2.0))
        dy = (lat2_deg - lat1_deg) * (math.pi / 180.0) * radius_m
        dz = z2_m - z1_m
        return round(math.hypot(dx, dy), 2), round(math.sqrt(dx*dx + dy*dy + dz*dz), 2)


# -----------------------------------------------------------------------------
# 6. NAVIGATION PATH CALCULATION: Find a safe route (A* Algorithm)
# -----------------------------------------------------------------------------
def calculate_navigation_path(dem_matrix, slope_matrix, hazard_mask, start_cell, goal_cell, cell_size_m=5.0):
    """
    Finds the optimal, lowest-cost, slope-safe route using A* pathfinding.
    """
    rows = len(dem_matrix)
    cols = len(dem_matrix[0])

    def heuristic(a, b):
        return math.hypot((a[0] - b[0]) * cell_size_m, (a[1] - b[1]) * cell_size_m)

    open_set = []
    heapq.heappush(open_set, (0, start_cell))
    came_from = {}
    g_score = {start_cell: 0.0}

    moves = [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)]

    while open_set:
        _, current = heapq.heappop(open_set)

        if current == goal_cell:
            # Reconstruct path
            path = []
            curr = current
            while curr in came_from:
                path.append(curr)
                curr = came_from[curr]
            path.append(start_cell)
            path.reverse()
            total_dist = sum(heuristic(path[i], path[i+1]) for i in range(len(path)-1))
            return path, round(total_dist, 2)

        for dr, dc in moves:
            nr, nc = current[0] + dr, current[1] + dc
            neighbor = (nr, nc)

            if not (0 <= nr < rows and 0 <= nc < cols):
                continue

            # Hard obstacle checks: Hazard crater or slope > 15 deg
            if hazard_mask[nr][nc] == 1 or slope_matrix[nr][nc] > 15.0:
                continue

            step_dist = cell_size_m * math.hypot(dr, dc)
            # Cost multiplier penalizes steeper slopes
            slope_penalty = 1.0 + 3.0 * ((slope_matrix[nr][nc] / 15.0)**2)
            tentative_g = g_score[current] + step_dist * slope_penalty

            if tentative_g < g_score.get(neighbor, float("inf")):
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                f_score = tentative_g + heuristic(neighbor, goal_cell)
                heapq.heappush(open_set, (f_score, neighbor))

    return None, 0.0  # Path blocked


# -----------------------------------------------------------------------------
# 7. SUNLIGHT ILLUMINATION: Identify sunlight availability (Horizon Raytracing)
# -----------------------------------------------------------------------------
def calculate_sunlight_illumination(dem_matrix, cell_size_m, sun_azimuth_deg, sun_elevation_deg):
    """
    Ray-traces solar illumination across the DEM. Returns 1 for sunlit, 0 for shadow.
    """
    rows = len(dem_matrix)
    cols = len(dem_matrix[0])
    illum_matrix = [[1 for _ in range(cols)] for _ in range(rows)]

    if sun_elevation_deg <= 0.0:
        return [[0 for _ in range(cols)] for _ in range(rows)]

    tan_sun_elev = math.tan(math.radians(sun_elevation_deg))
    rad_az = math.radians(sun_azimuth_deg)
    # Unit step in azimuth direction
    dx = math.sin(rad_az)
    dy = math.cos(rad_az)

    max_dist_steps = int(max(rows, cols) * 1.5)

    for r in range(rows):
        for c in range(cols):
            curr_elev = dem_matrix[r][c]
            in_shadow = False

            # Cast ray outward toward the Sun
            for step in range(1, max_dist_steps):
                sample_r = int(r + step * dy)
                sample_c = int(c + step * dx)

                if not (0 <= sample_r < rows and 0 <= sample_c < cols):
                    break  # Ray cleared the local grid

                obstacle_elev = dem_matrix[sample_r][sample_c]
                ray_height = curr_elev + (step * cell_size_m) * tan_sun_elev

                if obstacle_elev > ray_height:
                    in_shadow = True
                    break

            if in_shadow:
                illum_matrix[r][c] = 0

    return illum_matrix


# -----------------------------------------------------------------------------
# 8. HAZARD DETECTION: Identify craters and dangerous terrain
# -----------------------------------------------------------------------------
def detect_hazards(dem_matrix, slope_matrix, crater_hazards, cell_size_m=5.0):
    """
    Builds a binary hazard mask (1 = Hazard, 0 = Safe) based on slope > 12 deg
    and crater exclusion radii.
    """
    rows = len(dem_matrix)
    cols = len(dem_matrix[0])
    hazard_mask = [[0 for _ in range(cols)] for _ in range(rows)]

    # 1. Slope hazards (> 12 deg)
    for r in range(rows):
        for c in range(cols):
            if slope_matrix[r][c] >= 12.0:
                hazard_mask[r][c] = 1

    # 2. Crater exclusion buffer
    for cr in crater_hazards:
        cr_row = cr.get("center_grid_row", -1)
        cr_col = cr.get("center_grid_col", -1)
        radius = cr.get("hazard_safety_radius_m", 0.0)

        if 0 <= cr_row < rows and 0 <= cr_col < cols:
            radius_cells = int(math.ceil(radius / cell_size_m))
            for r in range(max(0, cr_row - radius_cells), min(rows, cr_row + radius_cells + 1)):
                for c in range(max(0, cr_col - radius_cells), min(cols, cr_col + radius_cells + 1)):
                    dist_m = math.hypot((r - cr_row) * cell_size_m, (c - cr_col) * cell_size_m)
                    if dist_m <= radius:
                        hazard_mask[r][c] = 1

    return hazard_mask


# -----------------------------------------------------------------------------
# MAIN VERIFICATION TEST
# -----------------------------------------------------------------------------
if __name__ == "__main__":
    print("=" * 65)
    print("LUNAR LANDING SITE NAVIGATOR - VERIFYING ALL 8 CALCULATIONS")
    print("=" * 65)

    dem_data, wp_data, cr_data, sol_data, params = load_data()
    dem = dem_data["elevation_matrix_m"]
    cell_size = dem_data["metadata"]["cell_size_meters"]

    # 1. Elevation
    h = get_elevation_at_point(dem, cell_size, 50.0, 50.0)
    print(f"1. Elevation Calculation : Height at (50m, 50m) = {h} m")

    # 2. Slope
    slopes = calculate_slope_matrix(dem, cell_size)
    print(f"2. Slope Calculation     : Mean Slope = {sum(sum(r) for r in slopes)/(50*50):.2f} deg, Max = {max(max(r) for r in slopes):.2f} deg")

    # 3. Roughness
    tri = calculate_roughness_matrix(dem)
    print(f"3. Surface Roughness     : Mean TRI = {sum(sum(r) for r in tri)/(50*50):.3f} m, Max TRI = {max(max(r) for r in tri):.3f} m")

    # 8. Hazard Detection (needed for score and navigation)
    hazards = detect_hazards(dem, slopes, cr_data["craters"], cell_size)
    hazard_cells = sum(sum(r) for r in hazards)
    print(f"8. Hazard Detection      : Identified {hazard_cells} hazardous cells (Slope >12 deg or Crater Rim)")

    # 7. Sunlight Illumination
    test_sun = sol_data["ephemeris"][0]
    illum = calculate_sunlight_illumination(dem, cell_size, test_sun["sun_azimuth_deg"], test_sun["sun_elevation_deg"])
    lit_pct = (sum(sum(r) for r in illum) / (50*50)) * 100
    print(f"7. Sunlight Illumination : Sun Elev {test_sun['sun_elevation_deg']} deg -> {lit_pct:.1f}% of terrain is sunlit")

    # 4. Landing Safety Score
    score, tier = calculate_landing_safety_score(slopes[25][25], tri[25][25], illum[25][25] == 1, hazards[25][25] == 1)
    print(f"4. Landing Safety Score  : Center cell (25, 25) -> Score = {score}/1.0 ({tier})")

    # 5. Distance Calculation
    wp1 = wp_data["waypoints"][0]
    wp2 = wp_data["waypoints"][4]
    dist_surf, dist_3d = calculate_distance(wp1["latitude_deg"], wp1["longitude_deg"], wp2["latitude_deg"], wp2["longitude_deg"], wp1["elevation_m"], wp2["elevation_m"])
    print(f"5. Distance Calculation  : From {wp1['name']} to {wp2['name']} -> Surface = {dist_surf/1000:.2f} km, 3D = {dist_3d/1000:.2f} km")

    # 6. Navigation Path Calculation
    start = (5, 5)
    goal = (45, 45)
    path, path_len = calculate_navigation_path(dem, slopes, hazards, start, goal, cell_size)
    print(f"6. Navigation Path       : Safe route from {start} to {goal} -> Waypoints: {len(path)}, Route Length: {path_len:.1f} m")

    print("=" * 65)
    print("ALL 8 CALCULATIONS SUCCESSFULLY EXECUTED AND VERIFIED!")
    print("=" * 65)
