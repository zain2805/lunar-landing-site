# Lunar Landing Site Navigator: Setup & Run Guide
## NASA Space Apps Challenge 2026

### Quickstart (1-Click Run on Windows)
Simply double-click the included batch file at the root of the project:
```bash
start_navigator.bat
```
This automatically boots the backend server and opens `http://localhost:8000/` in your default browser!

---

### Manual Start via Command Line

#### 1. Requirements
* Python 3.8+ (Zero third-party dependencies required; runs entirely on Python standard library!)
* Any modern web browser (Chrome, Edge, Firefox, Safari).

#### 2. Start the Backend Server
```bash
cd backend
python server.py
```
Output:
```text
[*] Initializing Lunar Calculation Engine...
[+] Calculation Engine initialized successfully.
=================================================================
[*] LUNAR LANDING SITE NAVIGATOR - BACKEND SERVER
[*] Web Navigator URL : http://localhost:8000/
[*] REST API Base URL : http://localhost:8000/api/health
[*] Serving Frontend  : /path/to/frontend
[*] Calculation Data  : /path/to/data
=================================================================
```

#### 3. Run the Backend Test Suite
To verify all 8 calculation modules and tests:
```bash
cd backend
python test_backend.py
```

#### 4. Optional: Host on GitHub Pages
The frontend is built with auto-fallback capabilities:
* If the backend server is running, it queries the live REST API at `http://localhost:8000/api`.
* If deployed statically on GitHub Pages, it falls back seamlessly to the pre-calculated NASA datasets, ensuring the app always functions without a live server!
