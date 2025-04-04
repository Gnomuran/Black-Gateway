<template>
    <div ref="sceneContainer" class="three-container"></div>
  </template>
  
  <script>
  import { ref, onMounted, onUnmounted } from "vue";
  import * as THREE from "three";
  import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  
  export default {
    setup() {
      const sceneContainer = ref(null);
      let renderer, scene, camera, model, controls, animationFrameId;
      let particleSystem;
  
      onMounted(() => {
        // Szene, Kamera & Renderer
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 2, 7);
  
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        sceneContainer.value.appendChild(renderer.domElement);
  
        // Lichtquelle
        const light = new THREE.PointLight(0xffaa00, 2, 10);
        light.position.set(0, 0, 0);
        scene.add(light);
  
        // Orbit Controls (zum Bewegen der Kamera)
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.5;
  
        // Modell laden (Schwarzes Loch)
        const loader = new GLTFLoader();
        loader.load("/models/black-hole.glb", (gltf) => {
          model = gltf.scene;
          scene.add(model);
        });
  
        // 🌟 Akkretionsscheibe als Partikel erzeugen
        const particleCount = 500;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
  
        for (let i = 0; i < particleCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 2 + Math.random() * 0.5; // Scheibenradius
          positions[i * 3] = Math.cos(angle) * radius; // X
          positions[i * 3 + 1] = (Math.random() - 0.5) * 0.2; // Y (leichte Höhe)
          positions[i * 3 + 2] = Math.sin(angle) * radius; // Z
        }
  
        particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  
        // Partikel-Material (glühende Punkte)
        const particleMaterial = new THREE.PointsMaterial({
          color: 0xff6600,
          size: 0.05,
          transparent: true,
          opacity: 0.8,
        });
  
        particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particleSystem);
  
        // Animationsloop
        const animate = () => {
          animationFrameId = requestAnimationFrame(animate);
  
          if (particleSystem) {
            particleSystem.rotation.y += 0.005; // Scheibe langsam drehen
          }
  
          if (model) model.rotation.y += 0.002; // Schwarzes Loch langsam rotieren
  
          controls.update();
          renderer.render(scene, camera);
        };
        animate();
      });
  
      // Cleanup
      onUnmounted(() => {
        cancelAnimationFrame(animationFrameId);
        renderer.dispose();
      });
  
      return { sceneContainer };
    },
  };
  </script>
  
  <style scoped>
  .three-container {
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
  </style>
  