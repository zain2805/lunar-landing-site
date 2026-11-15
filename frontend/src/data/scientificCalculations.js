/**
 * LUNAR LANDING SITE NAVIGATOR - SCIENTIFIC CALCULATION ENGINE
 * Implements rigorous astronomical, physical, and terrain formulas.
 */

import { LUNAR_CONSTANTS } from './lunarSitesData';

/**
 * 1. Solar Elevation Angle (alpha_sun) & Solar Incidence Angle (theta_inc)
 * @param {number} latitudeDeg Selenographic latitude (-90 to +90)
 * @param {number} subsolarLatDeg Subsolar latitude (-1.54 to +1.54 due to lunar obliquity)
 * @param {number} hourInCycle Hour in synodic month (0 to 708.7)
 * @returns {{ elevationDeg: number, incidenceDeg: number, isDaylight: boolean }}
 */
export function calculateSolarAngles(latitudeDeg, subsolarLatDeg = 1.2, hourInCycle = 150) {
  const phi = (latitudeDeg * Math.PI) / 180;
  const delta = (subsolarLatDeg * Math.PI) / 180;
  // Hour angle h: rotates 360 deg in 708.7 hours (0.508 deg / hour)
  const h = ((hourInCycle % LUNAR_CONSTANTS.SYNODIC_MONTH_HOURS) / LUNAR_CONSTANTS.SYNODIC_MONTH_HOURS) * 2 * Math.PI;

  // sin(alpha) = sin(phi)*sin(delta) + cos(phi)*cos(delta)*cos(h)
  const sinAlpha = Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(h);
  const elevationRad = Math.asin(Math.max(-1, Math.min(1, sinAlpha)));
  const elevationDeg = (elevationRad * 180) / Math.PI;

  // theta_inc = 90 - alpha
  const incidenceDeg = 90 - elevationDeg;

  return {
    elevationDeg: Number(elevationDeg.toFixed(2)),
    incidenceDeg: Number(incidenceDeg.toFixed(2)),
    isDaylight: elevationDeg > -0.25, // Grazing polar sunlight threshold
  };
}

/**
 * 2. Instantaneous Solar Power Generation
 * @param {number} panelAreaM2 Array area (m²)
 * @param {number} efficiency Panel efficiency (0 to 1, e.g. 0.28 for triple-junction GaAs)
 * @param {number} incidenceAngleDeg Sun angle relative to panel normal
 * @param {boolean} tracking Whether array tracks the low polar sun azimuth
 * @returns {number} Power in Watts
 */
export function calculateSolarPower(panelAreaM2 = 30, efficiency = 0.28, incidenceAngleDeg = 88, tracking = true) {
  // If tracking vertically along the horizon at the poles, cos(effective angle) is high
  const effectiveAngle = tracking ? Math.min(15, Math.abs(incidenceAngleDeg - 88)) : incidenceAngleDeg;
  const cosTheta = Math.max(0, Math.cos((effectiveAngle * Math.PI) / 180));
  const powerWatts = panelAreaM2 * efficiency * LUNAR_CONSTANTS.SOLAR_CONSTANT_W_M2 * cosTheta;
  return Math.max(0, Number(powerWatts.toFixed(1)));
}

/**
 * 3. Required Battery Storage Capacity (kWh)
 * @param {number} basePowerKW Lander baseline continuous survival power
 * @param {number} darknessHours Longest continuous darkness duration (hours)
 * @param {number} depthOfDischarge Safe battery discharge limit (e.g. 0.80)
 * @returns {number} Energy capacity in kWh
 */
export function calculateBatteryRequirement(basePowerKW = 1.5, darknessHours = 54, depthOfDischarge = 0.80) {
  const energyKWh = (basePowerKW * darknessHours) / depthOfDischarge;
  return Number(energyKWh.toFixed(1));
}

/**
 * 4. Earth Elevation Angle & Libration
 * @param {number} latitudeDeg Selenographic latitude (-90 to +90)
 * @param {number} longitudeDeg Selenographic longitude (-180 to +180)
 * @param {number} librationLatDeg Optical/physical libration in latitude (-6.7 to +6.7)
 * @param {number} librationLonDeg Libration in longitude (-7.9 to +7.9)
 * @returns {{ earthElevationDeg: number, isDirectLOS: boolean }}
 */
export function calculateEarthVisibility(latitudeDeg, longitudeDeg, librationLatDeg = 3.2, librationLonDeg = 1.5) {
  const phi = (latitudeDeg * Math.PI) / 180;
  const lambda = (longitudeDeg * Math.PI) / 180;
  const b0 = (librationLatDeg * Math.PI) / 180;
  const l0 = (librationLonDeg * Math.PI) / 180;

  // Direction cosine towards sub-Earth point:
  // cos(c) = sin(phi)*sin(b0) + cos(phi)*cos(b0)*cos(lambda - l0)
  // Earth elevation angle above local horizon: alpha = 90 - c
  const cosC = Math.sin(phi) * Math.sin(b0) + Math.cos(phi) * Math.cos(b0) * Math.cos(lambda - l0);
  const earthElevationRad = Math.asin(Math.max(-1, Math.min(1, cosC)));
  const earthElevationDeg = (earthElevationRad * 180) / Math.PI;

  return {
    earthElevationDeg: Number(earthElevationDeg.toFixed(2)),
    isDirectLOS: earthElevationDeg > 0.5, // 0.5 deg minimum clearance over local rocks
  };
}

/**
 * 5. Light Time Delay (Speed of Light)
 * @param {number} distanceKm Instantaneous Moon-Earth distance (363,300 to 405,500 km)
 * @returns {{ oneWaySec: number, roundTripSec: number, oneWayMs: number, roundTripMs: number }}
 */
export function calculateSignalDelay(distanceKm = 384400) {
  const oneWaySec = distanceKm / LUNAR_CONSTANTS.SPEED_OF_LIGHT_KM_S;
  const roundTripSec = oneWaySec * 2;
  return {
    oneWaySec: Number(oneWaySec.toFixed(4)),
    roundTripSec: Number(roundTripSec.toFixed(4)),
    oneWayMs: Number((oneWaySec * 1000).toFixed(1)),
    roundTripMs: Number((roundTripSec * 1000).toFixed(1)),
  };
}

/**
 * 6. Radiative Equilibrium Surface Temperature
 * @param {number} elevationDeg Solar elevation angle (degrees)
 * @param {number} albedo Lunar regolith Bond albedo (~0.12)
 * @param {number} emissivity Infrared emissivity (~0.95)
 * @returns {{ tempKelvin: number, tempCelsius: number }}
 */
export function calculateSurfaceTemp(elevationDeg, albedo = 0.12, emissivity = 0.95) {
  const sigma = 5.670374e-8; // Stefan-Boltzmann constant W/(m^2 K^4)
  if (elevationDeg <= 0) {
    // Permanent shadow / lunar night deep cryogenic equilibrium with cosmic background & interior heat flow
    const psrTempK = 40.0;
    return {
      tempKelvin: psrTempK,
      tempCelsius: Number((psrTempK - 273.15).toFixed(1)),
    };
  }

  const sinTheta = Math.sin((elevationDeg * Math.PI) / 180);
  const absorbedFlux = (1 - albedo) * LUNAR_CONSTANTS.SOLAR_CONSTANT_W_M2 * Math.max(0.005, sinTheta);
  const tKelvin = Math.pow(absorbedFlux / (emissivity * sigma), 0.25);
  
  return {
    tempKelvin: Number(tKelvin.toFixed(1)),
    tempCelsius: Number((tKelvin - 273.15).toFixed(1)),
  };
}

/**
 * 7. Weighted Landing Suitability Score & AI Safety Interlock
 * Uses Analytical Hierarchy Process (AHP) with multi-attribute utility theory.
 * Critical safety rules:
 * - If maxSlope > 15°: Safety interlock trips (Crew safety priority!)
 * - If safeLandingArea < 60%: Risk warning!
 * - If longestDarkness > 200h: Prohibitive battery mass penalty!
 */
export function computeSuitabilityScore(site, weights = {
  solar: 0.22,
  comms: 0.20,
  slope: 0.25,
  boulders: 0.15,
  thermal: 0.10,
  waterIce: 0.08,
}) {
  // Normalize factors (0 - 100)
  const solarScore = site.solar.annualIlluminationPct;
  const commsScore = site.communication.earthVisibilityPct;
  // Benign slope: 0° is 100, 15° is 0
  const slopeScore = Math.max(0, Math.min(100, 100 - (site.terrain.avgSlopeDeg / 15) * 100));
  // Boulder score: 0 boulders is 100, 15 boulders is 0
  const boulderScore = Math.max(0, Math.min(100, 100 - (site.terrain.boulderDensityPer100m2 / 15) * 100));
  const thermalScore = site.thermal.thermalSuitabilityScore;
  const iceScore = site.science.waterIceProspectScore;

  const rawWeightedScore =
    solarScore * weights.solar +
    commsScore * weights.comms +
    slopeScore * weights.slope +
    boulderScore * weights.boulders +
    thermalScore * weights.thermal +
    iceScore * weights.waterIce;

  // HARD SAFETY INTERLOCK CHECK
  let safetyGated = false;
  let safetyViolations = [];

  if (site.terrain.avgSlopeDeg > 12) {
    safetyGated = true;
    safetyViolations.push('Excessive rim slope (>12°) poses tip-over risk for Human Landing System.');
  }
  if (site.terrain.safeLandingAreaPct < 65) {
    safetyGated = true;
    safetyViolations.push('Constrained safe landing area (<65%) requires precision Terrain-Relative Navigation.');
  }
  if (site.solar.longestDarknessDurationHours > 200) {
    safetyGated = true;
    safetyViolations.push('Unmanageable darkness duration (>200h) requires prohibitive battery payload mass.');
  }

  return {
    weightedScore: Number(rawWeightedScore.toFixed(1)),
    safetyGated,
    safetyViolations,
    breakdown: {
      solarScore: Number(solarScore.toFixed(1)),
      commsScore: Number(commsScore.toFixed(1)),
      slopeScore: Number(slopeScore.toFixed(1)),
      boulderScore: Number(boulderScore.toFixed(1)),
      thermalScore: Number(thermalScore.toFixed(1)),
      iceScore: Number(iceScore.toFixed(1)),
    }
  };
}
