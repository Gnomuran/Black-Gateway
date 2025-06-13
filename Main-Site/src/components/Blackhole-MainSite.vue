<template>
  <div class="blackhole-container">
    <canvas
      ref="blackholeCanvas"
      class="blackhole-canvas"
      :style="{ opacity: isVisible ? 1 : 0 }"
    ></canvas>
  </div>
</template>

<script>
export default {
  name: 'BlackholeMainSite',
  props: {
    // Farbkonfiguration als Props
    primaryColor: {
      type: Array,
      default: () => [0.3, 0.6, 1.0] // Blau statt Weiß
    },
    secondaryColor: {
      type: Array,
      default: () => [1.0, 0.4, 0.1] // Orange/Rot für Akzente
    },
    // Performance-Einstellungen
    lowPerformanceMode: {
      type: Boolean,
      default: false
    },
    autoPlay: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isVisible: false,
      animationId: null,
      gl: null,
      shaderProgram: null,
      startTime: null,
      observer: null,
      isInitialized: false,
      isPaused: false
    };
  },
  mounted() {
    this.setupIntersectionObserver();
  },
  beforeUnmount() {
    this.cleanup();
  },
  methods: {
    setupIntersectionObserver() {
      // Intersection Observer für Performance-Optimierung
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.isVisible = true;
              if (!this.isInitialized && this.autoPlay) {
                this.initBlackHole();
              } else if (this.isInitialized) {
                this.resumeAnimation();
              }
            } else {
              this.isVisible = false;
              this.pauseAnimation();
            }
          });
        },
        {
          threshold: 0.1, // Startet wenn 10% sichtbar
          rootMargin: '50px' // Etwas früher starten
        }
      );

      if (this.$refs.blackholeCanvas) {
        this.observer.observe(this.$refs.blackholeCanvas);
      }
    },

    pauseAnimation() {
      this.isPaused = true;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    },

    resumeAnimation() {
      if (this.isPaused && this.isInitialized) {
        this.isPaused = false;
        this.animate();
      }
    },

    cleanup() {
      if (this.observer) {
        this.observer.disconnect();
      }
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
      if (this.gl) {
        // WebGL Ressourcen freigeben
        const loseContext = this.gl.getExtension('WEBGL_lose_context');
        if (loseContext) {
          loseContext.loseContext();
        }
      }
    },

    initShaderProgram(gl, vsSource, fsSource) {
      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertexShader, vsSource);
      gl.compileShader(vertexShader);

      if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('Vertex shader error:', gl.getShaderInfoLog(vertexShader));
        return null;
      }

      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragmentShader, fsSource);
      gl.compileShader(fragmentShader);

      if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('Fragment shader error:', gl.getShaderInfoLog(fragmentShader));
        return null;
      }

      const shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vertexShader);
      gl.attachShader(shaderProgram, fragmentShader);
      gl.linkProgram(shaderProgram);

      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Shader program link error:', gl.getProgramInfoLog(shaderProgram));
        return null;
      }

      return shaderProgram;
    },

    createProceduralTextures(gl) {
      // Reduzierte Textur-Größe für bessere Performance
      const textureSize = this.lowPerformanceMode ? 256 : 512;

      const createNoiseTexture = (size) => {
        const data = new Uint8Array(size * size * 4);
        const octaves = this.lowPerformanceMode ? 4 : 6; // Weniger Oktaven für Low-Performance

        for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
            const index = (i * size + j) * 4;
            const x = i / size;
            const y = j / size;

            let noise = 0;
            let amplitude = 1;
            let frequency = 4;
            let maxValue = 0;

            for (let octave = 0; octave < octaves; octave++) {
              noise += Math.sin(x * frequency + Math.cos(y * frequency * 1.3)) *
                               Math.cos(y * frequency + Math.sin(x * frequency * 0.7)) * amplitude;

              maxValue += amplitude;
              amplitude *= 0.5;
              frequency *= 2.1;
            }

            noise = (noise / maxValue + 1) * 0.5;
            const turbulence = Math.sin(x * 23.7) * Math.cos(y * 19.3) * 0.1;
            noise += turbulence;

            const value = Math.floor(Math.max(0, Math.min(1, noise)) * 255);

            data[index] = value;
            data[index + 1] = value;
            data[index + 2] = value;
            data[index + 3] = 255;
          }
        }
        return data;
      };

      const createDustTexture = (size) => {
        const data = new Uint8Array(size * size * 4);
        for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
            const index = (i * size + j) * 4;
            const x = i / size;
            const y = j / size;

            let dust = 0;
            const fiber1 = Math.sin((x + y) * 25) * Math.exp(-Math.pow((x + y - 1) * 3, 2));
            const fiber2 = Math.sin((x - y + 0.5) * 20) * Math.exp(-Math.pow((x - y) * 2, 2));

            const angle = Math.atan2(y - 0.5, x - 0.5);
            const radius = Math.sqrt((x - 0.5) * (x - 0.5) + (y - 0.5) * (y - 0.5));
            const spiral = Math.sin(angle * 3 + radius * 15) * Math.exp(-radius * 2);

            const particles = (Math.random() < 0.1) ? Math.random() : 0;

            dust = fiber1 * 0.4 + fiber2 * 0.3 + spiral * 0.2 + particles * 0.1;
            dust = Math.pow(Math.abs(dust), 0.7);
            const value = Math.floor(Math.max(0, Math.min(1, dust)) * 255);

            data[index] = value;
            data[index + 1] = value;
            data[index + 2] = value;
            data[index + 3] = 255;
          }
        }
        return data;
      };

      // Noise Texture
      const noiseTexture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, noiseTexture);
      const noiseData = createNoiseTexture(textureSize);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, textureSize, textureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, noiseData);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      // Dust Texture
      const dustTexture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, dustTexture);
      const dustData = createDustTexture(textureSize);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, textureSize, textureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, dustData);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      console.log(`✅ Procedural textures created (${textureSize}x${textureSize})`);
    },

    async initBlackHole() {
      if (this.isInitialized) return;

      const canvas = this.$refs.blackholeCanvas;
      if (!canvas) return;

      this.gl = canvas.getContext('webgl', {
        alpha: true,
        antialias: false, // Für bessere Performance
        powerPreference: 'default' // Nicht immer high-performance GPU verwenden
      });

      if (!this.gl) {
        console.error('WebGL wird nicht unterstützt!');
        return;
      }

      const resize = () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        this.gl.viewport(0, 0, canvas.width, canvas.height);
      };
      window.addEventListener('resize', resize);
      resize();

      const vertexShader = `
        attribute vec2 position;
        void main() {
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `;

      // Fragment Shader mit deutlich schnellerer Rotation
      const fragmentShader = `
        precision ${this.lowPerformanceMode ? 'mediump' : 'highp'} float;
        uniform vec2 resolution;
        uniform float time;
        uniform sampler2D iChannel0;
        uniform sampler2D iChannel1;
        uniform vec3 primaryColor;
        uniform vec3 secondaryColor;

        #define ITERATIONS ${this.lowPerformanceMode ? 50 : 100}

        const float pi = 3.14159265;

        float noise( in vec3 x ) {
            vec3 p = floor(x);
            vec3 f = fract(x);
            f = f*f*(3.0-2.0*f);
            vec2 uv = (p.xy+vec2(37.0,17.0)*p.z) + f.xy;
            vec2 rg = texture2D( iChannel0, (uv+ 0.5)/256.0 ).yx;
            return -1.0+2.0*mix( rg.x, rg.y, f.z );
        }

        float saturate(float x) {
            return clamp(x, 0.0, 1.0);
        }

        vec3 saturate(vec3 x) {
            return clamp(x, vec3(0.0), vec3(1.0));
        }

        float rand(vec2 coord) {
            return saturate(fract(sin(dot(coord, vec2(12.9898, 78.223))) * 43758.5453));
        }

        float pcurve( float x, float a, float b ) {
            float k = pow(a+b,a+b) / (pow(a,a)*pow(b,b));
            return k * pow( x, a ) * pow( 1.0-x, b );
        }

        float atan2(float y, float x) {
            if (x > 0.0) {
                return atan(y / x);
            } else if (x == 0.0) {
                if (y > 0.0) {
                    return pi / 2.0;
                } else if (y < 0.0) {
                    return -(pi / 2.0);
                } else {
                    return 0.0;
                }
            } else {
                if (y >= 0.0) {
                    return atan(y / x) + pi;
                } else {
                    return atan(y / x) - pi;
                }
            }
        }

        float sdTorus(vec3 p, vec2 t) {
            vec2 q = vec2(length(p.xz) - t.x, p.y);
            return length(q)-t.y;
        }

        void Haze(inout vec3 color, vec3 pos, float alpha) {
            vec2 t = vec2(1.0, 0.01);
            float torusDist = length(sdTorus(pos + vec3(0.0, -0.05, 0.0), t));
            float bloomDisc = 1.0 / (pow(torusDist, 2.0) + 0.001);
            vec3 col = primaryColor; // Verwendung der anpassbaren Farbe
            bloomDisc *= length(pos) < 0.5 ? 0.0 : 1.0;
            color += col * bloomDisc * (2.9 / float(ITERATIONS)) * (1.0 - alpha * 1.0);
        }

        void GasDisc(inout vec3 color, inout float alpha, vec3 pos) {
            float discRadius = 3.2;
            float discWidth = 5.3;
            float discInner = discRadius - discWidth * 0.5;

            vec3 origin = vec3(0.0, 0.0, 0.0);
            vec3 discNormal = normalize(vec3(0.0, 1.0, 0.0));
            float discThickness = 0.1;

            float distFromCenter = distance(pos, origin);
            float distFromDisc = dot(discNormal, pos - origin);

            float radialGradient = 1.0 - saturate((distFromCenter - discInner) / discWidth * 0.5);
            float coverage = pcurve(radialGradient, 4.0, 0.9);

            discThickness *= radialGradient;
            coverage *= saturate(1.0 - abs(distFromDisc) / discThickness);

            vec3 dustColorLit = mix(primaryColor, secondaryColor, radialGradient); // Farbmischung
            float dustGlow = 1.0 / (pow(1.0 - radialGradient, 2.0) * 290.0 + 0.002);
            vec3 dustColor = dustColorLit * dustGlow * 8.2;

            coverage = saturate(coverage * 0.7);

            float fade = pow((abs(distFromCenter - discInner) + 0.4), 4.0) * 0.04;
            float bloomFactor = 1.0 / (pow(distFromDisc, 2.0) * 40.0 + fade + 0.00002);
            vec3 b = dustColorLit * pow(bloomFactor, 1.5);

            // Farbmischung mit Primary/Secondary Colors
            b *= mix(secondaryColor * 1.7, primaryColor * vec3(0.5, 0.6, 1.0), vec3(pow(radialGradient, 2.0)));
            b *= mix(secondaryColor * vec3(1.7, 0.5, 0.1), primaryColor, vec3(pow(radialGradient, 0.5)));

            dustColor = mix(dustColor, b * 150.0, saturate(1.0 - coverage * 1.0));
            coverage = saturate(coverage + bloomFactor * bloomFactor * 0.1);

            if (coverage < 0.01) {
                return;
            }

            vec3 radialCoords;
            radialCoords.x = distFromCenter * 1.5 + 0.55;
            radialCoords.y = atan2(-pos.x, -pos.z) * 1.5;
            radialCoords.z = distFromDisc * 1.5;

            radialCoords *= 0.95;

            // DEUTLICH SCHNELLERE ROTATION: Von 0.08 auf 0.35 erhöht (über 4x schneller)
            float speed = 0.35;

            float noise1 = 1.0;
            vec3 rc = radialCoords + 0.0;           rc.y += time * speed;
            noise1 *= noise(rc * 3.0) * 0.5 + 0.5;  rc.y -= time * speed;
            noise1 *= noise(rc * 6.0) * 0.5 + 0.5;  rc.y += time * speed;
            noise1 *= noise(rc * 12.0) * 0.5 + 0.5; rc.y -= time * speed;
            noise1 *= noise(rc * 24.0) * 0.5 + 0.5; rc.y += time * speed;

            float noise2 = 2.0;
            rc = radialCoords + 30.0;
            noise2 *= noise(rc * 3.0) * 0.5 + 0.5;  rc.y += time * speed;
            noise2 *= noise(rc * 6.0) * 0.5 + 0.5;  rc.y -= time * speed;
            noise2 *= noise(rc * 12.0) * 0.5 + 0.5; rc.y += time * speed;
            noise2 *= noise(rc * 24.0) * 0.5 + 0.5; rc.y -= time * speed;
            noise2 *= noise(rc * 48.0) * 0.5 + 0.5; rc.y += time * speed;
            noise2 *= noise(rc * 92.0) * 0.5 + 0.5; rc.y -= time * speed;

            dustColor *= noise1 * 0.998 + 0.002;
            coverage *= noise2;

            // Hier wird auch die Geschwindigkeit für die Textur-Rotation erhöht
            radialCoords.y += time * speed * 0.8; // Von 0.5 auf 0.8 erhöht

            dustColor *= pow(texture2D(iChannel1, radialCoords.yx * vec2(0.15, 0.27)).rgb, vec3(2.0)) * 4.0;

            coverage = saturate(coverage * 1200.0 / float(ITERATIONS));
            dustColor = max(vec3(0.0), dustColor);

            coverage *= pcurve(radialGradient, 4.0, 0.9);

            color = (1.0 - alpha) * dustColor * coverage + color;
            alpha = (1.0 - alpha) * coverage + alpha;
        }

        // Re-enabled the rotate function for camera orientation
        vec3 rotate(vec3 p, float x, float y, float z) {
            mat3 matx = mat3(1.0, 0.0, 0.0,
                             0.0, cos(x), sin(x),
                             0.0, -sin(x), cos(x));

            mat3 maty = mat3(cos(y), 0.0, -sin(y),
                             0.0, 1.0, 0.0,
                             sin(y), 0.0, cos(y));

            mat3 matz = mat3(cos(z), sin(z), 0.0,
                             -sin(z), cos(z), 0.0,
                             0.0, 0.0, 1.0);

            return maty * matz * matx * p;
        }

        void WarpSpace(inout vec3 eyevec, inout vec3 raypos) {
            vec3 origin = vec3(0.0, 0.0, 0.0);
            float singularityDist = distance(raypos, origin);
            float warpFactor = 1.0 / (pow(singularityDist, 2.0) + 0.000001);
            vec3 singularityVector = normalize(origin - raypos);
            float warpAmount = 5.0;
            eyevec = normalize(eyevec + singularityVector * warpFactor * warpAmount / float(ITERATIONS));
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / resolution.xy;
            float aspect = resolution.x / resolution.y;

            // Introduce a subtle time-based offset for the camera to simulate movement
            // This makes the black hole appear to drift slightly
            vec2 timeOffset = vec2(sin(time * 0.04) * 0.2, cos(time * 0.06) * 0.1);

            // Initial camera position.
            // Negative X shifts the black hole to the right of the view.
            // Positive Y lifts the camera, giving a slightly elevated perspective.
            // Negative Z moves the camera back.
            vec3 eyepos = vec3(-1.4 + timeOffset.x, 0.2 + timeOffset.y, -10.0);

            vec3 eyevec = normalize(vec3((uv * 2.0 - 1.0) * vec2(aspect, 1.0), 6.0));

            const float far = 15.0;

            // Apply a fixed rotation for an interesting perspective
            // These angles define the camera's fixed orientation relative to the black hole.
            // Adjust these values (x, y, z) to fine-tune the perspective.
            vec3 fixedPerspectiveAngle = vec3(0.1, 1.0, -0.2); // Pitch, Yaw, Roll
            eyevec = rotate(eyevec, fixedPerspectiveAngle.x, fixedPerspectiveAngle.y, fixedPerspectiveAngle.z);
            eyepos = rotate(eyepos, fixedPerspectiveAngle.x, fixedPerspectiveAngle.y, fixedPerspectiveAngle.z);

            vec3 color = vec3(0.0, 0.0, 0.0);

            float dither = rand(uv + sin(time * 1.0)) * 2.0;

            float alpha = 0.0;
            vec3 raypos = eyepos + eyevec * dither * far / float(ITERATIONS);

            for (int i = 0; i < ITERATIONS; i++) {
                WarpSpace(eyevec, raypos);
                raypos += eyevec * far / float(ITERATIONS);
                GasDisc(color, alpha, raypos);
                Haze(color, raypos, alpha);
            }

            color *= 0.0001;

            color += color * 0.5;
            color *= 500.0;

            color = pow(color, vec3(1.5));
            color = color / (1.0 + color);
            color = pow(color, vec3(1.0 / 1.5));

            color = mix(color, color * color * (3.0 - 2.0 * color), vec3(1.0));
            color = pow(color, vec3(1.3, 1.20, 1.0));
            color = saturate(color * 1.01);

            color = pow(color, vec3(0.7 / 2.2));

            gl_FragColor = vec4(color, 1.0);
        }
      `;

      this.createProceduralTextures(this.gl);

      this.shaderProgram = this.initShaderProgram(this.gl, vertexShader, fragmentShader);
      if (!this.shaderProgram) {
        console.error('Failed to create shader program');
        return;
      }

      this.gl.useProgram(this.shaderProgram);

      // Vertex-Buffer
      const positionBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), this.gl.STATIC_DRAW);

      const positionAttr = this.gl.getAttribLocation(this.shaderProgram, 'position');
      if (positionAttr !== -1) {
        this.gl.enableVertexAttribArray(positionAttr);
        this.gl.vertexAttribPointer(positionAttr, 2, this.gl.FLOAT, false, 0, 0);
      }

      // Uniforms
      this.resolutionLoc = this.gl.getUniformLocation(this.shaderProgram, 'resolution');
      this.timeLoc = this.gl.getUniformLocation(this.shaderProgram, 'time');
      this.primaryColorLoc = this.gl.getUniformLocation(this.shaderProgram, 'primaryColor');
      this.secondaryColorLoc = this.gl.getUniformLocation(this.shaderProgram, 'secondaryColor');

      const channel0Loc = this.gl.getUniformLocation(this.shaderProgram, 'iChannel0');
      const channel1Loc = this.gl.getUniformLocation(this.shaderProgram, 'iChannel1');

      if (channel0Loc !== -1) this.gl.uniform1i(channel0Loc, 0);
      if (channel1Loc !== -1) this.gl.uniform1i(channel1Loc, 1);

      // Setze Farben
      if (this.primaryColorLoc !== -1) {
        this.gl.uniform3f(this.primaryColorLoc, ...this.primaryColor);
      }
      if (this.secondaryColorLoc !== -1) {
        this.gl.uniform3f(this.secondaryColorLoc, ...this.secondaryColor);
      }

      this.startTime = Date.now();
      this.isInitialized = true;

      console.log('🌌 Black hole renderer initialized successfully!');

      if (this.autoPlay && this.isVisible) {
        this.animate();
      }
    },

    animate() {
      if (this.isPaused || !this.isInitialized) return;

      if (this.resolutionLoc !== -1) {
        this.gl.uniform2f(this.resolutionLoc, this.$refs.blackholeCanvas.width, this.$refs.blackholeCanvas.height);
      }
      if (this.timeLoc !== -1) {
        this.gl.uniform1f(this.timeLoc, (Date.now() - this.startTime) / 1000);
      }

      this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

      this.animationId = requestAnimationFrame(() => this.animate());
    },

    // Öffentliche Methoden für externe Steuerung
    start() {
      if (!this.isInitialized) {
        this.initBlackHole();
      } else {
        this.resumeAnimation();
      }
    },

    stop() {
      this.pauseAnimation();
    },

    updateColors(primary, secondary) {
      if (this.isInitialized && this.primaryColorLoc !== -1 && this.secondaryColorLoc !== -1) {
        this.gl.uniform3f(this.primaryColorLoc, ...primary);
        this.gl.uniform3f(this.secondaryColorLoc, ...secondary);
      }
    }
  }
};
</script>

<style scoped>
.blackhole-container {
  /* Ensures it stays relative to the viewport */
  top: 0;
  right: 0; /* Positions the container to the right edge of the window */
 /* Sets the width to half of the screen */
  height: 100%;
  overflow: hidden;
  pointer-events: none; /* Allows mouse events to pass through the canvas to elements behind it */
}

.blackhole-canvas {
  display: block;
  width: 100%;
  height: 100%;
  transition: opacity 0.3s ease-in-out;
}
</style>