import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Eye, Sun, Layers, ShieldCheck, RefreshCw } from 'lucide-react';

export default function LunarTerrain3D({ site, activeLayer = 'elevation', onLayerChange }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const terrainMeshRef = useRef(null);
  const sunLightRef = useRef(null);
  const animFrameRef = useRef(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  const [wireframe, setWireframe] = useState(false);
  const [sunAngleDeg, setSunAngleDeg] = useState(1.5);
  const [showLandingEllipse, setShowLandingEllipse] = useState(true);

  // Generate scientific vertex heights & colors based on each site's specific topography
  const generateTerrainData = (siteId, layerMode) => {
    const gridRes = 64;
    const size = 120;
    const geo = new THREE.PlaneGeometry(size, size, gridRes - 1, gridRes - 1);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const distFromCenter = Math.sqrt(x * x + z * z);

      let y = 0;

      if (siteId === 'site-beta') {
        // Malapert Mountain: elevated summit plateau with gentle slopes
        const baseMassif = Math.exp(-(distFromCenter * distFromCenter) / 1300) * 19;
        const plateauFlatness = distFromCenter < 28 ? 0.25 : 1.0;
        const subtleNoise = (Math.sin(x * 0.15) * Math.cos(z * 0.15) + Math.sin(x * 0.4) * 0.3) * 0.8 * plateauFlatness;
        y = baseMassif + subtleNoise;
      } else if (siteId === 'site-alpha') {
        // Shackleton Rim: narrow rim crest, precipitous inner crater drop-off
        if (x < 5) {
          y = 13 - Math.pow((5 - x) * 0.28, 1.8) * 4.2;
        } else {
          y = 13 - (x - 5) * 0.38 + Math.sin(z * 0.15) * 1.5;
        }
        const crater1 = Math.exp(-((x - 12) * (x - 12) + (z - 15) * (z - 15)) / 25) * 4;
        y -= crater1;
      } else if (siteId === 'site-connecting') {
        // Connecting Ridge: prominent spine ridge connecting high terrain
        const ridgeProfile = Math.exp(-(x * x) / 250) * 15;
        const undulatingSpine = Math.sin(z * 0.12) * 2.5;
        const flanks = -Math.abs(x) * 0.22;
        y = ridgeProfile + undulatingSpine + flanks;
      } else if (siteId === 'site-nobile') {
        // Nobile Rim 1: broad terraced rim with rolling hills
        const terrace = Math.sin(distFromCenter * 0.12) * 4 + Math.exp(-(distFromCenter * distFromCenter) / 1800) * 12;
        const hummocks = (Math.sin(x * 0.25) * Math.cos(z * 0.25)) * 1.5;
        y = terrace + hummocks;
      } else {
        // de Gerlache Rim 1: asymmetric crater wall
        const rimAngle = Math.atan2(z, x);
        const rimElev = Math.sin(rimAngle * 2) * 3 + Math.exp(-Math.pow(distFromCenter - 30, 2) / 300) * 14;
        y = rimElev - (distFromCenter < 30 ? (30 - distFromCenter) * 0.3 : (distFromCenter - 30) * 0.2);
      }

      pos.setY(i, y);

      // Color computation based on activeLayer
      const colorIdx = i * 3;
      if (layerMode === 'elevation') {
        const normY = Math.max(0, Math.min(1, (y + 12) / 32));
        if (normY < 0.3) {
          colors[colorIdx] = 0.08; colors[colorIdx + 1] = 0.22; colors[colorIdx + 2] = 0.45;
        } else if (normY < 0.6) {
          colors[colorIdx] = 0.2; colors[colorIdx + 1] = 0.65; colors[colorIdx + 2] = 0.75;
        } else if (normY < 0.85) {
          colors[colorIdx] = 0.85; colors[colorIdx + 1] = 0.65; colors[colorIdx + 2] = 0.2;
        } else {
          colors[colorIdx] = 0.95; colors[colorIdx + 1] = 0.95; colors[colorIdx + 2] = 1.0;
        }
      } else if (layerMode === 'slope') {
        const slopeBias = siteId === 'site-beta' ? 4 : siteId === 'site-connecting' ? 6 : siteId === 'site-nobile' ? 8 : 12;
        const localSlope = (Math.abs(Math.sin(x * 0.2)) + Math.abs(Math.cos(z * 0.2))) * 6 + slopeBias;
        if (localSlope < 7) {
          colors[colorIdx] = 0.1; colors[colorIdx + 1] = 0.85; colors[colorIdx + 2] = 0.4; // Safe Green
        } else if (localSlope < 11) {
          colors[colorIdx] = 0.95; colors[colorIdx + 1] = 0.75; colors[colorIdx + 2] = 0.15; // Caution Yellow
        } else {
          colors[colorIdx] = 0.92; colors[colorIdx + 1] = 0.22; colors[colorIdx + 2] = 0.22; // Hazard Red
        }
      } else {
        // Illumination shadow shading
        const sunRad = (sunAngleDeg * Math.PI) / 180;
        const facing = (Math.sin(x * 0.1) * Math.sin(sunRad) + 0.5);
        const shadow = y < 2 ? 0.1 : Math.max(0.15, facing);
        colors[colorIdx] = shadow; colors[colorIdx + 1] = shadow * 0.95; colors[colorIdx + 2] = shadow * 1.05;
      }
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 75, 115);
    camera.lookAt(0, 5, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Grazing low-angle Polar Sunlight
    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.8);
    const sunDist = 200;
    const rad = (sunAngleDeg * Math.PI) / 180;
    sunLight.position.set(sunDist * Math.cos(rad), sunDist * Math.sin(rad), 40);
    sunLight.castShadow = true;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    const ambientLight = new THREE.AmbientLight(0x0f172a, 0.5);
    scene.add(ambientLight);

    // Terrain Mesh
    const terrainGeo = generateTerrainData(site.id, activeLayer);
    const terrainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.88,
      metalness: 0.05,
      wireframe,
      flatShading: false,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    terrainMesh.castShadow = true;
    scene.add(terrainMesh);
    terrainMeshRef.current = terrainMesh;

    // Touchdown 100m Target Ellipse Ring
    if (showLandingEllipse) {
      const ellipseGeo = new THREE.RingGeometry(11, 13, 32);
      const ellipseMat = new THREE.MeshBasicMaterial({
        color: 0x00f5d4,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const ellipseMesh = new THREE.Mesh(ellipseGeo, ellipseMat);
      ellipseMesh.rotation.x = -Math.PI / 2;
      ellipseMesh.position.set(0, site.id === 'site-beta' ? 18.2 : site.id === 'site-connecting' ? 14.8 : 12.5, 0);
      scene.add(ellipseMesh);

      // Central landing flag beacon
      const flagGeo = new THREE.CylinderGeometry(0.3, 0.3, 16);
      const flagMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });
      const flag = new THREE.Mesh(flagGeo, flagMat);
      flag.position.set(0, (site.id === 'site-beta' ? 18.2 : site.id === 'site-connecting' ? 14.8 : 12.5) + 8, 0);
      scene.add(flag);
    }

    // Pointer Drag Rotation
    const handlePointerDown = (e) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e) => {
      if (!isDraggingRef.current || !terrainMeshRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      terrainMeshRef.current.rotation.y += deltaX * 0.008;
      camera.position.y = Math.max(25, Math.min(140, camera.position.y - deltaY * 0.3));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      if (!isDraggingRef.current && terrainMeshRef.current) {
        terrainMeshRef.current.rotation.y += 0.0012;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [site.id, activeLayer, wireframe, sunAngleDeg, showLandingEllipse]);

  return (
    <div className="relative w-full h-[380px] bg-slate-950/90 rounded-xl overflow-hidden border border-slate-800">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Toolbar Controls */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 bg-slate-950/80 p-1 rounded-lg border border-slate-800 backdrop-blur-md text-xs font-mono">
        <button
          onClick={() => setWireframe(!wireframe)}
          className={`px-2.5 py-1 rounded transition-all ${
            wireframe ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          {wireframe ? 'SOLID' : 'WIREFRAME'}
        </button>
        <button
          onClick={() => setShowLandingEllipse(!showLandingEllipse)}
          className={`px-2.5 py-1 rounded transition-all ${
            showLandingEllipse ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          {showLandingEllipse ? 'ELLIPSE ON' : 'ELLIPSE OFF'}
        </button>
      </div>

      {/* Sun elevation slider */}
      <div className="absolute bottom-3 right-3 z-10 bg-slate-950/85 px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur-md text-[11px] font-mono text-slate-300 flex items-center space-x-2">
        <Sun className="w-3.5 h-3.5 text-amber-400" />
        <span>SUN ELEVATION: {sunAngleDeg}°</span>
        <input
          type="range"
          min="0"
          max="5"
          step="0.5"
          value={sunAngleDeg}
          onChange={(e) => setSunAngleDeg(parseFloat(e.target.value))}
          className="w-20 accent-amber-400 cursor-pointer"
        />
      </div>
    </div>
  );
}
