"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

function makeTagTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 700;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#F5F4EF";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = "#0B0B0C";
  ctx.lineWidth = 10;
  ctx.strokeRect(10, 10, c.width - 20, c.height - 20);
  ctx.fillStyle = "#0B0B0C";
  ctx.textAlign = "center";
  ctx.font = "900 88px Arial";
  ctx.fillText("VERTIKAL", c.width / 2, 190);
  ctx.font = "400 22px monospace";
  ctx.fillText("SUPPLY CO. \u2014 LAGOS", c.width / 2, 240);
  ctx.beginPath();
  ctx.moveTo(60, 300);
  ctx.lineTo(c.width - 60, 300);
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.font = "700 26px monospace";
  ctx.textAlign = "left";
  ctx.fillText("STYLE", 60, 360);
  ctx.fillText("DROP", 60, 410);
  ctx.fillText("NO.", 60, 460);
  ctx.textAlign = "right";
  ctx.fillText("OC-014-BK", c.width - 60, 360);
  ctx.fillText("014 / FRIDAY", c.width - 60, 410);
  ctx.fillText("001 OF 200", c.width - 60, 460);
  let bx = 60;
  for (let i = 0; i < 40; i++) {
    const bw = Math.random() * 6 + 2;
    ctx.fillRect(bx, 560, bw, 90);
    bx += bw + (Math.random() * 6 + 3);
    if (bx > c.width - 60) break;
  }
  ctx.font = "400 18px monospace";
  ctx.textAlign = "center";
  ctx.fillText("4 895621 300145", c.width / 2, 680);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

// Interactive 3D garment hang tag — the hero's signature element.
// Drag to spin, subtle mouse parallax, gentle idle rotation otherwise.
export default function HeroTag3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const scene = new THREE.Scene();
    const getSize = () => ({ w: mount.clientWidth, h: mount.clientHeight });
    const { w, h } = getSize();

    const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(3, 5, 4);
    scene.add(dirLight);

    const tagGroup = new THREE.Group();
    scene.add(tagGroup);

    const tagGeo = new THREE.BoxGeometry(3.1, 4.3, 0.08);
    const faceTex = makeTagTexture();
    const edgeMat = new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 0.6 });
    const faceMat = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.7 });
    const tagMesh = new THREE.Mesh(tagGeo, [edgeMat, edgeMat, edgeMat, edgeMat, faceMat, faceMat]);
    tagMesh.position.y = -0.3;
    tagGroup.add(tagMesh);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.045, 16, 40),
      new THREE.MeshStandardMaterial({ color: 0xb9b6ac, metalness: 0.8, roughness: 0.3 })
    );
    ring.position.set(0, 1.75, 0);
    tagGroup.add(ring);

    const stringMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 1.8, 8),
      new THREE.MeshStandardMaterial({ color: 0x0b0b0c })
    );
    stringMesh.position.set(0, 2.65, 0);
    tagGroup.add(stringMesh);

    tagGroup.position.y = -0.4;
    tagGroup.rotation.set(0.08, -0.4, 0);

    let targetRotY = -0.4;
    let dragging = false;
    let lastX = 0;
    let autoSpin = !reducedMotion;
    let mouseX = 0;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      autoSpin = false;
      lastX = e.clientX;
    };
    const onPointerUp = () => {
      dragging = false;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (dragging) {
        targetRotY += (e.clientX - lastX) * 0.01;
        lastX = e.clientX;
      }
    };
    const onMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    };
    const onResize = () => {
      const size = getSize();
      camera.aspect = size.w / size.h;
      camera.updateProjectionMatrix();
      renderer.setSize(size.w, size.h);
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);

    let raf = 0;
    let t = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      t += 0.01;
      if (autoSpin) targetRotY += 0.004;
      tagGroup.rotation.y += (targetRotY - tagGroup.rotation.y) * 0.08;
      if (!reducedMotion) {
        tagGroup.rotation.z = Math.sin(t * 0.6) * 0.05 + mouseX * 0.06;
        tagGroup.position.y = -0.4 + Math.sin(t * 0.8) * 0.08;
      }
      camera.position.x += (mouseX * 0.6 - camera.position.x) * 0.05;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      faceTex.dispose();
      tagGeo.dispose();
      edgeMat.dispose();
      faceMat.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="relative h-full w-full"
      aria-label="Interactive 3D product tag — drag to spin"
      role="img"
    />
  );
}
