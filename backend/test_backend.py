r"""
Test Suite for Lunar Landing Site Navigator Backend
Verifies all 8 calculations and API endpoints
"""

import os
import sys
import unittest
from calculator import LunarCalculator

class TestLunarBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.calc = LunarCalculator()

    def test_01_elevation(self):
        elev = self.calc.get_elevation(50.0, 50.0)
        self.assertIsInstance(elev, float)
        self.assertGreater(elev, 4000.0)  # High South Pole ridge
        print(f"[TEST 1 PASS] Elevation at (50, 50): {elev} m")

    def test_02_slope(self):
        self.assertEqual(len(self.calc.slope_grid), self.calc.rows)
        self.assertEqual(len(self.calc.slope_grid[0]), self.calc.cols)
        mean_slope = sum(sum(r) for r in self.calc.slope_grid) / (self.calc.rows * self.calc.cols)
        self.assertGreater(mean_slope, 0.0)
        print(f"[TEST 2 PASS] Mean slope: {mean_slope:.2f} deg")

    def test_03_roughness(self):
        self.assertEqual(len(self.calc.roughness_grid), self.calc.rows)
        mean_tri = sum(sum(r) for r in self.calc.roughness_grid) / (self.calc.rows * self.calc.cols)
        self.assertGreater(mean_tri, 0.0)
        print(f"[TEST 3 PASS] Mean roughness (TRI): {mean_tri:.3f} m")

    def test_04_safety_score(self):
        # Flat, sunlit, safe cell
        score_safe, tier_safe = self.calc.calculate_safety_score(3.2, 0.25, is_sunlit=True, is_hazard=False)
        self.assertGreaterEqual(score_safe, 0.6)
        # Steep cell > 10 deg
        score_steep, tier_steep = self.calc.calculate_safety_score(14.5, 0.4, is_sunlit=True, is_hazard=False)
        self.assertEqual(score_steep, 0.0)
        print(f"[TEST 4 PASS] Safety score: safe={score_safe} ({tier_safe}), steep={score_steep} ({tier_steep})")

    def test_05_distance(self):
        # Malapert to Haworth
        d_surf, d_3d = self.calc.calculate_distance(-85.9, 0.0, -87.5, -5.0, 5120.0, 1250.0)
        self.assertGreater(d_surf, 40000.0)  # > 40 km
        self.assertGreater(d_3d, d_surf)
        print(f"[TEST 5 PASS] Distance: surface={d_surf/1000:.2f} km, 3D={d_3d/1000:.2f} km")

    def test_06_navigation_path(self):
        res = self.calc.find_safe_navigation_path((5, 5), (45, 45))
        self.assertEqual(res["status"], "success")
        self.assertGreater(res["waypoint_count"], 10)
        self.assertLessEqual(res["max_slope_on_path_deg"], 15.0)
        print(f"[TEST 6 PASS] Navigation route: {res['waypoint_count']} waypoints, {res['total_distance_m']:.1f} m")

    def test_07_illumination(self):
        illum_sun = self.calc.calculate_illumination_map(310.0, 0.5)
        sunlit_count = sum(sum(r) for r in illum_sun)
        self.assertGreater(sunlit_count, 0)
        illum_dark = self.calc.calculate_illumination_map(310.0, -0.5)
        self.assertEqual(sum(sum(r) for r in illum_dark), 0)
        print(f"[TEST 7 PASS] Illumination ray-tracing: {sunlit_count} sunlit cells in daylight, 0 in night")

    def test_08_hazards(self):
        hazards = self.calc.hazard_grid
        hazard_cells = sum(sum(r) for r in hazards)
        self.assertGreater(hazard_cells, 0)
        print(f"[TEST 8 PASS] Hazard detection: {hazard_cells} hazard cells identified")

if __name__ == "__main__":
    unittest.main()
