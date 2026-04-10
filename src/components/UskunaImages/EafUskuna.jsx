import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import * as THREE from "three";

const DEFAULT_POINTS = [
  {
    id: "shell_top_left",
    label: "Korpus yuqori",
    value: 285,
    pos: [-2.8, 3.2, 1.5],
  },
  {
    id: "shell_mid_left",
    label: "Korpus o'rta",
    value: 312,
    pos: [-2.9, 1.8, 1.8],
  },
  {
    id: "shell_bot_left",
    label: "Korpus pastki",
    value: 338,
    pos: [-2.6, 0.5, 2.0],
  },
  {
    id: "shell_top_right",
    label: "O'ng yuqori",
    value: 278,
    pos: [2.8, 3.2, 1.5],
  },
  {
    id: "shell_mid_right",
    label: "O'ng o'rta",
    value: 305,
    pos: [2.9, 1.8, 1.8],
  },
  {
    id: "electrode_1",
    label: "Elektrod A",
    value: 41.5,
    pos: [-1.15, 6.4, 0],
    unit: "°C",
  },
  {
    id: "electrode_2",
    label: "Elektrod B",
    value: 37.4,
    pos: [0, 6.7, 0],
    unit: "°C",
  },
  {
    id: "electrode_3",
    label: "Elektrod C",
    value: 38.7,
    pos: [1.15, 6.4, 0],
    unit: "°C",
  },
  {
    id: "roof",
    label: "Qopqoq",
    value: 415,
    pos: [0, 5.1, 2.0],
  },
  {
    id: "offgas",
    label: "Gaz chiqish",
    value: 890,
    pos: [-4.1, 5.8, 0],
  },
  {
    id: "taphole",
    label: "Taphole",
    value: 1620,
    pos: [3.9, 0.35, 0],
  },
  {
    id: "bottom",
    label: "Taglik",
    value: 195,
    pos: [0, -1.2, 2.5],
  },
];

function getColorByTemp(value) {
  if (value < 300) return "#00e676";
  if (value < 400) return "#ffd740";
  if (value < 900) return "#ff9100";
  return "#ff1744";
}

function normalizePoints(points) {
  return points.map((p) => ({
    ...p,
    unit: p.unit || "°C",
    color: p.color || getColorByTemp(p.value),
  }));
}

function TempLabel({ point, style }) {
  return (
    <div
      style={{
        position: "absolute",
        transform: "translate(-50%, -100%)",
        pointerEvents: "none",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: -12,
          width: 1,
          height: 12,
          background: point.color,
          opacity: 0.45,
        }}
      />
      <div
        style={{
          minWidth: 72,
          padding: "5px 9px",
          borderRadius: 10,
          background: "rgba(7,12,22,0.86)",
          border: `1px solid ${point.color}44`,
          boxShadow: `0 10px 28px rgba(0,0,0,.35), 0 0 16px ${point.color}22`,
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            color: "#95a5b8",
            fontSize: 10,
            lineHeight: 1.1,
            marginBottom: 2,
            fontFamily: "Inter, sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          {point.label}
        </div>
        <div
          style={{
            color: point.color,
            fontSize: 13,
            lineHeight: 1.1,
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', san-serif",
            textShadow: `0 0 8px ${point.color}55`,
            whiteSpace: "nowrap",
          }}
        >
          {point.value < 100 ? point.value.toFixed(1) : Math.round(point.value)}
          {point.unit}
        </div>
      </div>
    </div>
  );
}

function createScene(container, width, height) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07111f);
  scene.fog = new THREE.FogExp2(0x07111f, 0.012);

  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 200);
  camera.position.set(10, 7, 13);
  camera.lookAt(0, 2, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  const shellMat = new THREE.MeshStandardMaterial({
    color: 0x8fa1b5,
    metalness: 0.72,
    roughness: 0.34,
  });
  const shellDarkMat = new THREE.MeshStandardMaterial({
    color: 0x4d6278,
    metalness: 0.58,
    roughness: 0.42,
  });
  const structureMat = new THREE.MeshStandardMaterial({
    color: 0x61778e,
    metalness: 0.62,
    roughness: 0.32,
  });
  const refractoryMat = new THREE.MeshStandardMaterial({
    color: 0x3f2a1d,
    metalness: 0.08,
    roughness: 0.92,
  });
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0xa1b2c5,
    metalness: 0.75,
    roughness: 0.22,
  });
  const electrodeMat = new THREE.MeshStandardMaterial({
    color: 0x262626,
    metalness: 0.25,
    roughness: 0.85,
  });
  const cableMat = new THREE.MeshStandardMaterial({
    color: 0x7d3b18,
    metalness: 0.3,
    roughness: 0.62,
  });
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xff6600,
    transparent: true,
    opacity: 0.8,
  });

  const shellGroup = new THREE.Group();

  const shell = new THREE.Mesh(
    new THREE.CylinderGeometry(2.85, 2.05, 2.55, 36),
    shellMat,
  );
  shell.position.y = 1.25;
  shell.castShadow = true;
  shell.receiveShadow = true;
  shellGroup.add(shell);

  const bottomPlate = new THREE.Mesh(
    new THREE.CylinderGeometry(2.0, 2.0, 0.28, 36),
    shellDarkMat,
  );
  bottomPlate.position.y = -0.14;
  bottomPlate.castShadow = true;
  shellGroup.add(bottomPlate);

  const refractory = new THREE.Mesh(
    new THREE.CylinderGeometry(2.68, 1.88, 2.3, 36, 1, true),
    refractoryMat,
  );
  refractory.position.y = 1.3;
  shellGroup.add(refractory);

  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 2.0, 0.92),
      panelMat,
    );
    const r = 2.9;
    panel.position.set(Math.cos(angle) * r, 1.5, Math.sin(angle) * r);
    panel.rotation.y = -angle;
    panel.castShadow = true;
    shellGroup.add(panel);
  }

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const rib = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.3, 0.16),
      structureMat,
    );
    rib.position.set(Math.cos(angle) * 2.98, 2.58, Math.sin(angle) * 2.98);
    rib.rotation.y = -angle;
    shellGroup.add(rib);
  }

  const spout = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.14, 1.2, 12),
    shellDarkMat,
  );
  spout.rotation.z = Math.PI / 2;
  spout.position.set(3.32, 0.48, 0);
  spout.castShadow = true;
  shellGroup.add(spout);

  const tapGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 18, 18),
    glowMat,
  );
  tapGlow.position.set(3.95, 0.5, 0);
  shellGroup.add(tapGlow);

  const slagDoor = new THREE.Mesh(
    new THREE.BoxGeometry(0.82, 1.0, 0.14),
    shellDarkMat,
  );
  slagDoor.position.set(0, 1.2, 2.95);
  slagDoor.castShadow = true;
  shellGroup.add(slagDoor);

  scene.add(shellGroup);

  const roofGroup = new THREE.Group();

  const roof = new THREE.Mesh(
    new THREE.CylinderGeometry(2.95, 2.95, 0.5, 36),
    structureMat,
  );
  roof.position.y = 2.76;
  roof.castShadow = true;
  roofGroup.add(roof);

  const roofRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.95, 0.09, 10, 48),
    panelMat,
  );
  roofRing.position.y = 3.0;
  roofRing.rotation.x = Math.PI / 2;
  roofGroup.add(roofRing);

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(2.95, 36, 18, 0, Math.PI * 2, 0, Math.PI / 6),
    shellDarkMat,
  );
  dome.position.y = 3.0;
  dome.castShadow = true;
  roofGroup.add(dome);

  [-1.0, 0, 1.0].forEach((x) => {
    const hole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.65, 16),
      new THREE.MeshBasicMaterial({ color: 0x050505 }),
    );
    hole.position.set(x, 3.0, 0);
    roofGroup.add(hole);
  });

  scene.add(roofGroup);

  const ductGroup = new THREE.Group();

  const duct1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 2.5, 14),
    shellDarkMat,
  );
  duct1.position.set(-2.55, 4.45, 0);
  duct1.rotation.z = Math.PI / 6;
  duct1.castShadow = true;
  ductGroup.add(duct1);

  const duct2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.5, 3.1, 14),
    shellDarkMat,
  );
  duct2.rotation.z = Math.PI / 2;
  duct2.position.set(-5.05, 5.72, 0);
  duct2.castShadow = true;
  ductGroup.add(duct2);

  scene.add(ductGroup);

  const electrodeGroup = new THREE.Group();
  [-1.0, 0, 1.0].forEach((x) => {
    const electrode = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 5.6, 12),
      electrodeMat,
    );
    electrode.position.set(x, 5.5, 0);
    electrode.castShadow = true;
    electrodeGroup.add(electrode);

    const clamp = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.34, 0.28, 12),
      structureMat,
    );
    clamp.position.set(x, 6.45, 0);
    electrodeGroup.add(clamp);

    const arc = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 16, 16),
      new THREE.MeshBasicMaterial({
        color: 0xffb300,
        transparent: true,
        opacity: 0.65,
      }),
    );
    arc.position.set(x, 2.78, 0);
    arc.userData = { isArc: true, seed: x };
    electrodeGroup.add(arc);

    for (let c = 0; c < 3; c++) {
      const offset = (c - 1) * 0.38;
      const points = [];
      for (let t = 0; t <= 10; t++) {
        const ty = 6.45 + t * 0.2;
        const tx = x + offset + Math.sin(t * 0.6) * 0.08;
        const tz = -1.5 - t * 0.16;
        points.push(new THREE.Vector3(tx, ty, tz));
      }
      const curve = new THREE.CatmullRomCurve3(points);
      const cable = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 20, 0.04, 6, false),
        cableMat,
      );
      cable.castShadow = true;
      electrodeGroup.add(cable);
    }
  });
  scene.add(electrodeGroup);

  const mastGroup = new THREE.Group();

  const mast = new THREE.Mesh(new THREE.BoxGeometry(0.4, 9, 0.4), structureMat);
  mast.position.set(0, 4.5, -3.55);
  mast.castShadow = true;
  mastGroup.add(mast);

  const mastBase = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.5, 1.5),
    shellDarkMat,
  );
  mastBase.position.set(0, 0.25, -3.55);
  mastGroup.add(mastBase);

  [-1.0, 0, 1.0].forEach((x) => {
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.35, 3.8),
      structureMat,
    );
    arm.position.set(x, 7.2, -1.8);
    arm.castShadow = true;
    mastGroup.add(arm);
  });

  const transformer = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 2.4, 2.05),
    new THREE.MeshStandardMaterial({
      color: 0x425466,
      metalness: 0.58,
      roughness: 0.42,
    }),
  );
  transformer.position.set(0, 1.24, -5.6);
  transformer.castShadow = true;
  transformer.receiveShadow = true;
  mastGroup.add(transformer);

  for (let i = 0; i < 8; i++) {
    const fin = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 2.0, 2.18),
      panelMat,
    );
    fin.position.set(-1.5 + i * 0.42, 1.24, -5.6);
    mastGroup.add(fin);
  }

  scene.add(mastGroup);

  const platformGroup = new THREE.Group();

  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(9.2, 0.25, 9.2),
    new THREE.MeshStandardMaterial({
      color: 0x3d4d5d,
      metalness: 0.45,
      roughness: 0.5,
    }),
  );
  platform.position.y = -0.5;
  platform.receiveShadow = true;
  platformGroup.add(platform);

  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(15, 0.1, 15),
    new THREE.MeshStandardMaterial({
      color: 0x182231,
      metalness: 0.08,
      roughness: 0.94,
    }),
  );
  ground.position.y = -2.5;
  ground.receiveShadow = true;
  platformGroup.add(ground);

  scene.add(platformGroup);

  const ellipseMat = new THREE.MeshBasicMaterial({
    color: 0x00e676,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
  });
  const ellipse = new THREE.Mesh(
    new THREE.RingGeometry(4.55, 5.0, 64),
    ellipseMat,
  );
  ellipse.rotation.x = -Math.PI / 2;
  ellipse.position.y = -0.39;
  ellipse.scale.set(1, 1.5, 1);
  scene.add(ellipse);

  const inner = new THREE.Mesh(
    new THREE.CircleGeometry(4.5, 64),
    new THREE.MeshBasicMaterial({
      color: 0x00e676,
      transparent: true,
      opacity: 0.04,
      side: THREE.DoubleSide,
    }),
  );
  inner.rotation.x = -Math.PI / 2;
  inner.position.y = -0.38;
  inner.scale.set(1, 1.5, 1);
  scene.add(inner);

  const moltenMat = new THREE.MeshBasicMaterial({
    color: 0xff5a00,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
  });
  const molten = new THREE.Mesh(new THREE.CircleGeometry(2.52, 32), moltenMat);
  molten.rotation.x = -Math.PI / 2;
  molten.position.y = 2.56;
  scene.add(molten);

  scene.add(new THREE.AmbientLight(0x33445a, 0.72));

  const keyLight = new THREE.DirectionalLight(0xffffff, 0.95);
  keyLight.position.set(8, 12, 6);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 30;
  keyLight.shadow.camera.left = -10;
  keyLight.shadow.camera.right = 10;
  keyLight.shadow.camera.top = 10;
  keyLight.shadow.camera.bottom = -10;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x3f88ff, 0.35);
  rimLight.position.set(-6, 4, -8);
  scene.add(rimLight);

  const interiorLight = new THREE.PointLight(0xff6a00, 1.8, 8);
  interiorLight.position.set(0, 2.5, 0);
  scene.add(interiorLight);

  const tapLight = new THREE.PointLight(0xff3d00, 1.4, 4);
  tapLight.position.set(3.95, 0.5, 0);
  scene.add(tapLight);

  return {
    scene,
    camera,
    renderer,
    ellipseMat,
    moltenMat,
    interiorLight,
    tapLight,
    tapGlow,
  };
}

function useManualOrbit(canvasRef) {
  const state = useRef({
    isDragging: false,
    lastX: 0,
    lastY: 0,
    theta: 0.82,
    phi: 0.92,
    radius: 15.6,
    targetTheta: 0.82,
    targetPhi: 0.92,
    targetRadius: 15.6,
  });

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const onDown = (e) => {
      state.current.isDragging = true;
      const p = e.touches ? e.touches[0] : e;
      state.current.lastX = p.clientX;
      state.current.lastY = p.clientY;
      el.style.cursor = "grabbing";
    };

    const onMove = (e) => {
      if (!state.current.isDragging) return;
      e.preventDefault();
      const p = e.touches ? e.touches[0] : e;
      const dx = p.clientX - state.current.lastX;
      const dy = p.clientY - state.current.lastY;

      state.current.targetTheta -= dx * 0.006;
      state.current.targetPhi = Math.max(
        0.3,
        Math.min(1.45, state.current.targetPhi - dy * 0.006),
      );

      state.current.lastX = p.clientX;
      state.current.lastY = p.clientY;
    };

    const onUp = () => {
      state.current.isDragging = false;
      el.style.cursor = "grab";
    };

    const onWheel = (e) => {
      e.preventDefault();
      state.current.targetRadius = Math.max(
        9.5,
        Math.min(24, state.current.targetRadius + e.deltaY * 0.01),
      );
    };

    el.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    el.addEventListener("touchstart", onDown, { passive: false });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);

    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);

      el.removeEventListener("touchstart", onDown);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);

      el.removeEventListener("wheel", onWheel);
    };
  }, [canvasRef]);

  return state;
}

export default function EAFFurnace3D({
  temperatures = DEFAULT_POINTS,
  width = "100%",
  height = 620,
  title = "Elektr Yoy Pechi — EAF",
}) {
  const mountRef = useRef(null);
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const [labelPositions, setLabelPositions] = useState([]);
  const [dims, setDims] = useState({ w: 800, h: 620 });
  const orbitRef = useManualOrbit(canvasRef);

  const points = useMemo(() => normalizePoints(temperatures), [temperatures]);

  const projectToScreen = useCallback((pos3d, camera, w, h) => {
    const v = new THREE.Vector3(pos3d[0], pos3d[1], pos3d[2]);
    v.project(camera);
    return {
      x: (v.x * 0.5 + 0.5) * w,
      y: (-v.y * 0.5 + 0.5) * h,
      z: v.z,
    };
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const widthPx = container.getBoundingClientRect().width || 800;
    const heightPx = typeof height === "number" ? height : 620;
    setDims({ w: widthPx, h: heightPx });

    const {
      scene,
      camera,
      renderer,
      ellipseMat,
      moltenMat,
      interiorLight,
      tapLight,
      tapGlow,
    } = createScene(container, widthPx, heightPx);

    canvasRef.current = renderer.domElement;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.borderRadius = "18px";
    renderer.domElement.style.cursor = "grab";

    const clock = new THREE.Clock();
    let t = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      t += dt;

      const s = orbitRef.current;
      s.theta += (s.targetTheta - s.theta) * 0.085;
      s.phi += (s.targetPhi - s.phi) * 0.085;
      s.radius += (s.targetRadius - s.radius) * 0.08;

      camera.position.x = s.radius * Math.sin(s.phi) * Math.sin(s.theta);
      camera.position.y = s.radius * Math.cos(s.phi);
      camera.position.z = s.radius * Math.sin(s.phi) * Math.cos(s.theta);
      camera.lookAt(0, 2, 0);

      ellipseMat.opacity = 0.2 + Math.sin(t * 1.6) * 0.05;
      moltenMat.opacity = 0.38 + Math.sin(t * 2.4) * 0.08;
      interiorLight.intensity = 1.65 + Math.sin(t * 2.8) * 0.28;
      tapLight.intensity = 1.2 + Math.sin(t * 3.2) * 0.2;
      tapGlow.material.opacity = 0.58 + Math.sin(t * 3) * 0.16;

      scene.traverse((obj) => {
        if (obj.userData?.isArc) {
          obj.material.opacity =
            0.45 + Math.sin(t * 5 + obj.userData.seed * 2) * 0.16;
          const sc = 0.9 + Math.sin(t * 6 + obj.userData.seed) * 0.14;
          obj.scale.setScalar(sc);
        }
      });

      renderer.render(scene, camera);

      const nextLabels = points.map((p) => {
        const sp = projectToScreen(p.pos, camera, widthPx, heightPx);
        return {
          ...p,
          screenX: sp.x,
          screenY: sp.y,
          behind: sp.z > 1,
        };
      });

      setLabelPositions(nextLabels);
    };

    animate();

    const handleResize = () => {
      const w = container.getBoundingClientRect().width || 800;
      const h = typeof height === "number" ? height : 620;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      setDims({ w, h });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [height, orbitRef, points, projectToScreen]);

  return (
    <div
      style={{
        position: "relative",
        width,
        overflow: "hidden",
        borderRadius: 18,
        background:
          "linear-gradient(180deg, rgba(8,16,28,0.98) 0%, rgba(5,10,18,1) 100%)",
        border: "1px solid rgba(90,130,170,.22)",
        boxShadow:
          "0 24px 80px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.03)",
      }}
    >
      <div
        ref={mountRef}
        style={{
          position: "relative",
          width: "100%",
          height,
          background:
            "radial-gradient(circle at top, rgba(40,90,140,.12), transparent 40%)",
        }}
      >
        {labelPositions
          .filter(
            (l) =>
              !l.behind &&
              l.screenX > 32 &&
              l.screenX < dims.w - 32 &&
              l.screenY > 32 &&
              l.screenY < dims.h - 32,
          )
          .map((l) => (
            <TempLabel
              key={l.id}
              point={l}
              style={{ left: l.screenX, top: l.screenY }}
            />
          ))}
      </div>

      <div
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          display: "flex",
          flexDirection: "column",
          gap: 5,
          padding: "10px 12px",
          borderRadius: 12,
          background: "rgba(6,12,22,0.72)",
          border: "1px solid rgba(95,150,190,.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            color: "#55c7ff",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1.6,
            textTransform: "uppercase",
            fontFamily: "Inter, sans-serif",
          }}
        >
          3D Monitor
        </div>
        <div
          style={{
            color: "#e7edf5",
            fontSize: 16,
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', san-serif",
          }}
        >
          {title}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          padding: "10px 12px",
          borderRadius: 12,
          background: "rgba(6,12,22,0.72)",
          border: "1px solid rgba(95,150,190,.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        {[
          { color: "#00e676", label: "Normal < 300°C" },
          { color: "#ffd740", label: "O'rtacha 300–400°C" },
          { color: "#ff9100", label: "Yuqori 400–900°C" },
          { color: "#ff1744", label: "Kritik > 900°C" },
        ].map((item) => (
          <div
            key={item.label}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: item.color,
                boxShadow: `0 0 10px ${item.color}66`,
              }}
            />
            <span
              style={{
                color: "#a8b7c8",
                fontSize: 11,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 14,
          left: 14,
          padding: "8px 11px",
          borderRadius: 10,
          background: "rgba(6,12,22,0.72)",
          border: "1px solid rgba(95,150,190,.2)",
          backdropFilter: "blur(10px)",
          color: "#91a5bb",
          fontSize: 11,
          fontFamily: "Inter, sans-serif",
        }}
      >
        Sichqoncha bilan ushlab aylantiring · Scroll bilan zoom
      </div>
    </div>
  );
}
