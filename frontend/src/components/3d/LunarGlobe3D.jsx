import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CANDIDATE_SITES } from '../../data/lunarSitesData';
import soundManager from '../audio/SoundManager';

export default function LunarGlobe3D({ selectedSiteId, onSelectSite, onSiteHover }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const moonMeshRef = useRef(null);
  const markersGroupRef = useRef(null);
  const animFrameRef = useRef(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  // Animation state for 360-degree rotation and camera zoom
  const targetAnimRef = useRef({
    isAnimating: false,
    startTime: 0,
    duration: 1600, // 1.6s smooth transition
    startRotY: 0,
    targetRotY: 0,
    startCamPos: new THREE.Vector3(),
    targetCamPos: new THREE.Vector3(),
    startLookAt: new THREE.Vector3(),
    targetLookAt: new THREE.Vector3(),
    currentLookAt: new THREE.Vector3(0, -30, 0),
  });

  // Convert lat/long to 3D Cartesian coordinates on sphere of radius R
  const latLongToVector3 = (lat, lon, radius) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  // Generate realistic procedural Moon surface canvas texture
  const createLunarSurfaceTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base anorthosite highland gray
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Maria (dark basalt plains)
    const maria = [
      { x: 300, y: 220, r: 120 }, // Mare Imbrium
      { x: 420, y: 200, r: 80 },  // Mare Serenitatis
      { x: 500, y: 220, r: 90 },  // Mare Tranquillitatis
      { x: 200, y: 240, r: 140 }, // Oceanus Procellarum
    ];
    maria.forEach(m => {
      const grad = ctx.createRadialGradient(m.x, m.y, 10, m.x, m.y, m.r);
      grad.addColorStop(0, 'rgba(28, 36, 48, 0.85)');
      grad.addColorStop(1, 'rgba(100, 116, 139, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Craters & dense south polar highland cratering
    for (let i = 0; i < 550; i++) {
      const x = Math.random() * canvas.width;
      // High crater density towards polar regions (y > 340)
      const y = Math.random() > 0.35 ? 330 + Math.random() * 180 : Math.random() * 512;
      const r = 1.5 + Math.random() * 14;

      ctx.strokeStyle = 'rgba(240, 246, 255, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0.2 * Math.PI, 1.2 * Math.PI);
      ctx.stroke();

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.arc(x, y, r * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1500);
    // South Polar viewpoint perspective
    camera.position.set(0, -95, 125);
    camera.lookAt(0, -25, 0);
    cameraRef.current = camera;
    targetAnimRef.current.currentLookAt.set(0, -25, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const dirLight = new THREE.DirectionalLight(0xfffaed, 2.4);
    dirLight.position.set(120, 30, 80);
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0x0a1b38, 0.65);
    scene.add(ambientLight);

    // Moon Globe
    const radius = 48;
    const moonGeo = new THREE.SphereGeometry(radius, 48, 48);
    const moonMat = new THREE.MeshStandardMaterial({
      map: createLunarSurfaceTexture(),
      roughness: 0.9,
      metalness: 0.05,
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    scene.add(moonMesh);
    moonMeshRef.current = moonMesh;

    // Atmospheric subtle rim glow
    const glowGeo = new THREE.SphereGeometry(radius * 1.025, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    moonMesh.add(glowMesh);

    // Polar Coordinate Latitude Rings (80° S, 85° S, 88° S)
    const addPolarRing = (lat, color = 0x00d2ff, opacity = 0.25) => {
      const radAtLat = radius * Math.cos((Math.abs(lat) * Math.PI) / 180);
      const yAtLat = -radius * Math.sin((Math.abs(lat) * Math.PI) / 180);
      const ringGeo = new THREE.BufferGeometry();
      const points = [];
      for (let i = 0; i <= 64; i++) {
        const th = (i / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(th) * radAtLat, yAtLat, Math.sin(th) * radAtLat));
      }
      ringGeo.setFromPoints(points);
      const ringMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
      const line = new THREE.Line(ringGeo, ringMat);
      moonMesh.add(line);
    };
    addPolarRing(-80, 0x00d2ff, 0.2);
    addPolarRing(-85, 0x00f5d4, 0.35);
    addPolarRing(-88, 0x38bdf8, 0.4);

    // Site Markers for all 5 sites
    const markersGroup = new THREE.Group();
    moonMesh.add(markersGroup);
    markersGroupRef.current = markersGroup;

    const markerObjects = [];

    CANDIDATE_SITES.forEach((site) => {
      const pos = latLongToVector3(site.coordinates.latitude, site.coordinates.longitude, radius + 0.6);

      const siteGroup = new THREE.Group();
      siteGroup.position.copy(pos);
      siteGroup.userData = { siteId: site.id, siteName: site.name, sitePos: pos };

      // Pin core sphere
      const isSelected = site.id === selectedSiteId;
      const pinColor = site.id === 'site-beta' ? 0x00f5d4 : site.id === 'site-connecting' ? 0x10b981 : site.id === 'site-alpha' ? 0x38bdf8 : site.id === 'site-nobile' ? 0xf59e0b : 0xe11d48;
      
      const pinGeo = new THREE.SphereGeometry(1.6, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: pinColor });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      siteGroup.add(pinMesh);

      // Outer pulsing beacon ring
      const ringGeo = new THREE.RingGeometry(2.4, 3.4, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: pinColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.lookAt(pos.clone().multiplyScalar(2));
      siteGroup.add(ringMesh);

      // Vertical beacon line
      const linePoints = [new THREE.Vector3(0, 0, 0), pos.clone().normalize().multiplyScalar(7)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
      const lineMat = new THREE.LineBasicMaterial({ color: pinColor, transparent: true, opacity: 0.65 });
      const beaconLine = new THREE.Line(lineGeo, lineMat);
      siteGroup.add(beaconLine);

      markersGroup.add(siteGroup);
      markerObjects.push({ siteGroup, ringMesh, site });
    });

    // Pointer Drag & Click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDraggingRef.current && !targetAnimRef.current.isAnimating) {
        const deltaX = e.clientX - previousMousePositionRef.current.x;
        const deltaY = e.clientY - previousMousePositionRef.current.y;

        if (moonMeshRef.current) {
          moonMeshRef.current.rotation.y += deltaX * 0.008;
          moonMeshRef.current.rotation.x += deltaY * 0.008;
        }

        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      }

      // Check hover on markers
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markersGroup.children, true);
      if (intersects.length > 0) {
        container.style.cursor = 'pointer';
        let found = intersects[0].object;
        while (found && !found.userData.siteId && found.parent) {
          found = found.parent;
        }
        if (found && found.userData.siteId && onSiteHover) {
          onSiteHover(found.userData.siteId);
        }
      } else {
        container.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab';
        if (onSiteHover) onSiteHover(null);
      }
    };

    const handlePointerUp = (e) => {
      isDraggingRef.current = false;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markersGroup.children, true);
      if (intersects.length > 0) {
        let found = intersects[0].object;
        while (found && !found.userData.siteId && found.parent) {
          found = found.parent;
        }
        if (found && found.userData.siteId && onSelectSite) {
          onSelectSite(found.userData.siteId);
        }
      }
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let t = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      t += 0.02;

      // Handle 360-degree Moon rotation and camera zoom animation
      if (targetAnimRef.current.isAnimating) {
        const anim = targetAnimRef.current;
        const now = performance.now();
        const progress = Math.min(1, (now - anim.startTime) / anim.duration);
        
        // Smooth cubic easeInOut
        const ease = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        if (moonMeshRef.current) {
          moonMeshRef.current.rotation.y = anim.startRotY + (anim.targetRotY - anim.startRotY) * ease;
        }

        camera.position.lerpVectors(anim.startCamPos, anim.targetCamPos, ease);
        anim.currentLookAt.lerpVectors(anim.startLookAt, anim.targetLookAt, ease);
        camera.lookAt(anim.currentLookAt);

        if (progress >= 1) {
          anim.isAnimating = false;
        }
      } else if (!isDraggingRef.current && moonMeshRef.current) {
        // Subtle constant rotation when idle
        moonMeshRef.current.rotation.y += 0.002;
      }

      // Pulse site beacon rings
      markerObjects.forEach(({ ringMesh, site }) => {
        const isSelected = site.id === selectedSiteId;
        const scale = 1 + Math.sin(t * 3.5) * (isSelected ? 0.45 : 0.2);
        ringMesh.scale.set(scale, scale, scale);
        ringMesh.material.opacity = isSelected 
          ? 0.7 + Math.sin(t * 3.5) * 0.3 
          : 0.4 + Math.sin(t * 2.5) * 0.3;
      });

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
  }, []);

  // TRIGGER 360-DEGREE MOON ROTATION AND CAMERA ZOOM TOWARDS SELECTED LANDING SITE
  useEffect(() => {
    if (!moonMeshRef.current || !cameraRef.current) return;

    const site = CANDIDATE_SITES.find(s => s.id === selectedSiteId);
    if (!site) return;

    soundManager.playTargetLock();

    const startRotY = moonMeshRef.current.rotation.y;
    // Full 360-degree rotation spin (2 * Math.PI)
    const targetRotY = startRotY + Math.PI * 2;

    const radius = 48;
    const siteWorldPos = latLongToVector3(site.coordinates.latitude, site.coordinates.longitude, radius + 0.6);

    // Zoom camera towards South Pole site location
    const startCamPos = cameraRef.current.position.clone();
    
    // Calculate optimal zoom position focusing closely on South Pole site
    const targetCamPos = new THREE.Vector3(
      siteWorldPos.x * 1.35,
      siteWorldPos.y * 1.35 - 28, // Zoom in tight from South Polar angle
      Math.max(68, siteWorldPos.z + 72)
    );

    const startLookAt = targetAnimRef.current.currentLookAt.clone();
    const targetLookAt = siteWorldPos.clone();

    targetAnimRef.current = {
      isAnimating: true,
      startTime: performance.now(),
      duration: 1800, // 1.8s dramatic rotation & zoom
      startRotY,
      targetRotY,
      startCamPos,
      targetCamPos,
      startLookAt,
      targetLookAt,
      currentLookAt: startLookAt,
    };
  }, [selectedSiteId]);

  return (
    <div className="relative w-full h-full min-h-[340px] flex items-center justify-center">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute bottom-3 left-3 pointer-events-none text-[11px] font-mono text-cyan-400/90 bg-slate-950/85 px-3 py-1.5 rounded-lg border border-cyan-500/30 backdrop-blur-md flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span>360° MOON ROTATION & ZOOM ON SITE SELECTION • DRAG TO TILT</span>
      </div>
    </div>
  );
}
