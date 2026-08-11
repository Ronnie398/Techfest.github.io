(function () {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobileQuery = window.matchMedia("(max-width: 760px)");
  let isMobile = mobileQuery.matches;
  let registry = {};
  const domFocus = new Set();

  setupNavigation();
  setupDomFocus();
  observeFinale();

  if (!supportsWebGL() || typeof THREE === "undefined") {
    document.documentElement.classList.add("no-webgl");
    const note = document.getElementById("webgl-fallback-note");
    if (note) note.hidden = false;
    updateTimelineProgress();
    window.addEventListener("scroll", updateTimelineProgress, { passive: true });
    return;
  }

  initTechverse();

  function supportsWebGL() {
    try {
      const canvas = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
    } catch (error) {
      return false;
    }
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function setupNavigation() {
    const links = Array.from(document.querySelectorAll(".nav-links a, .nav-brand, .tech-button"));
    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        const hash = link.getAttribute("href");
        if (!hash || !hash.startsWith("#")) return;
        const target = document.querySelector(hash);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
        history.replaceState(null, "", hash);
      });
    });

    const sections = Array.from(document.querySelectorAll("[data-scene]"));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const id = visible.target.id;
      document.querySelectorAll(".nav-links a").forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
      });
    }, { threshold: [0.18, 0.35, 0.52] });
    sections.forEach((section) => observer.observe(section));
  }

  function setupDomFocus() {
    document.querySelectorAll("[data-focus]").forEach((element) => {
      const key = element.getAttribute("data-focus");
      const activate = () => setDomFocus(key, true, element);
      const deactivate = () => setDomFocus(key, false, element);
      element.addEventListener("pointerenter", activate);
      element.addEventListener("pointerleave", deactivate);
      element.addEventListener("focus", activate);
      element.addEventListener("blur", deactivate);
      element.addEventListener("click", () => {
        const object = registry[key];
        if (object) object.userData.pulse = 1;
      });
    });
  }

  function setDomFocus(key, active, element) {
    if (!key) return;
    if (active) domFocus.add(key);
    else domFocus.delete(key);
    if (element) element.classList.toggle("is-active", active);
    const object = registry[key];
    if (object) object.userData.domFocus = active;
  }

  function observeFinale() {
    const finale = document.getElementById("finale");
    if (!finale) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => finale.classList.toggle("in-view", entry.isIntersecting));
    }, { threshold: 0.35 });
    observer.observe(finale);
  }

  function sectionReveal(element) {
    if (!element) return 0;
    const rect = element.getBoundingClientRect();
    return clamp((window.innerHeight - rect.top) / (rect.height + window.innerHeight), 0, 1);
  }

  function updateTimelineProgress() {
    const timeline = document.getElementById("future");
    const track = document.querySelector(".timeline-track");
    if (!timeline || !track) return 0;
    const progress = sectionReveal(timeline);
    track.style.setProperty("--line-progress", Math.round(progress * 100) + "%");
    return progress;
  }

  function initTechverse() {
    const canvas = document.getElementById("webgl-stage");
    const tooltip = document.getElementById("object-tooltip");
    const tooltipTitle = tooltip ? tooltip.querySelector("strong") : null;
    const tooltipBody = tooltip ? tooltip.querySelector("span") : null;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isMobile,
      alpha: false,
      powerPreference: "high-performance"
    });
    renderer.setClearColor(0x02030a, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02030a, 0.012);

    const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 900);
    camera.position.set(0, 1.8, 38);

    const ambient = new THREE.AmbientLight(0x87cfff, 0.36);
    const keyLight = new THREE.PointLight(0x00f6ff, 2.5, 190);
    const violetLight = new THREE.PointLight(0x9a4dff, 2.1, 220);
    const finalLight = new THREE.PointLight(0xffffff, 1.2, 140);
    keyLight.position.set(-18, 20, 34);
    violetLight.position.set(28, -4, -120);
    finalLight.position.set(0, 0, -560);
    scene.add(ambient, keyLight, violetLight, finalLight);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-10, -10);
    const pointerTarget = new THREE.Vector2(0, 0);
    const lookTarget = new THREE.Vector3(0, 0, 0);
    const interactiveMeshes = [];
    const interactiveGroups = [];
    const sectionFocus = {};
    const sections = Array.from(document.querySelectorAll("[data-scene]"));
    const worldZ = { hero: 0, gateway: -70, technologies: -140, lab: -210, events: -280, timeline: -350, city: -420, register: -490, finale: -560 };
    let scrollTarget = 0;
    let scrollSmooth = 0;
    let hoveredObject = null;
    let pageVisible = true;
    let elapsed = 0;
    let lastTime = performance.now();

    registry = {};
    const hero = buildHero(worldZ.hero);
    const gateway = buildGateway(worldZ.gateway);
    const technologies = buildTechnologies(worldZ.technologies);
    const lab = buildLab(worldZ.lab);
    const events = buildEvents(worldZ.events);
    const timeline = buildTimeline(worldZ.timeline);
    const city = buildCity(worldZ.city);
    const register = buildRegister(worldZ.register);
    const finale = buildFinale(worldZ.finale);
    const starField = createStarField(isMobile ? 720 : 1650, 230, -610, 70);
    scene.add(starField);
    addWorldGrids();

    Object.keys(registry).forEach((key) => {
      if (domFocus.has(key)) registry[key].userData.domFocus = true;
    });

    updateScrollTarget();
    updateSectionFocus();
    updateTimelineProgress();

    window.addEventListener("scroll", () => {
      updateScrollTarget();
      updateTimelineProgress();
    }, { passive: true });
    window.addEventListener("resize", resizeRenderer);
    const handleMobileChange = () => {
      isMobile = mobileQuery.matches;
      resizeRenderer();
    };
    if (mobileQuery.addEventListener) mobileQuery.addEventListener("change", handleMobileChange);
    else if (mobileQuery.addListener) mobileQuery.addListener(handleMobileChange);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", () => {
      pointer.set(-10, -10);
      pointerTarget.set(0, 0);
    });
    document.addEventListener("visibilitychange", () => {
      pageVisible = !document.hidden;
    });

    animate(performance.now());

    function onPointerMove(event) {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
      pointerTarget.x = pointer.x;
      pointerTarget.y = pointer.y;
      if (!tooltip) return;
      const maxX = window.innerWidth - 280;
      const maxY = window.innerHeight - 150;
      tooltip.style.left = clamp(event.clientX, 12, Math.max(12, maxX)) + "px";
      tooltip.style.top = clamp(event.clientY, 12, Math.max(12, maxY)) + "px";
    }

    function resizeRenderer() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.75));
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function updateScrollTarget() {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollTarget = clamp(window.scrollY / maxScroll, 0, 1);
      document.documentElement.style.setProperty("--scroll-progress", scrollTarget.toFixed(4));
    }

    function updateSectionFocus() {
      const mid = window.innerHeight * 0.5;
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const center = rect.top + rect.height * 0.5;
        const distance = Math.abs(center - mid);
        sectionFocus[section.dataset.scene] = clamp(1 - distance / (window.innerHeight * 0.92), 0, 1);
      });
    }

    function animate(now) {
      requestAnimationFrame(animate);
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      if (!pageVisible) return;
      elapsed += delta;
      updateSectionFocus();
      scrollSmooth += (scrollTarget - scrollSmooth) * (reducedMotion ? 0.18 : 0.075);

      const travel = 560;
      const cameraZ = 38 - scrollSmooth * travel;
      const cityFocus = sectionFocus.city || 0;
      const finalFocus = sectionFocus.finale || 0;
      const pointerEase = isMobile ? 0.55 : 1;
      const xDrift = Math.sin(scrollSmooth * Math.PI * 5.1) * 1.35 + cityFocus * Math.sin(elapsed * 0.24) * 3.5;
      const yDrift = Math.sin(scrollSmooth * Math.PI * 7.4) * 0.7 + finalFocus * 0.9;
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointerTarget.x * 3.1 * pointerEase + xDrift, 0.052);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.8 + pointerTarget.y * 1.55 * pointerEase + yDrift, 0.052);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, cameraZ, 0.07);
      lookTarget.set(pointerTarget.x * 3.4 * pointerEase + cityFocus * Math.sin(elapsed * 0.18) * 2, pointerTarget.y * 1.4 * pointerEase, camera.position.z - 38);
      camera.lookAt(lookTarget);

      keyLight.position.x = Math.sin(elapsed * 0.32) * 18;
      keyLight.position.z = camera.position.z + 44;
      violetLight.position.z = camera.position.z - 35;
      scene.fog.density = THREE.MathUtils.lerp(scene.fog.density, 0.011 + cityFocus * 0.013 + finalFocus * 0.006, 0.035);

      animateHero(hero, elapsed);
      animateGateway(gateway, elapsed, sectionFocus.gateway || 0);
      animateTechnologies(technologies, elapsed, sectionFocus.technologies || 0);
      animateLab(lab, elapsed);
      animateEvents(events, elapsed, sectionFocus.events || 0);
      animateTimeline(timeline, elapsed, updateTimelineProgress());
      animateCity(city, elapsed, cityFocus);
      animateRegister(register, elapsed, sectionFocus.register || 0);
      animateFinale(finale, elapsed, finalFocus);
      updateInteractiveGroups(elapsed);
      updateRaycaster();

      starField.rotation.y += delta * 0.008;
      starField.position.z = camera.position.z * 0.08;
      renderer.render(scene, camera);
    }

    function registerInteractive(group, key, title, body) {
      group.userData.key = key;
      group.userData.title = title;
      group.userData.body = body;
      group.userData.root = true;
      group.userData.baseScale = group.scale.x || 1;
      group.userData.basePosition = group.position.clone();
      group.userData.hoverAmount = 0;
      group.userData.pulse = 0;
      group.userData.materials = [];
      group.traverse((child) => {
        if (child !== group) child.userData.interactiveParent = group;
        if (child.isMesh) interactiveMeshes.push(child);
        if (child.material && !Array.isArray(child.material)) {
          child.material.userData.baseOpacity = child.material.opacity === undefined ? 1 : child.material.opacity;
          child.material.userData.baseEmissive = child.material.emissiveIntensity || 0;
          child.material.userData.baseSize = child.material.size || 0;
          group.userData.materials.push(child.material);
        }
      });
      interactiveGroups.push(group);
      registry[key] = group;
      return group;
    }

    function updateInteractiveGroups(time) {
      interactiveGroups.forEach((group, index) => {
        const active = group === hoveredObject || group.userData.domFocus;
        const pulse = group.userData.pulse || 0;
        const target = active ? 1 : 0;
        group.userData.hoverAmount = THREE.MathUtils.lerp(group.userData.hoverAmount, target, 0.13);
        group.userData.pulse = Math.max(0, pulse - 0.045);
        const boost = group.userData.hoverAmount + pulse * 0.65;
        const base = group.userData.basePosition;
        group.scale.setScalar(group.userData.baseScale * (1 + boost * 0.16));
        group.position.y = base.y + Math.sin(time * (0.72 + index * 0.015) + index) * 0.28 + boost * 0.62;
        group.userData.materials.forEach((material) => {
          if (material.opacity !== undefined) material.opacity = clamp(material.userData.baseOpacity + boost * 0.25, 0.04, 1);
          if (material.emissiveIntensity !== undefined) material.emissiveIntensity = material.userData.baseEmissive + boost * 0.85;
          if (material.size !== undefined && material.userData.baseSize) material.size = material.userData.baseSize * (1 + boost * 1.7);
        });
      });
    }

    function updateRaycaster() {
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(interactiveMeshes, true)[0];
      const next = hit ? findInteractiveRoot(hit.object) : null;
      if (next === hoveredObject) return;
      hoveredObject = next;
      if (!tooltip || !tooltipTitle || !tooltipBody) return;
      if (hoveredObject) {
        tooltipTitle.textContent = hoveredObject.userData.title || "Techverse Object";
        tooltipBody.textContent = hoveredObject.userData.body || "Interactive system online.";
        tooltip.classList.add("is-visible");
        tooltip.setAttribute("aria-hidden", "false");
      } else {
        tooltip.classList.remove("is-visible");
        tooltip.setAttribute("aria-hidden", "true");
      }
    }

    function findInteractiveRoot(object) {
      let current = object;
      while (current) {
        if (current.userData.root) return current;
        if (current.userData.interactiveParent) return current.userData.interactiveParent;
        current = current.parent;
      }
      return null;
    }

    function makeStandard(color, emissive, intensity, opacity) {
      return new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: intensity, metalness: 0.72, roughness: 0.22, transparent: opacity < 1, opacity });
    }

    function makeNeon(color, opacity) {
      return new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
    }

    function makeWire(geometry, color, opacity) {
      return new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity, blending: THREE.AdditiveBlending }));
    }

    function addEdges(mesh, color, opacity) {
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending }));
      mesh.add(edges);
      return edges;
    }

    function createLocalParticles(count, radius, color, size) {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i += 1) {
        const r = radius * (0.4 + Math.random() * 0.6);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
        positions[i * 3 + 1] = Math.cos(phi) * r;
        positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;
      }
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      return new THREE.Points(geometry, new THREE.PointsMaterial({ color, size, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
    }

    function createStarField(count, spread, zMin, zMax) {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const colorA = new THREE.Color(0x00f6ff);
      const colorB = new THREE.Color(0x9a4dff);
      const colorC = new THREE.Color(0xffffff);
      for (let i = 0; i < count; i += 1) {
        positions[i * 3] = (Math.random() - 0.5) * spread;
        positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.62;
        positions[i * 3 + 2] = zMin + Math.random() * (zMax - zMin);
        const color = Math.random() < 0.45 ? colorA : (Math.random() < 0.8 ? colorB : colorC);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      return new THREE.Points(geometry, new THREE.PointsMaterial({ size: isMobile ? 0.12 : 0.16, transparent: true, opacity: 0.72, vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    }

    function makeBillboardTexture(lines, color) {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "rgba(0, 8, 20, 0.36)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = color;
      ctx.lineWidth = 5;
      ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28);
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 1;
      for (let y = 48; y < canvas.height; y += 26) {
        ctx.beginPath();
        ctx.moveTo(24, y);
        ctx.lineTo(canvas.width - 24, y);
        ctx.stroke();
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = color;
      ctx.shadowBlur = 18;
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 42px Orbitron, monospace";
      ctx.fillText(lines[0], canvas.width / 2, 104);
      ctx.font = "500 22px Inter, sans-serif";
      ctx.fillStyle = color;
      ctx.fillText(lines[1] || "", canvas.width / 2, 154);
      return new THREE.CanvasTexture(canvas);
    }

    function createBillboard(lines, width, height, colorValue) {
      const color = "#" + colorValue.toString(16).padStart(6, "0");
      return new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        new THREE.MeshBasicMaterial({ map: makeBillboardTexture(lines, color), transparent: true, opacity: 0.78, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
      );
    }

    function addWorldGrids() {
      [0, -70, -140, -210, -280, -350, -420, -490, -560].forEach((z, index) => {
        const grid = new THREE.GridHelper(index === 6 ? 96 : 68, index === 6 ? 48 : 34, 0x00f6ff, 0x17345f);
        grid.position.set(0, -12.5, z - 10);
        grid.material.transparent = true;
        grid.material.opacity = index === 6 ? 0.24 : 0.13;
        scene.add(grid);
      });
    }

    function buildHero(z) {
      const group = new THREE.Group();
      group.position.set(8, 0, z);
      const core = new THREE.Mesh(new THREE.IcosahedronGeometry(6.4, 3), makeStandard(0x071831, 0x00f6ff, 0.86, 0.7));
      const inner = new THREE.Mesh(new THREE.SphereGeometry(3.2, 48, 32), makeNeon(0x00f6ff, 0.24));
      const wireA = makeWire(new THREE.IcosahedronGeometry(7.1, 2), 0x9ffbff, 0.35);
      const wireB = makeWire(new THREE.DodecahedronGeometry(8.4, 0), 0x9a4dff, 0.18);
      const rings = [];
      for (let i = 0; i < 4; i += 1) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(8.4 + i * 0.65, 0.035 + i * 0.01, 12, 160), makeNeon(i % 2 ? 0x9a4dff : 0x00f6ff, 0.72 - i * 0.08));
        ring.rotation.x = Math.PI / 2 + i * 0.52;
        ring.rotation.y = i * 0.38;
        rings.push(ring);
        group.add(ring);
      }
      const points = createLocalParticles(isMobile ? 90 : 160, 11.5, 0x00f6ff, isMobile ? 0.08 : 0.1);
      group.add(core, inner, wireA, wireB, points);
      scene.add(group);
      return { group, core, inner, wireA, wireB, rings, points };
    }

    function animateHero(hero, time) {
      hero.group.rotation.y = time * 0.085 + pointerTarget.x * 0.13;
      hero.group.rotation.x = pointerTarget.y * 0.075;
      hero.core.rotation.y = time * 0.18;
      hero.core.rotation.x = time * 0.08;
      hero.inner.scale.setScalar(1 + Math.sin(time * 2.2) * 0.045);
      hero.wireA.rotation.y = -time * 0.12;
      hero.wireB.rotation.x = time * 0.08;
      hero.rings.forEach((ring, index) => {
        ring.rotation.z += 0.0025 + index * 0.0009;
        ring.rotation.y += 0.001;
      });
      hero.points.rotation.y = -time * 0.04;
    }

    function buildGateway(z) {
      const group = new THREE.Group();
      group.position.set(-5, 0, z);
      const rings = [];
      for (let i = 0; i < 10; i += 1) {
        const torus = new THREE.Mesh(new THREE.TorusGeometry(7.8 + i * 0.28, 0.08, 16, 180), makeNeon(i % 2 ? 0x2787ff : 0x00f6ff, 0.58 - i * 0.026));
        torus.position.z = -i * 1.18;
        torus.rotation.x = Math.PI / 2;
        torus.rotation.z = i * 0.15;
        rings.push(torus);
        group.add(torus);
      }
      const halo = new THREE.Mesh(new THREE.TorusGeometry(10.1, 0.18, 22, 220), makeNeon(0x9a4dff, 0.38));
      const spokes = new THREE.Group();
      halo.rotation.x = Math.PI / 2;
      for (let i = 0; i < 20; i += 1) {
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.035, 3.2, 0.035), makeNeon(0x00f6ff, 0.34));
        const angle = (Math.PI * 2 * i) / 20;
        spoke.position.set(Math.cos(angle) * 8.8, Math.sin(angle) * 8.8, 0);
        spoke.rotation.z = angle;
        spokes.add(spoke);
      }
      const particles = createLocalParticles(isMobile ? 80 : 140, 13.5, 0x9a4dff, 0.09);
      group.add(halo, spokes, particles);
      scene.add(group);
      return { group, rings, halo, spokes, particles };
    }

    function animateGateway(portal, time, focus) {
      portal.group.scale.setScalar(0.82 + focus * 0.36 + Math.sin(time * 1.3) * 0.012);
      portal.group.rotation.z = time * 0.045 + pointerTarget.x * 0.08;
      portal.group.rotation.x = pointerTarget.y * 0.05;
      portal.halo.rotation.z = -time * 0.13;
      portal.spokes.rotation.z = time * 0.09;
      portal.particles.rotation.y = -time * 0.08;
      portal.rings.forEach((ring, index) => {
        ring.position.z = -index * (1.18 + focus * 0.42) + Math.sin(time * 1.2 + index) * 0.08;
        ring.rotation.z += 0.002 + focus * 0.004;
        ring.scale.setScalar(1 + focus * index * 0.012);
      });
    }

    function buildTechnologies(z) {
      const group = new THREE.Group();
      group.position.z = z;
      const techData = [
        { key: "ai", title: "AI & Machine Learning", body: "Neural nodes pulse with adaptive intelligence.", color: 0x00f6ff, pos: [-17, 7.2, 0], geometry: new THREE.IcosahedronGeometry(2.3, 1) },
        { key: "robotics", title: "Robotics", body: "Mechanical intelligence translates code into motion.", color: 0x9a4dff, pos: [0, 8.8, -3], geometry: new THREE.BoxGeometry(3.1, 3.1, 3.1) },
        { key: "cyber", title: "Cybersecurity", body: "Encrypted shields protect every connected layer.", color: 0x2787ff, pos: [17, 7.2, 0], geometry: new THREE.OctahedronGeometry(2.7, 1) },
        { key: "space", title: "Space & Aerospace", body: "Orbital systems map the next frontier.", color: 0xff4df2, pos: [-15, -4.7, -2], geometry: new THREE.ConeGeometry(1.9, 4.1, 6) },
        { key: "arvr", title: "AR / VR", body: "Spatial interfaces blend physical and digital realities.", color: 0x74ffb3, pos: [2, -5.6, 1], geometry: new THREE.TorusKnotGeometry(1.7, 0.45, 96, 12) },
        { key: "iot", title: "IoT & Smart Systems", body: "Distributed devices communicate as living infrastructure.", color: 0xffd166, pos: [17, -4.9, -1], geometry: new THREE.DodecahedronGeometry(2.3, 0) }
      ];
      const nodes = techData.map((item, index) => {
        const node = new THREE.Group();
        node.position.set(item.pos[0], item.pos[1], item.pos[2]);
        const mesh = new THREE.Mesh(item.geometry, makeStandard(0x07162f, item.color, 0.82, 0.82));
        const halo = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.04, 10, 120), makeNeon(item.color, 0.48));
        const vertical = new THREE.Mesh(new THREE.TorusGeometry(3.85, 0.035, 10, 120), makeNeon(item.color, 0.28));
        halo.rotation.x = Math.PI / 2;
        vertical.rotation.y = Math.PI / 2;
        addEdges(mesh, item.color, 0.76);
        node.add(mesh, halo, vertical, createLocalParticles(isMobile ? 22 : 38, 4.8, item.color, isMobile ? 0.07 : 0.09));
        registerInteractive(node, item.key, item.title, item.body);
        group.add(node);
        return { node, mesh, halo, vertical, index };
      });
      scene.add(group);
      return { group, nodes };
    }

    function animateTechnologies(tech, time, focus) {
      tech.group.rotation.y = Math.sin(time * 0.18) * 0.08 + pointerTarget.x * 0.045;
      tech.nodes.forEach((item) => {
        item.node.rotation.y += 0.004 + focus * 0.003;
        item.node.rotation.x = Math.sin(time * 0.44 + item.index) * 0.09;
        item.mesh.rotation.y += 0.006 + item.index * 0.0008;
        item.halo.rotation.z += 0.01 + focus * 0.012;
        item.vertical.rotation.x += 0.005;
      });
    }

    function buildLab(z) {
      const group = new THREE.Group();
      group.position.z = z;
      const parts = {};
      const floor = new THREE.GridHelper(52, 26, 0x9a4dff, 0x163660);
      floor.position.y = -8.6;
      floor.material.transparent = true;
      floor.material.opacity = 0.27;
      group.add(floor);

      const core = new THREE.Group();
      core.position.set(0, -1, 0);
      const coreSphere = new THREE.Mesh(new THREE.SphereGeometry(2.1, 40, 24), makeNeon(0x00f6ff, 0.4));
      const coreWire = makeWire(new THREE.IcosahedronGeometry(2.85, 2), 0xffffff, 0.32);
      const coreRingA = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.05, 12, 120), makeNeon(0x00f6ff, 0.62));
      const coreRingB = new THREE.Mesh(new THREE.TorusGeometry(4.1, 0.04, 12, 120), makeNeon(0x9a4dff, 0.46));
      coreRingA.rotation.x = Math.PI / 2;
      coreRingB.rotation.y = Math.PI / 2;
      core.add(coreSphere, coreWire, coreRingA, coreRingB, createLocalParticles(isMobile ? 35 : 62, 4.7, 0x00f6ff, 0.08));
      registerInteractive(core, "core", "Energy Core", "A stabilized reactor powering the digital laboratory.");
      group.add(core);
      parts.core = { group: core, sphere: coreSphere, wire: coreWire, rings: [coreRingA, coreRingB] };

      const arm = new THREE.Group();
      arm.position.set(-12, -6.7, -2);
      const armMaterial = makeStandard(0x111a32, 0x9a4dff, 0.42, 1);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.2, 0.85, 32), armMaterial);
      const shoulder = new THREE.Mesh(new THREE.SphereGeometry(1.25, 24, 16), makeStandard(0x0f2742, 0x00f6ff, 0.44, 1));
      const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.5, 6.4, 18), armMaterial.clone());
      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.95, 20, 14), makeStandard(0x0f2742, 0x00f6ff, 0.5, 1));
      const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.38, 5, 18), armMaterial.clone());
      const claw = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.08, 10, 36), makeNeon(0x00f6ff, 0.62));
      shoulder.position.y = 1.2;
      upper.position.set(2.5, 3.15, 0);
      upper.rotation.z = Math.PI / 2.7;
      elbow.position.set(5, 5.1, 0);
      forearm.position.set(7.3, 4.2, 0);
      forearm.rotation.z = Math.PI / 1.85;
      claw.position.set(9.3, 2.95, 0);
      arm.add(base, shoulder, upper, elbow, forearm, claw, createLocalParticles(22, 3.1, 0x9a4dff, 0.07));
      registerInteractive(arm, "arm", "Robotic Arm", "Precision actuator responding to Techverse gesture input.");
      group.add(arm);
      parts.arm = { group: arm, upper, forearm, claw };

      const processor = new THREE.Group();
      processor.position.set(12, -1.4, -1.5);
      const chip = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.5, 4.1), makeStandard(0x08182e, 0x2787ff, 0.62, 0.96));
      addEdges(chip, 0x00f6ff, 0.86);
      processor.add(chip, createLocalParticles(38, 4.6, 0x2787ff, 0.07));
      for (let i = 0; i < 18; i += 1) {
        const pin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.8), makeNeon(0x00f6ff, 0.58));
        const side = i % 4;
        const lane = Math.floor(i / 4) - 2;
        if (side === 0) pin.position.set(-2.5, 0, lane * 0.72);
        if (side === 1) pin.position.set(2.5, 0, lane * 0.72);
        if (side === 2) { pin.position.set(lane * 0.72, 0, -2.5); pin.rotation.y = Math.PI / 2; }
        if (side === 3) { pin.position.set(lane * 0.72, 0, 2.5); pin.rotation.y = Math.PI / 2; }
        processor.add(pin);
      }
      registerInteractive(processor, "processor", "Floating Processor", "A levitating computation unit routing live festival systems.");
      group.add(processor);
      parts.processor = { group: processor };

      const screen = new THREE.Group();
      screen.position.set(0, 4.4, -5.5);
      const screenPlane = createBillboard(["LAB MATRIX", "INTERACTIVE MODE"], 8.6, 4.2, 0x00f6ff);
      const frame = new THREE.Mesh(new THREE.BoxGeometry(9.2, 4.7, 0.08), makeNeon(0x00f6ff, 0.14));
      addEdges(frame, 0x00f6ff, 0.8);
      screen.add(frame, screenPlane);
      registerInteractive(screen, "screen", "Holographic Screen", "A transparent interface scanning every active Techverse object.");
      group.add(screen);
      parts.screen = { group: screen };

      const drone = new THREE.Group();
      drone.position.set(8, 6.7, 4);
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.45, 1.5), makeStandard(0x07142c, 0xff4df2, 0.68, 1));
      addEdges(body, 0xff4df2, 0.8);
      drone.add(body);
      const rotors = [];
      [[1.5, 1.5], [-1.5, 1.5], [1.5, -1.5], [-1.5, -1.5]].forEach((point) => {
        const armBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 2.3), makeNeon(0xff4df2, 0.4));
        armBar.position.set(point[0] * 0.5, 0, point[1] * 0.5);
        armBar.rotation.y = Math.atan2(point[0], point[1]);
        const rotor = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.035, 8, 32), makeNeon(0x00f6ff, 0.56));
        rotor.position.set(point[0], 0, point[1]);
        rotor.rotation.x = Math.PI / 2;
        drone.add(armBar, rotor);
        rotors.push(rotor);
      });
      registerInteractive(drone, "drone", "Autonomous Drone", "A lab scout tracking cursor movement and atmospheric data.");
      group.add(drone);
      parts.drone = { group: drone, rotors };

      const satellite = new THREE.Group();
      satellite.position.set(-6, 6.9, 4.5);
      const satCore = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1, 1), makeStandard(0x08182e, 0xffd166, 0.55, 1));
      const panelA = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 1.25), makeNeon(0x2787ff, 0.38));
      const panelB = panelA.clone();
      addEdges(satCore, 0xffd166, 0.7);
      panelA.position.x = -2.1;
      panelB.position.x = 2.1;
      satellite.add(satCore, panelA, panelB);
      group.add(satellite);
      parts.satellite = { group: satellite };

      scene.add(group);
      return { group, parts };
    }

    function animateLab(lab, time) {
      lab.group.rotation.y = pointerTarget.x * 0.035;
      lab.parts.core.group.rotation.y = time * 0.18;
      lab.parts.core.sphere.scale.setScalar(1 + Math.sin(time * 2.8) * 0.06);
      lab.parts.core.rings[0].rotation.z += 0.018;
      lab.parts.core.rings[1].rotation.x += 0.012;
      lab.parts.arm.upper.rotation.z = Math.PI / 2.7 + Math.sin(time * 0.8) * 0.1;
      lab.parts.arm.forearm.rotation.z = Math.PI / 1.85 + Math.cos(time * 0.9) * 0.12;
      lab.parts.arm.claw.rotation.z = time * 0.9;
      lab.parts.processor.group.rotation.y = time * 0.38;
      lab.parts.processor.group.rotation.x = Math.sin(time * 0.65) * 0.12;
      lab.parts.screen.group.rotation.y = Math.sin(time * 0.4) * 0.08 + pointerTarget.x * 0.06;
      lab.parts.drone.group.position.x = 8 + Math.sin(time * 0.9) * 1.6 + pointerTarget.x * 0.9;
      lab.parts.drone.group.position.y = 6.7 + Math.sin(time * 1.35) * 0.55;
      lab.parts.drone.rotors.forEach((rotor) => { rotor.rotation.z += 0.44; });
      lab.parts.satellite.group.rotation.y = time * 0.22;
      lab.parts.satellite.group.position.y = 6.9 + Math.sin(time * 0.7) * 0.5;
    }

    function buildEvents(z) {
      const group = new THREE.Group();
      group.position.z = z;
      const data = [
        ["hackathon", "Hackathon", "Build. Break. Innovate.", 0x00f6ff],
        ["eventrobotics", "Robotics", "Engineer the future.", 0x9a4dff],
        ["gaming", "Gaming", "Compete beyond reality.", 0xff4df2],
        ["aichallenge", "AI Challenge", "Turn intelligence into innovation.", 0x2787ff],
        ["expo", "Project Expo", "Showcase what you've built.", 0xffd166],
        ["workshops", "Workshops", "Learn from creators and experts.", 0x74ffb3]
      ];
      const panels = data.map((item, index) => {
        const eventGroup = new THREE.Group();
        const angle = -0.9 + index * 0.36;
        eventGroup.position.set(Math.sin(angle) * 20, Math.cos(angle) * 5 - 0.8, -Math.abs(index - 2.5) * 2.3);
        eventGroup.rotation.y = -angle * 0.45;
        const plane = createBillboard([item[1].toUpperCase(), item[2].toUpperCase()], 6.2, 3.25, item[3]);
        const back = new THREE.Mesh(new THREE.BoxGeometry(6.5, 3.55, 0.12), makeNeon(item[3], 0.13));
        const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 1), makeStandard(0x07152d, item[3], 0.8, 0.9));
        orb.position.set(-2.45, 1.1, 0.35);
        addEdges(back, item[3], 0.76);
        eventGroup.add(back, plane, orb, createLocalParticles(18, 2.8, item[3], 0.07));
        registerInteractive(eventGroup, item[0], item[1], item[2]);
        group.add(eventGroup);
        return { group: eventGroup, orb, index };
      });
      scene.add(group);
      return { group, panels };
    }

    function animateEvents(events, time, focus) {
      events.group.rotation.y = Math.sin(time * 0.2) * 0.08 + pointerTarget.x * 0.05;
      events.panels.forEach((panel) => {
        panel.group.rotation.x = Math.sin(time * 0.55 + panel.index) * 0.06;
        panel.group.position.y += Math.sin(time * 1.2 + panel.index) * 0.002 * (1 + focus);
        panel.orb.rotation.x += 0.018;
        panel.orb.rotation.y += 0.013;
      });
    }

    function buildTimeline(z) {
      const group = new THREE.Group();
      group.position.z = z;
      const base = new THREE.Mesh(new THREE.BoxGeometry(54, 0.08, 0.08), makeNeon(0x17345f, 0.24));
      const progress = new THREE.Mesh(new THREE.BoxGeometry(1, 0.16, 0.16), makeNeon(0x00f6ff, 0.8));
      base.position.y = -1.2;
      progress.position.set(-27, -1.2, 0.02);
      progress.scale.x = 0.001;
      progress.geometry.translate(0.5, 0, 0);
      group.add(base, progress);
      const labels = ["COMPUTE", "WEB", "AI", "ROBOT", "XR", "AUTO", "NEXT"];
      const milestones = [];
      for (let i = 0; i < 7; i += 1) {
        const node = new THREE.Group();
        node.position.set(-27 + i * 9, -1.2 + Math.sin(i) * 0.8, Math.sin(i * 2.1) * 2.2);
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 16), makeStandard(0x06172d, i % 2 ? 0x9a4dff : 0x00f6ff, 0.68, 0.95));
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.035, 8, 54), makeNeon(i % 2 ? 0x9a4dff : 0x00f6ff, 0.5));
        const label = createBillboard([labels[i], "MILESTONE"], 3.2, 1.35, i % 2 ? 0x9a4dff : 0x00f6ff);
        ring.rotation.x = Math.PI / 2;
        label.position.y = 2;
        node.add(sphere, ring, label);
        group.add(node);
        milestones.push({ group: node, sphere, ring, index: i });
      }
      scene.add(group);
      return { group, progress, milestones };
    }

    function animateTimeline(timeline, time, progress) {
      const eased = progress * progress * (3 - 2 * progress);
      timeline.progress.scale.x = Math.max(0.001, eased * 54);
      timeline.group.rotation.y = pointerTarget.x * 0.035 + Math.sin(time * 0.18) * 0.04;
      timeline.milestones.forEach((node) => {
        const active = eased * 6.2 >= node.index;
        node.group.position.y += Math.sin(time * 1.15 + node.index) * 0.003;
        node.sphere.scale.setScalar(1 + (active ? 0.22 : 0) + Math.sin(time * 2 + node.index) * 0.04);
        node.ring.rotation.z += active ? 0.024 : 0.008;
      });
    }

    function buildCity(z) {
      const group = new THREE.Group();
      group.position.z = z;
      const road = new THREE.Mesh(new THREE.BoxGeometry(8, 0.08, 90), makeNeon(0x00182a, 0.34));
      road.position.set(0, -8.4, 0);
      group.add(road);
      [-3.4, 0, 3.4].forEach((x, index) => {
        const line = new THREE.Mesh(new THREE.BoxGeometry(index === 1 ? 0.08 : 0.04, 0.05, 88), makeNeon(index === 1 ? 0x00f6ff : 0x9a4dff, 0.58));
        line.position.set(x, -8.28, 0);
        group.add(line);
      });
      const buildingMaterial = makeStandard(0x050914, 0x123a63, 0.28, 1);
      const glow = [0x00f6ff, 0x2787ff, 0x9a4dff, 0xff4df2];
      const buildingCount = isMobile ? 36 : 72;
      for (let i = 0; i < buildingCount; i += 1) {
        const side = i % 2 === 0 ? -1 : 1;
        const width = 2.5 + Math.random() * 3.2;
        const depth = 2.8 + Math.random() * 5.4;
        const height = 7 + Math.random() * 23;
        const x = side * (7 + Math.random() * 24);
        const localZ = -43 + Math.random() * 88;
        const building = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), buildingMaterial.clone());
        building.position.set(x, -8.35 + height / 2, localZ);
        addEdges(building, glow[i % glow.length], 0.18 + Math.random() * 0.24);
        group.add(building);
        const cap = new THREE.Mesh(new THREE.BoxGeometry(width * 0.9, 0.08, depth * 0.9), makeNeon(glow[i % glow.length], 0.34));
        cap.position.set(x, -8.25 + height, localZ);
        group.add(cap);
        if (i % 7 === 0) {
          const sign = createBillboard([i % 14 === 0 ? "TECHVERSE" : "FUTURE", i % 14 === 0 ? "CITY NODE" : "LIVE SIGNAL"], width * 1.8, Math.min(3.4, height * 0.22), glow[i % glow.length]);
          sign.position.set(x - side * (width / 2 + 0.06), -8.35 + height * 0.62, localZ);
          sign.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
          group.add(sign);
        }
      }
      const drones = [];
      for (let i = 0; i < (isMobile ? 4 : 7); i += 1) {
        const drone = new THREE.Group();
        drone.position.set(-18 + i * 6, 4 + Math.random() * 9, -32 + Math.random() * 64);
        const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45, 1), makeNeon(i % 2 ? 0xff4df2 : 0x00f6ff, 0.82));
        const trail = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.16, 3.2, 8), makeNeon(i % 2 ? 0xff4df2 : 0x00f6ff, 0.28));
        trail.rotation.x = Math.PI / 2;
        trail.position.z = 1.65;
        drone.add(body, trail);
        group.add(drone);
        drones.push({ group: drone, seed: Math.random() * 10 });
      }
      const fogPlane = new THREE.Mesh(new THREE.PlaneGeometry(90, 34), makeNeon(0x071f3f, 0.12));
      fogPlane.position.set(0, -4.4, -12);
      fogPlane.rotation.x = -Math.PI / 2.5;
      group.add(fogPlane);
      scene.add(group);
      return { group, drones, fogPlane };
    }

    function animateCity(city, time, focus) {
      city.group.position.x = Math.sin(time * 0.13) * 1.2 * focus;
      city.fogPlane.material.opacity = 0.08 + focus * 0.14;
      city.drones.forEach((drone, index) => {
        drone.group.position.x += Math.sin(time * 0.55 + drone.seed) * 0.012 * (1 + focus * 3);
        drone.group.position.y += Math.cos(time * 0.65 + drone.seed) * 0.008;
        drone.group.position.z += Math.sin(time * 0.4 + index) * 0.018;
        drone.group.rotation.y = time * 0.7 + index;
      });
    }

    function buildRegister(z) {
      const group = new THREE.Group();
      group.position.z = z;
      const rings = [];
      for (let i = 0; i < 5; i += 1) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(5 + i * 1.25, 0.035, 10, 160), makeNeon(i % 2 ? 0x9a4dff : 0x00f6ff, 0.24 + i * 0.04));
        ring.rotation.x = Math.PI / 2 + i * 0.25;
        ring.rotation.y = i * 0.36;
        group.add(ring);
        rings.push(ring);
      }
      const diamond = makeWire(new THREE.OctahedronGeometry(3.1, 1), 0xffffff, 0.24);
      group.add(diamond, createLocalParticles(isMobile ? 55 : 100, 11, 0x00f6ff, 0.08));
      scene.add(group);
      return { group, rings, diamond };
    }

    function animateRegister(register, time, focus) {
      register.group.position.y = Math.sin(time * 0.6) * 0.4;
      register.group.rotation.y = time * 0.06 + pointerTarget.x * 0.08;
      register.rings.forEach((ring, index) => {
        ring.rotation.z += 0.006 + index * 0.002 + focus * 0.008;
        ring.scale.setScalar(1 + focus * 0.08 + Math.sin(time + index) * 0.01);
      });
      register.diamond.rotation.x = time * 0.14;
      register.diamond.rotation.y = -time * 0.12;
    }

    function buildFinale(z) {
      const group = new THREE.Group();
      group.position.z = z;
      const core = new THREE.Mesh(new THREE.SphereGeometry(4.2, 56, 36), makeNeon(0x00f6ff, 0.28));
      const shell = makeWire(new THREE.IcosahedronGeometry(6.6, 3), 0xffffff, 0.28);
      const portalA = new THREE.Mesh(new THREE.TorusGeometry(8.2, 0.12, 16, 200), makeNeon(0x00f6ff, 0.6));
      const portalB = new THREE.Mesh(new THREE.TorusGeometry(10.2, 0.08, 16, 200), makeNeon(0x9a4dff, 0.42));
      const portalC = new THREE.Mesh(new THREE.TorusGeometry(12.6, 0.05, 16, 200), makeNeon(0xff4df2, 0.26));
      portalA.rotation.x = Math.PI / 2;
      portalB.rotation.y = Math.PI / 2;
      portalC.rotation.x = Math.PI / 2.4;
      group.add(core, shell, portalA, portalB, portalC);
      const count = isMobile ? 180 : 360;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const starts = new Float32Array(count * 3);
      const targets = new Float32Array(count * 3);
      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 14 + Math.random() * 28;
        const y = (Math.random() - 0.5) * 24;
        starts[i * 3] = Math.cos(angle) * radius;
        starts[i * 3 + 1] = y;
        starts[i * 3 + 2] = Math.sin(angle) * radius;
        targets[i * 3] = (Math.random() - 0.5) * 3.4;
        targets[i * 3 + 1] = (Math.random() - 0.5) * 3.4;
        targets[i * 3 + 2] = (Math.random() - 0.5) * 3.4;
        positions[i * 3] = starts[i * 3];
        positions[i * 3 + 1] = starts[i * 3 + 1];
        positions[i * 3 + 2] = starts[i * 3 + 2];
      }
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const particles = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x00f6ff, size: isMobile ? 0.11 : 0.15, transparent: true, opacity: 0.78, blending: THREE.AdditiveBlending, depthWrite: false }));
      group.add(particles);
      scene.add(group);
      return { group, core, shell, portals: [portalA, portalB, portalC], particles, starts, targets, count };
    }

    function animateFinale(finale, time, focus) {
      const glow = focus * focus;
      finale.group.rotation.y = time * 0.035 + pointerTarget.x * 0.06;
      finale.core.scale.setScalar(1 + glow * 0.45 + Math.sin(time * 2.4) * 0.035);
      finale.core.material.opacity = 0.22 + glow * 0.34;
      finale.shell.rotation.x = time * 0.09;
      finale.shell.rotation.y = -time * 0.11;
      finale.portals.forEach((portal, index) => {
        portal.rotation.z += 0.008 + index * 0.004 + glow * 0.02;
        portal.material.opacity = 0.24 + glow * (0.42 - index * 0.08);
      });
      const positions = finale.particles.geometry.attributes.position.array;
      for (let i = 0; i < finale.count; i += 1) {
        const ix = i * 3;
        const swirl = time * 0.9 + i * 0.07;
        const converge = clamp(glow, 0, 1);
        positions[ix] = THREE.MathUtils.lerp(finale.starts[ix] + Math.cos(swirl) * 1.2, finale.targets[ix], converge);
        positions[ix + 1] = THREE.MathUtils.lerp(finale.starts[ix + 1] + Math.sin(swirl * 0.8) * 1.2, finale.targets[ix + 1], converge);
        positions[ix + 2] = THREE.MathUtils.lerp(finale.starts[ix + 2] + Math.sin(swirl) * 1.2, finale.targets[ix + 2], converge);
      }
      finale.particles.geometry.attributes.position.needsUpdate = true;
      finalLight.intensity = 1.2 + glow * 3.8;
    }
  }
})();