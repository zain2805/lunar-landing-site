import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createDetailedAstronaut3D } from '../../utils/createAstronaut3D';
import { Sparkles, Compass, Flame } from 'lucide-react';

export default function Astronaut3D() {
  const mountRef = useRef(null);
  const [isBig, setIsBig] = useState(true);
  const [thrusterActive, setThrusterActive] = useState(false);

  const stateRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    astronaut: null,
    stars: null,
    shootingStars: [],
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    animFrameId: null,
    isThrusterBoosting: false,
    thrusterBoostTimer: 0,
  });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene & Transparent WebGL Renderer
    const scene = new THREE.Scene();
    stateRef.current.scene = scene;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 18);
    stateRef.current.camera = camera;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);
    stateRef.current.renderer = renderer;

    // 2. Cinematic Lighting for Astronaut Spacesuit
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.8);
    scene.add(ambientLight);

    // Key light (Sun reflection - warm golden/white light)
    const sunKeyLight = new THREE.DirectionalLight(0xfffaed, 2.8);
    sunKeyLight.position.set(12, 16, 14);
    scene.add(sunKeyLight);

    // Rim light (Lunar surface / Earth reflection - cold cyan blue light)
    const earthRimLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    earthRimLight.position.set(-14, -8, -10);
    scene.add(earthRimLight);

    // Specular highlight light
    const specularLight = new THREE.PointLight(0x00f5d4, 1.5, 30);
    specularLight.position.set(4, 5, 8);
    scene.add(specularLight);

    // 3. CREATE REAL 3D ASTRONAUT ("BIG MAN FLOATING")
    // Prominent scale to make him a big, impressive 3D floating presence
    const astronautScale = isBig ? 1.85 : 1.25;
    const astro = createDetailedAstronaut3D({
      scale: astronautScale,
      enableLights: true,
      isCommander: true,
    });

    // Initial position: Floating in the right half of the screen
    astro.group.position.set(6.2, 0.4, 0);
    astro.group.rotation.y = -0.45;
    astro.group.rotation.x = 0.15;
    scene.add(astro.group);
    stateRef.current.astronaut = astro;

    // 4. Background Star Dust & Floating Space Debris
    const starCount = 350;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 50;
      starPos[i + 1] = (Math.random() - 0.5) * 40;
      starPos[i + 2] = (Math.random() - 0.5) * 25 - 5;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.12,
      transparent: true,
      opacity: 0.55,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);
    stateRef.current.stars = stars;

    // 5. Mouse Parallax & Tracking
    const handleMouseMove = (e) => {
      stateRef.current.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      stateRef.current.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', handleMouseMove);

    // 6. Resize Handler
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);

      // Adapt astronaut placement for mobile vs desktop
      if (w < 768) {
        astro.group.position.set(0, -3.2, 0);
        astro.group.scale.set(1.1, 1.1, 1.1);
      } else {
        astro.group.position.set(w > 1400 ? 6.5 : 5.0, 0.4, 0);
        astro.group.scale.set(astronautScale, astronautScale, astronautScale);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    let startTime = performance.now();
    const animate = (currentTime) => {
      stateRef.current.animFrameId = requestAnimationFrame(animate);
      const elapsed = (currentTime - startTime) / 1000;
      const mouse = stateRef.current.mouse;

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Handle Thruster Boost state
      if (stateRef.current.isThrusterBoosting) {
        stateRef.current.thrusterBoostTimer -= 0.016;
        astro.group.rotation.y += 0.04;
        astro.group.position.y += Math.sin(elapsed * 12) * 0.02;
        if (stateRef.current.thrusterBoostTimer <= 0) {
          stateRef.current.isThrusterBoosting = false;
          setThrusterActive(false);
        }
      }

      // Update 3D Astronaut Microgravity Kinematics
      if (astro) {
        astro.update(elapsed, 0.016, mouse);
      }

      // Subtle star drift
      if (stars) {
        stars.rotation.y = elapsed * 0.01;
      }

      renderer.render(scene, camera);
    };

    stateRef.current.animFrameId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (stateRef.current.animFrameId) {
        cancelAnimationFrame(stateRef.current.animFrameId);
      }
      window.removeEventListener('pointermove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (mount && renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isBig]);

  // Trigger Thruster Burst
  const triggerThruster = () => {
    stateRef.current.isThrusterBoosting = true;
    stateRef.current.thrusterBoostTimer = 1.8;
    setThrusterActive(true);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Interactive 3D Astronaut Status Pill (Bottom-Right) */}
      <div className="absolute bottom-4 right-4 pointer-events-auto flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 px-3 py-1.5 rounded-full shadow-lg shadow-cyan-950/40 text-[11px] font-mono text-cyan-300">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="font-semibold tracking-wider text-slate-200">
          3D EVA ASTRONAUT
        </span>
        <span className="text-slate-500">|</span>
        <button
          onClick={triggerThruster}
          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-all flex items-center space-x-1 ${
            thrusterActive
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/50'
              : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/40'
          }`}
          title="Fire SAFER cold-gas thrusters"
        >
          <Flame className="w-3 h-3" />
          <span>{thrusterActive ? 'BOOSTING...' : 'THRUST'}</span>
        </button>

        <button
          onClick={() => setIsBig(!isBig)}
          className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          title="Toggle Astronaut Size"
        >
          {isBig ? 'SIZE: BIG' : 'SIZE: COMPACT'}
        </button>
      </div>
    </div>
  );
}
