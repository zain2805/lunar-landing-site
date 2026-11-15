# 🚀 LUNAR LANDING SITE NAVIGATOR (NASA MOON TREK)

An advanced, cinematic, interactive 3D and scientifically functional lunar mission analysis platform designed to evaluate three candidate lunar landing locations in the South Polar region (Malapert Mountain, Shackleton Crater Rim, and Haworth Crater) and identify the most suitable site for future crewed and robotic lunar exploration.

---

## 🌟 Key Architecture & Features

### Part 1: Cinematic Website Opening
- **Scene 1: Solar System Appearance**
  - Cosmic darkness fading into a twinkling starfield (6,000+ stars).
  - Sun illumination with coronal solar flare and dynamic lighting.
  - Realistic 3D planetary orbits (Mercury, Venus, Earth with orbiting Moon, Mars, Jupiter, Saturn with rings).
  - Seamless orbital camera flight towards the Moon with procedural ambient space synthesizer pads.
- **Scene 2: Zoom Towards the Moon**
  - Smooth camera approach towards the lunar South Pole.
  - Procedural lunar surface rendering with high-resolution crater morphometry, Maria, and grazing terminator shadows.
  - Cinematic title sequence: **NASA MOON TREK - LUNAR LANDING SITE NAVIGATOR**.
- **Scene 3: Professional Female Voice Narration**
  - Real-time voice narration: *"Welcome to NASA Moon Trek. Explore the lunar surface, analyse potential landing locations, and discover the most suitable destination for future lunar exploration missions. Your journey into the Moon begins now."*
  - Synchronized speech with volume, narration toggle, and mute controls.
- **Scene 4: Glowing Get Started Button**
  - Interactive call-to-action with shimmer sweep, Skip Intro button, and sound controls.

### Part 2: Milky Way Galaxy Transition
- High-speed interstellar transit through a 3D Milky Way spiral galaxy (14,000+ colored nebula particles).
- Dynamic transition soundtrack with Doppler shift sound effects.
- Continuous camera warp diving directly into the lunar South Polar coordinate grid.

### Part 3: Aerospace Mission Control Dashboard
- Deep space aerospace theme (deep navy `#050b1a`, pitch black `#030712`, electric blue `#00d2ff`, cyan `#00f5d4`, subtle purple `#a855f7`).
- Real-time Mission Elapsed Time (MET) clock, DSN Goldstone 70m link lock, and subsolar ephemeris telemetry.
- Interactive 3D Lunar Globe with draggable rotation, South Pole perspective, and pulsing site beacon markers.

### Part 4: Eight Fully Functional Analysis Modules
1. **DASHBOARD (`01`)**: Overview of the three landing locations, coordinates, scientific scorecards, and live telemetry feeds.
2. **SITE EXPLORER (`02`)**: In-depth inspection of Malapert Mountain, Shackleton Rim, and Haworth Crater with 3D terrain meshes, LROC high-res orthomosaics with boulder tags, and LOLA cross-section transect curves.
3. **SOLAR ANALYSIS (`03`)**: All 8 scientific solar calculations (incidence angle, solar elevation, sunlight/darkness hours, illumination %, solar array power yield in Watts, battery storage in kWh, solar constant, and Stefan-Boltzmann equilibrium temp). Features an interactive 708.7-hour synodic cycle simulation scrubber (Play/Pause/Speed) and solar array sizing calculator.
4. **COMMUNICATION ANALYSIS (`04`)**: All 7 scientific communication calculations (Earth elevation angle, direct line-of-sight status, visibility %, blackout windows, speed-of-light one-way and round-trip propagation delays, libration oscillations). Features an Earth polar azimuth-elevation radar skyplot and Deep Space Network (DSN) ground station status monitor.
5. **TERRAIN ANALYSIS (`05`)**: 10 scientific calculations (LOLA elevation, micro-topography slope angles, surface roughness Hurst exponent, crater density $N(D>20m)$, crater hazards, boulder count per $100m^2$, safe landing area %, surface temperatures $35 K - 228 K$, thermal suitability, and flight hazard classifications). Includes interactive 3D terrain with slope heatmaps and 100m landing ellipse footprints.
6. **COMPARISON ENGINE (`06`)**: Side-by-side trade-off matrix across all 14 specified scientific parameters, pros & cons, operational risk assessments, and an interactive Multi-Criteria Decision Analysis (MCDA) weight simulator.
7. **AI RECOMMENDATION (`07`)**: Explainable AI ranking system based on the Analytic Hierarchy Process (AHP) with strict flight safety interlock gates (slope $\le 12^\circ$, safe area $\ge 65\%$, darkness $\le 200h$). Explains why Malapert Mountain is the primary crewed landing site, while Shackleton is a secondary scientific target and Haworth is gated out for early human landing due to cryogenic and shadow hazards.
8. **INTERACTIVE VISUALIZATION (`08`)**: Full-sandbox 3D terrain environment with layer switching (Elevation, Slope heatmap, Grazing polar illumination with real-time shadow casting), distance & elevation measurement ruler tool, and live surface telemetry readouts.

---

## 🛠️ Technology Stack

- **Frontend**: React.js 18, Vite 5, Tailwind CSS, Lucide React
- **3D Graphics & Animations**: Three.js (WebGL), Canvas Procedural Textures & Shaders
- **Audio & Speech Engine**: Web Audio API Procedural Synthesizer, Web Speech API Narration Engine
- **Backend**: Python 3, FastAPI, Uvicorn, Pydantic
- **Scientific Computations**: NumPy, SciPy (IAU 2015 Mean Earth/Polar Axis frame, NASA LOLA, LROC, DLRE, SPICE ephemerides)
- **Testing**: Pytest

---

## 🚀 How to Run

### Frontend (React + Vite)
```powershell
cd C:\Users\lenovo\.gemini\antigravity\scratch\lunar-landing-navigator
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) or the port displayed in your browser.

### Backend (Python FastAPI)
```powershell
cd C:\Users\lenovo\.gemini\antigravity\scratch\lunar-landing-navigator\backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation available at: [http://localhost:8000/docs](http://localhost:8000/docs)

### Run Backend Tests (Pytest)
```powershell
cd C:\Users\lenovo\.gemini\antigravity\scratch\lunar-landing-navigator\backend
python -m pytest test_api.py -v
```
