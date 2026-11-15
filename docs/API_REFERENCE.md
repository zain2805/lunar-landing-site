# Lunar Landing Site Navigator: REST API Reference
## NASA Space Apps Challenge 2026

Base URL: `http://localhost:8000/api`

---

### Endpoints Overview

| Endpoint | Method | Query / Payload | Description |
|---|---|---|---|
| `/api/health` | `GET` | None | Returns backend status and calculation engine readiness. |
| `/api/overview` | `GET` | None | Returns all 12 candidate landing sites and science POIs with calculated metrics. |
| `/api/elevation` | `GET` | `?x=float&y=float` | Bilinear interpolation of terrain height at continuous metric coordinates. |
| `/api/slope` | `GET` | None | Regional slope summary: mean slope, max slope, flat terrain %, and steep hazard %. |
| `/api/roughness` | `GET` | None | Terrain Roughness Index (TRI) statistics across 5m elevation matrix. |
| `/api/safety-score` | `GET` / `POST` | `?slope=deg&roughness=tri&sunlit=bool&hazard=bool` | Multi-Criteria Decision Analysis landing suitability score [0.0 - 1.0] and ranking tier. |
| `/api/distance` | `GET` | `?lat1=&lon1=&lat2=&lon2=&z1=&z2=` | Great-circle surface distance (km) and true 3D spatial Euclidean distance (km). |
| `/api/navigation-path`| `POST` | `{"start_row": int, "start_col": int, "goal_row": int, "goal_col": int}` | A* safe traverse route avoiding slopes $>15^\circ$ and crater hazards. |
| `/api/illumination` | `GET` | `?azimuth=deg&elevation=deg` | Horizon ray-tracing shadow mask, % sunlit terrain, and solar power flux ($\text{W/m}^2$). |
| `/api/hazards` | `GET` | None | Crater hazard catalogs, safety buffers, and binary slope hazard coverage. |
| `/api/comparison` | `GET` | None | Complete 15-parameter comparison matrix across Artemis candidate landing sites. |

---

### Sample Responses

#### 1. Elevation Endpoint (`GET /api/elevation?x=50&y=50`)
```json
{
  "calculation": "1. Elevation Calculation",
  "x_m": 50.0,
  "y_m": 50.0,
  "elevation_m": 4832.04,
  "datum": "Lunar Reference Sphere (R=1737.4 km)"
}
```

#### 2. Navigation Path Endpoint (`POST /api/navigation-path`)
```json
{
  "start_row": 5,
  "start_col": 5,
  "goal_row": 45,
  "goal_col": 45
}
```
Response:
```json
{
  "status": "success",
  "waypoint_count": 49,
  "total_distance_m": 306.3,
  "max_slope_on_path_deg": 6.82,
  "path": [
    {"row": 5, "col": 5, "x_m": 25.0, "y_m": 25.0, "elevation_m": 4811.2, "slope_deg": 4.5},
    ...
  ]
}
```
