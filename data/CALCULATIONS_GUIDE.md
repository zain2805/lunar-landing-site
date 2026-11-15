# Lunar Landing Site Navigator: Core Calculation Datasets
## NASA Space Apps Challenge 2026

This directory contains **only the data files and mathematical parameters strictly required for the 8 core calculation modules** of the Lunar Landing Site Navigator.

---

### Mapping: Calculations to Datasets

| # | Calculation Module | Purpose | Primary Data Files Used | Key Output Metric |
|---|---|---|---|---|
| **1** | **Elevation Calculation** | Find height of lunar terrain | `lunar_elevation_grid_5m.json` / `.csv` | Height $z$ in meters above lunar datum |
| **2** | **Slope Calculation** | Identify steep vs flat surfaces | `lunar_elevation_grid_5m.json`, `calculation_parameters.json` | Slope in degrees ($	ext{Slope} < 5^\circ$ flat, $>10^\circ$ steep) |
| **3** | **Surface Roughness** | Identify uneven terrain | `lunar_elevation_grid_5m.json` | Terrain Roughness Index (TRI in meters) |
| **4** | **Landing Safety Score** | Rank suitable landing locations | `calculation_parameters.json` + outputs from (2, 3, 7, 8) | Normalized Suitability Score $[0.0 - 1.0]$ |
| **5** | **Distance Calculation** | Calculate distance between lunar locations | `lunar_waypoints.json` / `.csv` | Haversine surface distance & 3D Euclidean distance (km) |
| **6** | **Navigation Path Calculation** | Find a safe rover traverse route | `lunar_elevation_grid_5m.json`, `crater_hazards.json` | Safe A* coordinate sequence & route length (m) |
| **7** | **Sunlight Illumination** | Identify sunlight availability | `solar_illumination_ephemeris.json` / `.csv` | Binary shadow mask (1=Sun, 0=Shadow) & solar flux ($	ext{W/m}^2$) |
| **8** | **Hazard Detection** | Identify craters and dangerous terrain | `crater_hazards.json` / `.csv` + slope grid | Binary hazard mask ($1 = 	ext{Hazard}$, $0 = 	ext{Safe}$) |

---

### Formulas Reference

#### 1. Elevation Calculation (Bilinear Interpolation)
$$z(x, y) = (1-dr)(1-dc)z_{00} + (1-dr)dc \cdot z_{01} + dr(1-dc)z_{10} + dr \cdot dc \cdot z_{11}$$

#### 2. Slope Calculation (Horn's Convolution)
$$rac{\partial z}{\partial x} = rac{(z_{++} + 2z_{+0} + z_{+-}) - (z_{-+} + 2z_{-0} + z_{--})}{8 \Delta x}, \quad rac{\partial z}{\partial y} = rac{(z_{++} + 2z_{0+} + z_{-+}) - (z_{+-} + 2z_{0-} + z_{--})}{8 \Delta y}$$
$$	ext{Slope}^\circ = rctan\left(\sqrt{\left(rac{\partial z}{\partial x}ight)^2 + \left(rac{\partial z}{\partial y}ight)^2}ight) 	imes rac{180}{\pi}$$

#### 3. Surface Roughness (Terrain Roughness Index - TRI)
$$	ext{TRI} = rac{1}{8}\sum_{i=-1}^{1}\sum_{j=-1}^{1} |z(r+i, c+j) - z(r, c)| \quad ((i,j) 
eq (0,0))$$

#### 4. Landing Safety Score (Multi-Criteria Evaluation)
$$	ext{LSI}(r, c) = \mathbf{1}_{	ext{safe}} \cdot \left[ 0.35 S_{	ext{slope}} + 0.20 S_{	ext{rough}} + 0.25 S_{	ext{illum}} + 0.20 S_{	ext{hazard}} ight]$$
where $\mathbf{1}_{	ext{safe}} = 0$ if $	ext{Slope} > 10^\circ$ or cell inside Crater Hazard Radius.

#### 5. Distance Calculation (Haversine & 3D)
$$d_{	ext{surface}} = 2 R rcsin\left(\sqrt{\sin^2\left(rac{\Delta \phi}{2}ight) + \cos\phi_1 \cos\phi_2 \sin^2\left(rac{\Delta \lambda}{2}ight)}ight), \quad d_{	ext{3D}} = \sqrt{d_{	ext{surface}}^2 + (z_2 - z_1)^2}$$

#### 6. Navigation Path Calculation (A* Algorithm)
$$	ext{Cost}(	ext{cell}_A 	o 	ext{cell}_B) = \Delta d 	imes \left(1.0 + 3.0 	imes \left(rac{	ext{Slope}}{15^\circ}ight)^2ight), \quad 	ext{Constraint: Slope} \le 15^\circ$$

#### 7. Sunlight Illumination (Horizon Ray-Tracing)
Ray-traced from point $(r, c)$ along Sun Azimuth $	heta_\odot$:
$$	ext{RayHeight}(k) = z(r, c) + k \cdot \Delta x \cdot 	an(lpha_\odot)$$
If any terrain obstacle $z(r_k, c_k) > 	ext{RayHeight}(k) \implies 	ext{Shadow (0)}$; else $	ext{Sunlit (1)}$.

#### 8. Hazard Detection (Crater & Slope Mask)
$$	ext{Hazard}(r, c) = egin{cases} 1 & 	ext{if } 	ext{Slope} \ge 12^\circ 	ext{ or } 	ext{Dist}(r, c, 	ext{CraterCenter}) \le R_{	ext{safety}} \ 0 & 	ext{otherwise} \end{cases}$$

---

### Executing All Calculations

Run the included calculator script directly from this folder:

```bash
python lunar_calculator.py
```
