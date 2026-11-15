import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import soundManager from '../audio/SoundManager';
import { createDetailedAstronaut3D } from '../../utils/createAstronaut3D';
import { Volume2, VolumeX, FastForward, Play, Sparkles, RotateCw, ZoomIn, ZoomOut, Compass, Eye, User } from 'lucide-react';

export default function CinematicOpening({ onComplete }) {
  const mountRef = useRef(null);
  const [phase, setPhase] = useState('intro'); // 'intro', 'milkyway_warp'
  const [hasStartedAudio, setHasStartedAudio] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [narrationMuted, setNarrationMuted] = useState(false);
  const [narratorSpeaking, setNarratorSpeaking] = useState(false);
  const [milkyWayText, setMilkyWayText] = useState('TRANSIT: MILKY WAY SECTOR');
  const [showGetStarted, setShowGetStarted] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  // References for Three.js objects
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animFrameRef = useRef(null);
  const stateRef = useRef({
    step: 0,
    time: 0,
    planets: [],
    sunLight: null,
    sunMesh: null,
    coronaMeshes: [],
    earthMesh: null,
    earthCloudsMesh: null,
    moonMesh: null,
    saturnRingsMesh: null,
    starsMesh: null,
    milkyWayPoints: null,
    fallingStarsMesh: null,
    fallingSpeeds: null,
    meteors: [],
    astronaut: null,
    userInteracted: false,
    cameraTarget: new THREE.Vector3(0, 0, 0),
  });

  // Sound and start handler
  const handleUserGestureStart = () => {
    soundManager.ensureContext();
    soundManager.playMusic('solar');
    setHasStartedAudio(true);
    
    // Male Voice Narration
    setTimeout(() => {
      setNarratorSpeaking(true);
      soundManager.speakNarration(() => {
        setNarratorSpeaking(false);
        setShowGetStarted(true);
      });
    }, 2400);

    // Show GET STARTED button promptly
    setTimeout(() => {
      setShowGetStarted(true);
    }, 4800);
  };

  const handleMuteToggle = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleNarrationToggle = () => {
    const muted = soundManager.toggleNarration();
    setNarrationMuted(muted);
  };

  const handleSkipIntro = () => {
    soundManager.playClick();
    soundManager.stopNarration();
    soundManager.playMusic('dashboard');
    onComplete();
  };

  // When clicking GET STARTED - speak in male voice and begin warp
  const handleGetStartedClick = () => {
    soundManager.playClick();
    soundManager.speakGetStarted();
    soundManager.playTransition();
    soundManager.playMusic('milkyway');
    setPhase('milkyway_warp');
    stateRef.current.step = 5;

    if (controlsRef.current) {
      controlsRef.current.enabled = false;
    }

    setTimeout(() => {
      setMilkyWayText('APPROACHING LUNAR ORBIT (APOLLO-ARTEMIS VECTOR)');
    }, 2200);

    setTimeout(() => {
      setMilkyWayText('ESTABLISHING TELEMETRY LINK TO SOUTH POLAR RELAY...');
    }, 4200);

    setTimeout(() => {
      soundManager.playMusic('dashboard');
      onComplete();
    }, 5800);
  };

  // ==========================================
  // PHOTOREALISTIC PROCEDURAL TEXTURE ENGINES
  // ==========================================

  // 1. Fiery, Blinding Sun Texture
  const createPhotorealisticSunTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Intense incandescent gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#fffbeb');
    grad.addColorStop(0.2, '#fef08a');
    grad.addColorStop(0.5, '#f59e0b');
    grad.addColorStop(0.8, '#ea580c');
    grad.addColorStop(1, '#b45309');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Solar granulation cells
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const r = 4 + Math.random() * 22;
      const cellGrad = ctx.createRadialGradient(x, y, 1, x, y, r);
      cellGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      cellGrad.addColorStop(0.4, 'rgba(254, 240, 138, 0.3)');
      cellGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
      ctx.fillStyle = cellGrad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Solar prominence dark magnetic spots
    for (let i = 0; i < 24; i++) {
      const x = Math.random() * canvas.width;
      const y = 120 + Math.random() * 270;
      const r = 2 + Math.random() * 8;
      ctx.fillStyle = 'rgba(120, 53, 15, 0.65)';
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.7, Math.random(), 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  };

  // 2. Solar Volumetric Corona Flare Sprite
  const createCoronaTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(256, 256, 15, 256, 256, 256);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.12, 'rgba(254, 240, 138, 0.95)');
    grad.addColorStop(0.28, 'rgba(245, 158, 11, 0.65)');
    grad.addColorStop(0.55, 'rgba(234, 88, 12, 0.25)');
    grad.addColorStop(0.8, 'rgba(180, 83, 9, 0.08)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Glowing anamorphic diffraction spikes
    ctx.strokeStyle = 'rgba(255, 250, 230, 0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 256); ctx.lineTo(512, 256);
    ctx.moveTo(256, 0); ctx.lineTo(256, 512);
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
  };

  // 3. Realistic Earth Surface (Oceans, Continents, Ice Caps)
  const createEarthSurfaceTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Deep abyssal ocean blue
    ctx.fillStyle = '#0a2540';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Shallow continental shelf turquoise
    ctx.fillStyle = '#0e4368';
    for (let i = 0; i < 28; i++) {
      const cx = (i * 38 + 20) % canvas.width;
      const cy = 80 + Math.random() * 350;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 60 + Math.random() * 80, 40 + Math.random() * 60, Math.random(), 0, Math.PI * 2);
      ctx.fill();
    }

    // Continents (Eurasia, Americas, Africa, Australia)
    ctx.fillStyle = '#1e5f38'; // Forest green
    for (let i = 0; i < 20; i++) {
      const cx = (i * 52 + 30) % canvas.width;
      const cy = 90 + Math.random() * 330;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 45 + Math.random() * 70, 30 + Math.random() * 55, Math.random(), 0, Math.PI * 2);
      ctx.fill();
    }

    // Arid / desert regions (Sahara, Australia, Middle East)
    ctx.fillStyle = '#c2883f';
    for (let i = 0; i < 10; i++) {
      const cx = (i * 105 + 160) % canvas.width;
      const cy = 180 + Math.random() * 120;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 35 + Math.random() * 45, 18 + Math.random() * 25, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Arctic and Antarctic Polar Ice Caps
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, 38); // North Pole
    ctx.fillRect(0, canvas.height - 45, canvas.width, 45); // South Pole

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    return tex;
  };

  // 4. Earth Swirling White Clouds Layer
  const createEarthCloudsTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    // Swirling hurricane spirals and weather fronts
    for (let i = 0; i < 45; i++) {
      const cx = Math.random() * canvas.width;
      const cy = 60 + Math.random() * 390;
      const rx = 35 + Math.random() * 70;
      const ry = 12 + Math.random() * 24;
      const rot = Math.random() * Math.PI;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    return tex;
  };

  // 5. Realistic Saturn Multi-Ring Texture with Cassini Division
  const createSaturnRingTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Ring system from inner to outer radius
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, 'rgba(0,0,0,0)'); // Inner gap
    grad.addColorStop(0.12, 'rgba(168, 142, 98, 0.4)'); // C Ring
    grad.addColorStop(0.25, 'rgba(226, 202, 150, 0.85)'); // B Ring (Brightest)
    grad.addColorStop(0.58, 'rgba(212, 185, 134, 0.95)');
    grad.addColorStop(0.62, 'rgba(10, 10, 15, 0.05)'); // Cassini Division gap!
    grad.addColorStop(0.67, 'rgba(190, 165, 120, 0.7)'); // A Ring
    grad.addColorStop(0.92, 'rgba(160, 135, 95, 0.5)');
    grad.addColorStop(1, 'rgba(0,0,0,0)'); // Outer edge

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    return new THREE.CanvasTexture(canvas);
  };

  // 6. Jupiter Banded Atmosphere with Great Red Spot
  const createJupiterTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Alternating atmospheric belts and zones
    const colors = ['#e2d5c3', '#b8895b', '#e7dcce', '#9f663b', '#cfbba3', '#8a4b27', '#e8dfd3', '#a76a3d'];
    const bandHeight = canvas.height / colors.length;

    colors.forEach((col, idx) => {
      ctx.fillStyle = col;
      ctx.fillRect(0, idx * bandHeight, canvas.width, bandHeight);
    });

    // Turbulent jet stream eddies
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.25)' : 'rgba(100, 40, 10, 0.25)';
      ctx.beginPath();
      ctx.ellipse(x, y, 30 + Math.random() * 50, 6 + Math.random() * 12, 0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // The Great Red Spot
    const grsX = 640;
    const grsY = 320;
    const grsGrad = ctx.createRadialGradient(grsX, grsY, 5, grsX, grsY, 45);
    grsGrad.addColorStop(0, '#c2410c');
    grsGrad.addColorStop(0.6, '#ea580c');
    grsGrad.addColorStop(1, '#f97316');
    ctx.fillStyle = grsGrad;
    ctx.beginPath();
    ctx.ellipse(grsX, grsY, 46, 28, -0.1, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    return tex;
  };

  // 7. Mars Iron-Oxide Red Planet Texture
  const createMarsTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Rusty reddish-orange
    ctx.fillStyle = '#b44a2c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dark volcanic basalt patches (Syrtis Major)
    ctx.fillStyle = '#6e2b1b';
    for (let i = 0; i < 14; i++) {
      const cx = (i * 40 + 20) % canvas.width;
      const cy = 70 + Math.random() * 130;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 25 + Math.random() * 40, 15 + Math.random() * 30, Math.random(), 0, Math.PI * 2);
      ctx.fill();
    }

    // Polar ice caps
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, 18); // North cap
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20); // South cap

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    return tex;
  };

  // 8. Moon Basalt Surface Texture
  const createMoonTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#828994';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dark Maria
    ctx.fillStyle = '#374151';
    for (let i = 0; i < 10; i++) {
      const cx = Math.random() * canvas.width;
      const cy = Math.random() * canvas.height;
      ctx.beginPath();
      ctx.arc(cx, cy, 18 + Math.random() * 45, 0, Math.PI * 2);
      ctx.fill();
    }

    // Impact craters
    for (let i = 0; i < 150; i++) {
      const cx = Math.random() * canvas.width;
      const cy = Math.random() * canvas.height;
      const r = 2 + Math.random() * 8;
      ctx.strokeStyle = 'rgba(240, 246, 255, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(20, 25, 35, 0.7)';
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2); ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    return tex;
  };

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene setup with atmospheric deep space background
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.00035);
    sceneRef.current = scene;

    // Camera positioned in a cinematic diagonal perspective (matching the video!)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 25000);
    // Top-down / isometric diagonal perspective looking across the solar system plane
    camera.position.set(-180, 420, 680);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // High performance WebGL renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControls for Full 360-Degree Viewing Experience
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 4500;
    controls.minDistance = 30;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.45;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    controls.addEventListener('start', () => {
      stateRef.current.userInteracted = true;
    });

    // ==========================================
    // 1. GLOWING MILKY WAY GALAXY & STARFIELD
    // ==========================================
    const starCount = 10000;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      // Spherical distribution with a dense galactic band
      const r = 4000 + Math.random() * 6000;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      starPositions[idx] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[idx + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[idx + 2] = r * Math.cos(phi);

      // Star hues: blue-white, white, gold
      const roll = Math.random();
      if (roll > 0.65) {
        starColors[idx] = 0.7; starColors[idx + 1] = 0.88; starColors[idx + 2] = 1.0;
      } else if (roll > 0.35) {
        starColors[idx] = 1.0; starColors[idx + 1] = 0.95; starColors[idx + 2] = 0.8;
      } else {
        starColors[idx] = 1.0; starColors[idx + 1] = 1.0; starColors[idx + 2] = 1.0;
      }
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 2.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
    });
    const starsMesh = new THREE.Points(starGeo, starMat);
    scene.add(starsMesh);
    stateRef.current.starsMesh = starsMesh;

    // Glowing Milky Way galaxy dust lane (diagonal through space, just like in the video!)
    const mwCount = 16000;
    const mwGeo = new THREE.BufferGeometry();
    const mwPositions = new Float32Array(mwCount * 3);
    const mwColors = new Float32Array(mwCount * 3);

    for (let i = 0; i < mwCount; i++) {
      const idx = i * 3;
      // Slanted galactic ribbon
      const t = (i / mwCount - 0.5) * 6000;
      const widthSpread = (Math.random() - 0.5) * 500;
      const depthSpread = (Math.random() - 0.5) * 700;

      // Rotate galaxy band diagonally across the sky
      const gx = t * 0.85 + widthSpread * 0.5;
      const gy = t * 0.52 - widthSpread * 0.8;
      const gz = -1200 + depthSpread;

      mwPositions[idx] = gx;
      mwPositions[idx + 1] = gy;
      mwPositions[idx + 2] = gz;

      // Subtle luminous galactic dust colors (cyan, magenta, gold)
      const roll = Math.random();
      if (roll > 0.6) {
        mwColors[idx] = 0.4; mwColors[idx + 1] = 0.75; mwColors[idx + 2] = 1.0;
      } else if (roll > 0.3) {
        mwColors[idx] = 0.85; mwColors[idx + 1] = 0.5; mwColors[idx + 2] = 0.9;
      } else {
        mwColors[idx] = 1.0; mwColors[idx + 1] = 0.85; mwColors[idx + 2] = 0.65;
      }
    }

    mwGeo.setAttribute('position', new THREE.BufferAttribute(mwPositions, 3));
    mwGeo.setAttribute('color', new THREE.BufferAttribute(mwColors, 3));
    const mwMat = new THREE.PointsMaterial({
      size: 3.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const milkyWayPoints = new THREE.Points(mwGeo, mwMat);
    scene.add(milkyWayPoints);
    stateRef.current.milkyWayPoints = milkyWayPoints;

    // ==========================================
    // 2. THE SUN (Fiery Star with Multi-Layer Glow)
    // ==========================================
    const sunRadius = 42;
    const sunGeo = new THREE.SphereGeometry(sunRadius, 64, 64);
    const sunMat = new THREE.MeshBasicMaterial({
      map: createPhotorealisticSunTexture(),
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(0, 0, 0);
    scene.add(sunMesh);
    stateRef.current.sunMesh = sunMesh;

    // Volumetric Corona Sprite Flare (Multi-layered)
    const coronaTexture = createCoronaTexture();
    const coronaMat1 = new THREE.SpriteMaterial({
      map: coronaTexture,
      color: 0xffaa33,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const coronaSprite1 = new THREE.Sprite(coronaMat1);
    coronaSprite1.scale.set(sunRadius * 4.8, sunRadius * 4.8, 1);
    sunMesh.add(coronaSprite1);

    const coronaMat2 = new THREE.SpriteMaterial({
      map: coronaTexture,
      color: 0xffe066,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const coronaSprite2 = new THREE.Sprite(coronaMat2);
    coronaSprite2.scale.set(sunRadius * 2.8, sunRadius * 2.8, 1);
    sunMesh.add(coronaSprite2);
    stateRef.current.coronaMeshes = [coronaSprite1, coronaSprite2];

    // High intensity Sun PointLight providing realistic day/night lighting to all planets!
    const sunLight = new THREE.PointLight(0xfffaed, 4.5, 8000, 0.4);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);
    stateRef.current.sunLight = sunLight;

    // Subtle space ambient light
    const ambientLight = new THREE.AmbientLight(0x0a1428, 0.5);
    scene.add(ambientLight);

    // ==========================================
    // 2.5 FALLING STARS & METEOR SHOWER ENGINE
    // ==========================================
    const fallingStarsCount = 850;
    const fallingStarsGeo = new THREE.BufferGeometry();
    const fallingPos = new Float32Array(fallingStarsCount * 6); // 2 vertices per streak (head & tail)
    const fallingCol = new Float32Array(fallingStarsCount * 6);
    const fallingSpeeds = [];

    for (let i = 0; i < fallingStarsCount; i++) {
      const x = (Math.random() - 0.5) * 4500;
      const y = (Math.random() - 0.5) * 2800 + 300;
      const z = (Math.random() - 0.5) * 3800;
      const len = 35 + Math.random() * 55;
      const vy = -(16 + Math.random() * 22);
      const vx = -(4 + Math.random() * 8);
      const vz = -(2 + Math.random() * 6);
      fallingSpeeds.push({ vx, vy, vz, len });

      const idx = i * 6;
      // Head
      fallingPos[idx] = x;
      fallingPos[idx + 1] = y;
      fallingPos[idx + 2] = z;
      // Tail
      fallingPos[idx + 3] = x - (vx / Math.abs(vy)) * len;
      fallingPos[idx + 4] = y + len;
      fallingPos[idx + 5] = z - (vz / Math.abs(vy)) * len;

      // Head color (bright incandescent cyan/white)
      fallingCol[idx] = 0.88; fallingCol[idx + 1] = 0.98; fallingCol[idx + 2] = 1.0;
      // Tail color (fading electric blue)
      fallingCol[idx + 3] = 0.05; fallingCol[idx + 4] = 0.35; fallingCol[idx + 5] = 0.75;
    }

    fallingStarsGeo.setAttribute('position', new THREE.BufferAttribute(fallingPos, 3));
    fallingStarsGeo.setAttribute('color', new THREE.BufferAttribute(fallingCol, 3));

    const fallingStarsMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const fallingStarsMesh = new THREE.LineSegments(fallingStarsGeo, fallingStarsMat);
    scene.add(fallingStarsMesh);
    stateRef.current.fallingStarsMesh = fallingStarsMesh;
    stateRef.current.fallingSpeeds = fallingSpeeds;

    // Fast High-Velocity Shooting Stars (Meteors/Bolides) with glowing heads & trails
    const meteors = [];
    for (let m = 0; m < 6; m++) {
      const meteorHeadGeo = new THREE.SphereGeometry(2.4, 12, 12);
      const meteorHeadMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.95,
      });
      const headMesh = new THREE.Mesh(meteorHeadGeo, meteorHeadMat);

      const flareMat = new THREE.SpriteMaterial({
        map: coronaTexture,
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });
      const flare = new THREE.Sprite(flareMat);
      flare.scale.set(38, 38, 1);
      headMesh.add(flare);

      const trailMax = 22;
      const trailGeo = new THREE.BufferGeometry();
      const trailPos = new Float32Array(trailMax * 3);
      trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
      const trailMat = new THREE.LineBasicMaterial({
        color: 0x00f5d4,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });
      const trailLine = new THREE.Line(trailGeo, trailMat);

      headMesh.visible = false;
      trailLine.visible = false;

      scene.add(headMesh);
      scene.add(trailLine);

      meteors.push({
        headMesh,
        flare,
        trailLine,
        trailPos,
        trailHistory: [],
        active: false,
        timer: 0.2 + m * 0.45,
        speed: 36 + Math.random() * 26,
        pos: new THREE.Vector3(),
        dir: new THREE.Vector3(-1.2, -0.9, -0.6).normalize(),
      });
    }
    stateRef.current.meteors = meteors;

    // ==========================================
    // 2.6 REAL 3D FLOATING ASTRONAUT ("BIG MAN")
    // ==========================================
    const astronaut3D = createDetailedAstronaut3D({
      scale: 4.5, // Impressive, prominent scale!
      enableLights: true,
      isCommander: true,
    });
    // Position floating in the foreground of the Solar System
    astronaut3D.group.position.set(155, 25, 230);
    astronaut3D.group.rotation.y = -0.65;
    astronaut3D.group.rotation.x = 0.18;
    scene.add(astronaut3D.group);
    stateRef.current.astronaut = astronaut3D;

    // Add dedicated rim spotlight on astronaut
    const astroSpotLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    astroSpotLight.position.set(190, 60, 280);
    scene.add(astroSpotLight);

    // ==========================================
    // 3. COMPLETE SOLAR SYSTEM (ALL 8 PLANETS)
    // ==========================================
    const earthTex = createEarthSurfaceTexture();
    const earthCloudsTex = createEarthCloudsTexture();
    const moonTex = createMoonTexture();
    const marsTex = createMarsTexture();
    const jupiterTex = createJupiterTexture();
    const saturnRingTex = createSaturnRingTexture();

    const planetDefs = [
      {
        name: 'Mercury',
        size: 4.2,
        dist: 78,
        speed: 0.045,
        color: '#94a3b8',
        roughness: 0.9,
      },
      {
        name: 'Venus',
        size: 7.2,
        dist: 122,
        speed: 0.032,
        color: '#fef08a',
        roughness: 0.6,
      },
      {
        name: 'Earth',
        size: 8.4,
        dist: 185,
        speed: 0.024,
        isEarth: true,
      },
      {
        name: 'Mars',
        size: 5.6,
        dist: 255,
        speed: 0.018,
        texture: marsTex,
        roughness: 0.85,
      },
      {
        name: 'Jupiter',
        size: 24.0,
        dist: 375,
        speed: 0.011,
        texture: jupiterTex,
        roughness: 0.7,
      },
      {
        name: 'Saturn',
        size: 19.0,
        dist: 510,
        speed: 0.008,
        hasRings: true,
        color: '#fde68a',
        roughness: 0.75,
      },
      {
        name: 'Uranus',
        size: 11.5,
        dist: 640,
        speed: 0.005,
        color: '#67e8f9',
        roughness: 0.7,
      },
      {
        name: 'Neptune',
        size: 11.0,
        dist: 770,
        speed: 0.004,
        color: '#3b82f6',
        roughness: 0.7,
      },
    ];

    const planetMeshes = [];
    planetDefs.forEach(p => {
      // Planet geometry
      const pGeo = new THREE.SphereGeometry(p.size, 48, 48);
      let pMat;

      if (p.isEarth) {
        // High fidelity Earth material
        pMat = new THREE.MeshStandardMaterial({
          map: earthTex,
          roughness: 0.75,
          metalness: 0.05,
        });
      } else if (p.texture) {
        pMat = new THREE.MeshStandardMaterial({
          map: p.texture,
          roughness: p.roughness || 0.8,
          metalness: 0.05,
        });
      } else {
        pMat = new THREE.MeshStandardMaterial({
          color: p.color,
          roughness: p.roughness || 0.8,
          metalness: 0.05,
        });
      }

      const pMesh = new THREE.Mesh(pGeo, pMat);

      // Orbital ellipse track (glowing, elegant line encircling Sun)
      const orbitGeo = new THREE.BufferGeometry();
      const points = [];
      for (let i = 0; i <= 128; i++) {
        const th = (i / 128) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(th) * p.dist, 0, Math.sin(th) * p.dist));
      }
      orbitGeo.setFromPoints(points);
      const orbitMat = new THREE.LineBasicMaterial({
        color: 0x00f5d4,
        transparent: true,
        opacity: p.isEarth ? 0.35 : 0.16,
      });
      const orbitLine = new THREE.Line(orbitGeo, orbitMat);
      scene.add(orbitLine);

      // EARTH SPECIFICS: Clouds Sphere + Atmosphere Rim + Orbiting Moon!
      if (p.isEarth) {
        stateRef.current.earthMesh = pMesh;

        // Clouds layer slightly above ground
        const cloudsGeo = new THREE.SphereGeometry(p.size * 1.025, 48, 48);
        const cloudsMat = new THREE.MeshStandardMaterial({
          map: earthCloudsTex,
          transparent: true,
          opacity: 0.7,
          blending: THREE.AdditiveBlending,
        });
        const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
        pMesh.add(cloudsMesh);
        stateRef.current.earthCloudsMesh = cloudsMesh;

        // Atmosphere blue Fresnel glow
        const atmosGeo = new THREE.SphereGeometry(p.size * 1.08, 32, 32);
        const atmosMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.18,
          side: THREE.BackSide,
        });
        const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
        pMesh.add(atmosMesh);

        // Orbiting Moon
        const moonGeo = new THREE.SphereGeometry(2.4, 32, 32);
        const moonMat = new THREE.MeshStandardMaterial({
          map: moonTex,
          roughness: 0.9,
          metalness: 0.05,
        });
        const moonMesh = new THREE.Mesh(moonGeo, moonMat);
        moonMesh.position.set(20, 2, 0);
        pMesh.add(moonMesh);
        stateRef.current.moonMesh = moonMesh;
      }

      // SATURN SPECIFICS: Majestic Multi-Rings with Cassini Division!
      if (p.hasRings) {
        const ringGeo = new THREE.RingGeometry(p.size * 1.35, p.size * 2.5, 64);
        // Correct UV mapping for radial ring gradient
        const pos = ringGeo.attributes.position;
        const uvs = ringGeo.attributes.uv;
        for (let i = 0; i < pos.count; i++) {
          const vx = pos.getX(i);
          const vy = pos.getY(i);
          const dist = Math.sqrt(vx * vx + vy * vy);
          const u = (dist - p.size * 1.35) / (p.size * 1.15);
          uvs.setXY(i, u, 0.5);
        }

        const ringMat = new THREE.MeshBasicMaterial({
          map: saturnRingTex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.88,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI * 0.46; // Tilted ring plane!
        pMesh.add(ringMesh);
        stateRef.current.saturnRingsMesh = ringMesh;
      }

      scene.add(pMesh);
      // Stagger planets around orbits for a cinematic spread (just like in the video!)
      let startAngle = 0;
      if (p.name === 'Earth') startAngle = Math.PI * 0.35; // Foreground lower position
      else if (p.name === 'Jupiter') startAngle = Math.PI * 1.25; // Upper quadrant
      else if (p.name === 'Saturn') startAngle = Math.PI * 1.15; // Upper quadrant near Jupiter
      else if (p.name === 'Mars') startAngle = Math.PI * 0.65;
      else if (p.name === 'Venus') startAngle = Math.PI * 0.15;
      else startAngle = Math.random() * Math.PI * 2;

      planetMeshes.push({ mesh: pMesh, def: p, angle: startAngle });
    });
    stateRef.current.planets = planetMeshes;

    // Handle Window Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ==========================================
    // 4. ANIMATION LOOP
    // ==========================================
    let startTime = performance.now();
    const animate = (currentTime) => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsed = (currentTime - startTime) / 1000;
      stateRef.current.time = elapsed;
      const s = stateRef.current;

      // Sun slow rotation and corona pulse
      if (s.sunMesh) {
        s.sunMesh.rotation.y = elapsed * 0.04;
        if (s.coronaMeshes.length > 0) {
          const pulse = 1 + Math.sin(elapsed * 2.5) * 0.04;
          s.coronaMeshes[0].scale.set(sunRadius * 4.8 * pulse, sunRadius * 4.8 * pulse, 1);
          s.coronaMeshes[1].scale.set(sunRadius * 2.8 * pulse, sunRadius * 2.8 * pulse, 1);
        }
      }

      // Planetary orbital motions
      if (s.planets) {
        s.planets.forEach(p => {
          p.angle += p.def.speed * 0.015;
          p.mesh.position.x = Math.cos(p.angle) * p.def.dist;
          p.mesh.position.z = Math.sin(p.angle) * p.def.dist;
          p.mesh.rotation.y += 0.012;
        });
      }

      // Earth & Cloud layers rotation
      if (s.earthMesh && s.earthCloudsMesh && s.moonMesh) {
        s.earthMesh.rotation.y = elapsed * 0.08;
        s.earthCloudsMesh.rotation.y = elapsed * 0.11; // Clouds drift slightly faster!

        // Moon orbit around Earth
        const moonAngle = elapsed * 0.35;
        s.moonMesh.position.x = Math.cos(moonAngle) * 20;
        s.moonMesh.position.z = Math.sin(moonAngle) * 20;
        s.moonMesh.rotation.y = elapsed * 0.04;
      }

      // Update Falling Stars Shower
      if (s.fallingStarsMesh && s.fallingSpeeds) {
        const posAttr = s.fallingStarsMesh.geometry.attributes.position;
        const posArray = posAttr.array;
        for (let i = 0; i < fallingStarsCount; i++) {
          const spd = s.fallingSpeeds[i];
          const idx = i * 6;

          // Advance head
          posArray[idx] += spd.vx * 0.45;
          posArray[idx + 1] += spd.vy * 0.45;
          posArray[idx + 2] += spd.vz * 0.45;

          // Advance tail
          posArray[idx + 3] = posArray[idx] - (spd.vx / Math.abs(spd.vy)) * spd.len;
          posArray[idx + 4] = posArray[idx + 1] + spd.len;
          posArray[idx + 5] = posArray[idx + 2] - (spd.vz / Math.abs(spd.vy)) * spd.len;

          // Respawn at top if past lower threshold
          if (posArray[idx + 1] < -1400) {
            posArray[idx] = (Math.random() - 0.5) * 4500;
            posArray[idx + 1] = 1400 + Math.random() * 400;
            posArray[idx + 2] = (Math.random() - 0.5) * 3800;
          }
        }
        posAttr.needsUpdate = true;
      }

      // Update Fast High-Velocity Shooting Stars (Meteors)
      if (s.meteors) {
        s.meteors.forEach(m => {
          if (!m.active) {
            m.timer -= 0.016;
            if (m.timer <= 0) {
              m.active = true;
              m.pos.set(
                350 + Math.random() * 700,
                420 + Math.random() * 400,
                -100 + Math.random() * 500
              );
              m.dir.set(
                -(0.85 + Math.random() * 0.5),
                -(0.7 + Math.random() * 0.45),
                -(0.35 + Math.random() * 0.35)
              ).normalize();
              m.speed = 36 + Math.random() * 24;
              m.trailHistory = [];
              m.headMesh.visible = true;
              m.trailLine.visible = true;
            }
          } else {
            m.pos.addScaledVector(m.dir, m.speed);
            m.headMesh.position.copy(m.pos);

            m.trailHistory.unshift(m.pos.clone());
            if (m.trailHistory.length > 22) m.trailHistory.pop();

            const trailArr = m.trailLine.geometry.attributes.position.array;
            for (let t = 0; t < 22; t++) {
              if (t < m.trailHistory.length) {
                trailArr[t * 3] = m.trailHistory[t].x;
                trailArr[t * 3 + 1] = m.trailHistory[t].y;
                trailArr[t * 3 + 2] = m.trailHistory[t].z;
              } else {
                trailArr[t * 3] = m.pos.x;
                trailArr[t * 3 + 1] = m.pos.y;
                trailArr[t * 3 + 2] = m.pos.z;
              }
            }
            m.trailLine.geometry.attributes.position.needsUpdate = true;

            // Deactivate and reset when out of bounds
            if (m.pos.y < -900 || m.pos.x < -1800) {
              m.active = false;
              m.headMesh.visible = false;
              m.trailLine.visible = false;
              m.timer = 0.4 + Math.random() * 2.0;
            }
          }
        });
      }

      // Update 3D Floating Astronaut Microgravity Kinematics
      if (s.astronaut) {
        s.astronaut.update(elapsed, 0.016, { x: 0, y: 0 });
      }

      // Milky Way Warp Transition (Triggered when Get Started is clicked)
      if (s.step === 5) {
        if (s.milkyWayPoints) {
          s.milkyWayPoints.material.opacity = Math.min(1.0, s.milkyWayPoints.material.opacity + 0.04);
          s.milkyWayPoints.rotation.y += 0.015;
          s.milkyWayPoints.position.z += 12;
        }

        // Camera accelerates smoothly through the solar system towards the Moon South Pole
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, 85, 0.038);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, -30, 0.038);
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, 8, 0.038);
        camera.lookAt(0, -40, 0);
      } else {
        // OrbitControls continuous 360-degree update
        controls.update();
      }

      renderer.render(scene, camera);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [autoRotate]);

  // Camera presets
  const handleResetCamera = () => {
    soundManager.playClick();
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(-180, 420, 680);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  const handleFocusEarth = () => {
    soundManager.playClick();
    const earth = stateRef.current.planets.find(p => p.def.name === 'Earth');
    if (earth && cameraRef.current && controlsRef.current) {
      const ePos = earth.mesh.position;
      cameraRef.current.position.set(ePos.x + 35, ePos.y + 25, ePos.z + 45);
      controlsRef.current.target.copy(ePos);
      controlsRef.current.update();
    }
  };

  const handleFocusAstronaut = () => {
    soundManager.playClick();
    const astro = stateRef.current.astronaut;
    if (astro && cameraRef.current && controlsRef.current) {
      const aPos = astro.group.position;
      cameraRef.current.position.set(aPos.x + 22, aPos.y + 12, aPos.z + 28);
      controlsRef.current.target.copy(aPos);
      controlsRef.current.update();
    }
  };

  const handleZoom = (factor) => {
    soundManager.playClick();
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.multiplyScalar(factor);
      controlsRef.current.update();
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020617] select-none">
      {/* 3D WebGL Canvas Container for 360-degree Solar System */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing" />

      {/* Top Header Controls: Sound, Presets & Skip */}
      <header className="absolute top-0 left-0 right-0 z-30 p-4 sm:p-6 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-3 pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping-slow shadow-glow-cyan" />
          <span className="text-xs font-mono text-cyan-300 font-bold tracking-widest uppercase">
            360° SOLAR SYSTEM OBSERVATORY • INTERSTELLAR VECTOR
          </span>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 pointer-events-auto">
          {/* Quick Focus 3D Astronaut button */}
          <button
            onClick={handleFocusAstronaut}
            className="px-3 py-1.5 rounded-lg border border-amber-500/40 bg-slate-900/80 backdrop-blur-md text-amber-300 hover:text-white hover:border-amber-400 text-xs font-mono flex items-center space-x-1.5 transition-all shadow-md shadow-amber-950/40"
            title="Focus Real 3D Spacewalk Astronaut (Big Man Floating)"
          >
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">3D ASTRONAUT</span>
          </button>

          {/* Quick Focus Earth button */}
          <button
            onClick={handleFocusEarth}
            className="px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-slate-900/80 backdrop-blur-md text-cyan-300 hover:text-white hover:border-cyan-400 text-xs font-mono flex items-center space-x-1.5 transition-all"
            title="Focus Earth & Moon"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">FOCUS EARTH</span>
          </button>

          {/* 360 Auto-Rotate Toggle */}
          <button
            onClick={() => {
              setAutoRotate(!autoRotate);
              soundManager.playClick();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all flex items-center space-x-1.5 backdrop-blur-md ${
              autoRotate
                ? 'border-cyan-500/40 text-cyan-300 bg-cyan-950/40'
                : 'border-slate-700 text-slate-400 bg-slate-900/60'
            }`}
            title="Toggle 360-degree auto rotation"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin-slow text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">360° ROTATE</span>
          </button>

          {/* Reset Camera */}
          <button
            onClick={handleResetCamera}
            className="p-2 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-all backdrop-blur-md"
            title="Reset 360 Camera View"
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* Zoom controls */}
          <button
            onClick={() => handleZoom(0.8)}
            className="p-2 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-300 hover:text-cyan-300 transition-all backdrop-blur-md"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(1.25)}
            className="p-2 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-300 hover:text-cyan-300 transition-all backdrop-blur-md"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Master Sound Toggle */}
          <button
            onClick={handleMuteToggle}
            className="p-2 rounded-lg border border-cyan-500/30 bg-slate-900/60 backdrop-blur-md text-cyan-300 hover:text-white hover:border-cyan-400 transition-all"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Skip Intro Button */}
          <button
            onClick={handleSkipIntro}
            className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900/80 backdrop-blur-md text-slate-300 hover:text-cyan-300 hover:border-cyan-500/60 font-mono text-xs flex items-center space-x-1.5 transition-all"
          >
            <span>SKIP INTRO</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Initial Interaction Prompt */}
      {!hasStartedAudio && (
        <div className="absolute inset-0 z-40 bg-[#020617]/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md p-8 rounded-2xl border border-cyan-500/40 bg-slate-950/95 shadow-glow-cyan text-center relative corner-brackets">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-cyan-500/10 border border-cyan-400/30 mb-4 text-cyan-400">
              <Sparkles className="w-7 h-7 animate-pulse" />
            </div>
            <h2 className="text-xl font-heading font-extrabold text-white tracking-wider mb-2">
              LUNAR LANDING SITE NAVIGATOR
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-sans">
              Enter the immersive 360° solar system opening experience with deep cinematic music and authentic male voice narration.
            </p>
            <button
              onClick={handleUserGestureStart}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-heading font-extrabold text-sm tracking-widest uppercase shadow-glow-cyan transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>EXPLORE SOLAR SYSTEM (360°)</span>
            </button>
            <p className="text-[11px] font-mono text-cyan-400/70 mt-4">
              INTERACTIVE 360° VIEW • DRAG ANY ANGLE TO EXPLORE
            </p>
          </div>
        </div>
      )}

      {/* 360° Drag Instructions Pill */}
      {hasStartedAudio && phase !== 'milkyway_warp' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="px-4 py-1.5 rounded-full border border-cyan-500/30 bg-slate-950/75 backdrop-blur-md text-[11px] font-mono text-cyan-300 shadow-hud flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>DRAG SCREEN FOR 360° SOLAR SYSTEM VIEWING • SCROLL TO ZOOM</span>
          </div>
        </div>
      )}

      {/* Center Cinematic Overlay: Project Title & Get Started */}
      {hasStartedAudio && phase !== 'milkyway_warp' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-20 md:pb-24 px-4 text-center pointer-events-none">
          {/* Animated Project Title */}
          <div className="animate-fade-in transition-all duration-1000 mb-5">
            <div className="inline-block px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/40 backdrop-blur-md text-cyan-300 text-[11px] font-mono tracking-widest uppercase mb-2">
              LUNAR SOUTH POLE CANDIDATE SITE NAVIGATOR
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading font-extrabold text-white tracking-widest uppercase drop-shadow-[0_0_35px_rgba(0,245,212,0.45)]">
              LUNAR LANDING SITE NAVIGATOR
            </h1>
            <p className="text-xs sm:text-sm font-mono text-cyan-300/90 tracking-wider mt-1.5">
              SCIENTIFIC ASSESSMENT OF FIVE SOUTH POLAR CANDIDATES
            </p>
          </div>

          {/* Voice Narration Live Caption Pill (Male Voice) */}
          {narratorSpeaking && (
            <div className="pointer-events-auto max-w-2xl px-5 py-2.5 rounded-xl border border-cyan-500/40 bg-slate-950/85 backdrop-blur-lg mb-5 shadow-hud animate-pulse-slow">
              <div className="flex items-center justify-center space-x-2 text-xs font-mono text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="tracking-wide">MISSION CONTROL AUDIO TRANSMISSION (MALE VOICE):</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 italic font-sans leading-relaxed">
                "Welcome to the Lunar Landing Site Navigator. All systems nominal. Explore the lunar South Pole, analyse potential landing locations, and discover the safest landing destination for future lunar exploration missions."
              </p>
            </div>
          )}

          {/* GET STARTED BUTTON (in voice of male) */}
          {showGetStarted && (
            <div className="pointer-events-auto animate-fade-in flex flex-col items-center">
              <button
                onClick={handleGetStartedClick}
                onMouseEnter={() => soundManager.playClick()}
                className="group relative px-10 py-4 rounded-xl font-heading font-extrabold text-base sm:text-lg tracking-widest uppercase overflow-hidden transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-[0_0_35px_rgba(0,245,212,0.5)] border border-cyan-400 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 hover:shadow-[0_0_50px_rgba(0,245,212,0.8)]"
              >
                {/* Shimmer sweep effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                <span className="relative z-10 flex items-center space-x-3">
                  <span>GET STARTED</span>
                  <Sparkles className="w-5 h-5 text-slate-950 fill-slate-950" />
                </span>
              </button>
              <div className="text-[11px] font-mono text-cyan-400/80 tracking-widest uppercase mt-2.5">
                VOICE-ACTIVATED • ENTER LUNAR SOUTH POLE DASHBOARD
              </div>
            </div>
          )}
        </div>
      )}

      {/* Milky Way Warp HUD Overlay */}
      {phase === 'milkyway_warp' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
          <div className="p-8 rounded-2xl border border-cyan-400/50 bg-slate-950/85 backdrop-blur-xl shadow-glow-cyan max-w-xl w-full corner-brackets animate-pulse-slow">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-4 border-b border-cyan-500/20 pb-2">
              <span>WARP TRAJECTORY: ACTIVE</span>
              <span>VELOCITY: 0.94 C</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-widest mb-2">
              INTERPLANETARY TRANSIT
            </h2>
            <p className="text-sm font-mono text-cyan-300 tracking-wider">
              {milkyWayText}
            </p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-6 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 h-full w-full animate-[scanline_2s_linear_infinite]" />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Mission Notice */}
      <footer className="absolute bottom-3 left-0 right-0 z-20 text-center pointer-events-none">
        <p className="text-[10px] font-mono text-slate-500 tracking-wider">
          LUNAR LANDING SITE NAVIGATOR • 360° SOLAR SYSTEM OBSERVATION • NASA LOLA, LROC & SPICE KINEMATICS
        </p>
      </footer>
    </div>
  );
}
