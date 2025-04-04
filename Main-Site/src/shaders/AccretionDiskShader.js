import * as THREE from "three";

export const AccretionDiskShader = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0.0 },
    color1: { value: new THREE.Color(0xff5500) },
    color2: { value: new THREE.Color(0xffaa00) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec3 color1;
    uniform vec3 color2;
    varying vec2 vUv;

    void main() {
      float dist = length(vUv - 0.5) * 2.0; // Abstand zur Mitte
      float glow = smoothstep(1.0, 0.5, dist) * sin(time * 2.0); // Glüheffekt
      vec3 color = mix(color1, color2, dist) * glow;
      gl_FragColor = vec4(color, 1.0 - dist); // Transparenz für äußere Bereiche
    }
  `,
  transparent: true,
});
