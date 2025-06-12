<template>
  <div class="blackhole-container">
    <canvas ref="blackholeCanvas" class="blackhole-canvas"></canvas>
  </div>
</template>

<script>
export default {
  name: 'BlackholeMainSite',
  mounted() {
    this.initBlackHole();
  },
  methods: {
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
      console.log('Creating high-quality procedural textures...');
      
      // Verbesserte Noise-Texture mit mehreren Oktaven
      const createNoiseTexture = (size) => {
        const data = new Uint8Array(size * size * 4);
        for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
            const index = (i * size + j) * 4;
            
            // Normalisierte Koordinaten
            const x = i / size;
            const y = j / size;
            
            // Multi-octave Perlin-ähnliches Noise
            let noise = 0;
            let amplitude = 1;
            let frequency = 4;
            let maxValue = 0;
            
            // 6 Oktaven für detaillierteres Rauschen
            for (let octave = 0; octave < 6; octave++) {
              noise += Math.sin(x * frequency + Math.cos(y * frequency * 1.3)) * 
                       Math.cos(y * frequency + Math.sin(x * frequency * 0.7)) * amplitude;
              
              maxValue += amplitude;
              amplitude *= 0.5;
              frequency *= 2.1;
            }
            
            // Normalisieren zu 0-1 Range
            noise = (noise / maxValue + 1) * 0.5;
            
            // Zusätzliche Turbulenz
            const turbulence = Math.sin(x * 23.7) * Math.cos(y * 19.3) * 0.1;
            noise += turbulence;
            
            // Clamp und in 0-255 konvertieren
            const value = Math.floor(Math.max(0, Math.min(1, noise)) * 255);
            
            data[index] = value;     // R
            data[index + 1] = value; // G  
            data[index + 2] = value; // B
            data[index + 3] = 255;   // A
          }
        }
        return data;
      };

      // Verbesserte Dust-Texture mit fibriger Struktur
      const createDustTexture = (size) => {
        const data = new Uint8Array(size * size * 4);
        for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
            const index = (i * size + j) * 4;
            
            const x = i / size;
            const y = j / size;
            
            // Fibrige Strukturen für Staub
            let dust = 0;
            
            // Hauptrichtung der Fasern
            const fiber1 = Math.sin((x + y) * 25) * Math.exp(-Math.pow((x + y - 1) * 3, 2));
            const fiber2 = Math.sin((x - y + 0.5) * 20) * Math.exp(-Math.pow((x - y) * 2, 2));
            
            // Wirbelstrukturen
            const angle = Math.atan2(y - 0.5, x - 0.5);
            const radius = Math.sqrt((x - 0.5) * (x - 0.5) + (y - 0.5) * (y - 0.5));
            const spiral = Math.sin(angle * 3 + radius * 15) * Math.exp(-radius * 2);
            
            // Kleine zufällige Partikel
            const particles = (Math.random() < 0.1) ? Math.random() : 0;
            
            dust = fiber1 * 0.4 + fiber2 * 0.3 + spiral * 0.2 + particles * 0.1;
            
            // Normalisieren und verstärken
            dust = Math.pow(Math.abs(dust), 0.7);
            const value = Math.floor(Math.max(0, Math.min(1, dust)) * 255);
            
            data[index] = value;     // R
            data[index + 1] = value; // G
            data[index + 2] = value; // B  
            data[index + 3] = 255;   // A
          }
        }
        return data;
      };

      // Noise Texture erstellen (512x512 für bessere Qualität)
      const noiseTexture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, noiseTexture);
      const noiseData = createNoiseTexture(512);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, noiseData);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      // Dust Texture erstellen (512x512 für bessere Qualität)
      const dustTexture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, dustTexture);
      const dustData = createDustTexture(512);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, dustData);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      console.log('✅ High-quality procedural textures created successfully (512x512)');
    },

    async initBlackHole() {
      const canvas = this.$refs.blackholeCanvas;
      const gl = canvas.getContext('webgl');
      
      if (!gl) {
        console.error('WebGL wird nicht unterstützt!');
        return;
      }

      const resize = () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      };
      window.addEventListener('resize', resize);
      resize();

      const vertexShader = `
        attribute vec2 position;
        void main() {
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `;

      // KOMBINIERTER FRAGMENT SHADER
      const fragmentShader = `
        precision highp float;
        uniform vec2 resolution;
        uniform float time;
        uniform sampler2D iChannel0; // noise texture
        uniform sampler2D iChannel1; // dust texture

        #define ITERATIONS 100
        
        const vec3 MainColor = vec3(1.0);
        const float pi = 3.14159265;

        // Noise code by iq
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
            vec3 col = MainColor;
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

            vec3 dustColorLit = MainColor;
            float dustGlow = 1.0 / (pow(1.0 - radialGradient, 2.0) * 290.0 + 0.002);
            vec3 dustColor = dustColorLit * dustGlow * 8.2;

            coverage = saturate(coverage * 0.7);

            float fade = pow((abs(distFromCenter - discInner) + 0.4), 4.0) * 0.04;
            float bloomFactor = 1.0 / (pow(distFromDisc, 2.0) * 40.0 + fade + 0.00002);
            vec3 b = dustColorLit * pow(bloomFactor, 1.5);
            
            b *= mix(vec3(1.7, 1.1, 1.0), vec3(0.5, 0.6, 1.0), vec3(pow(radialGradient, 2.0)));
            b *= mix(vec3(1.7, 0.5, 0.1), vec3(1.0), vec3(pow(radialGradient, 0.5)));

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
            
            float speed = 0.08; // Etwas schneller für sichtbare Rotation
            
            float noise1 = 1.0;
            vec3 rc = radialCoords + 0.0;               rc.y += time * speed;
            noise1 *= noise(rc * 3.0) * 0.5 + 0.5;      rc.y -= time * speed;
            noise1 *= noise(rc * 6.0) * 0.5 + 0.5;      rc.y += time * speed;
            noise1 *= noise(rc * 12.0) * 0.5 + 0.5;     rc.y -= time * speed;
            noise1 *= noise(rc * 24.0) * 0.5 + 0.5;     rc.y += time * speed;

            float noise2 = 2.0;
            rc = radialCoords + 30.0;
            noise2 *= noise(rc * 3.0) * 0.5 + 0.5;      rc.y += time * speed;
            noise2 *= noise(rc * 6.0) * 0.5 + 0.5;      rc.y -= time * speed;
            noise2 *= noise(rc * 12.0) * 0.5 + 0.5;     rc.y += time * speed;
            noise2 *= noise(rc * 24.0) * 0.5 + 0.5;     rc.y -= time * speed;
            noise2 *= noise(rc * 48.0) * 0.5 + 0.5;     rc.y += time * speed;
            noise2 *= noise(rc * 92.0) * 0.5 + 0.5;     rc.y -= time * speed;

            dustColor *= noise1 * 0.998 + 0.002;
            coverage *= noise2;
            
            radialCoords.y += time * speed * 0.5;
            
            dustColor *= pow(texture2D(iChannel1, radialCoords.yx * vec2(0.15, 0.27)).rgb, vec3(2.0)) * 4.0;

            coverage = saturate(coverage * 1200.0 / float(ITERATIONS));
            dustColor = max(vec3(0.0), dustColor);

            coverage *= pcurve(radialGradient, 4.0, 0.9);

            color = (1.0 - alpha) * dustColor * coverage + color;
            alpha = (1.0 - alpha) * coverage + alpha;
        }

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

        void RotateCamera(inout vec3 eyevec, inout vec3 eyepos, vec2 mousePos) {
            float mousePosY = mousePos.y;
            float mousePosX = mousePos.x;

            vec3 angle = vec3(mousePosY * 0.05 + 0.05, 1.0 + mousePosX * 1.0, -0.45);

            eyevec = rotate(eyevec, angle.x, angle.y, angle.z);
            eyepos = rotate(eyepos, angle.x, angle.y, angle.z);
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
            
            // Animierte Mouse Position für spektakuläre Kamera-Bewegung
            vec2 mousePos = vec2(
                0.35 + sin(time * 0.08) * 0.3,           // Langsamere horizontale Bewegung
                0.5 + cos(time * 0.06) * 0.15             // Sanfte vertikale Bewegung
            );
            
            vec3 eyevec = normalize(vec3((uv * 2.0 - 1.0) * vec2(aspect, 1.0), 6.0));
            vec3 eyepos = vec3(0.0, -0.0, -10.0);
            
            eyepos.x += mousePos.x * 3.0 - 1.5;
            
            const float far = 15.0;

            RotateCamera(eyevec, eyepos, mousePos);

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

            // Simplified bloom and tone mapping
            color += color * 0.5; // Simple bloom
            color *= 500.0; // Boost intensity
            
            // Tonemapping
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

      // VERWENDE NUR PROZEDURALE TEXTUREN
      console.log('🚀 Initializing black hole with procedural textures...');
      this.createProceduralTextures(gl);

      // Shader-Programm erstellen
      const shaderProgram = this.initShaderProgram(gl, vertexShader, fragmentShader);
      if (!shaderProgram) {
        console.error('Failed to create shader program');
        return;
      }
      
      gl.useProgram(shaderProgram);

      // Vertex-Buffer
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, 
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      
      const positionAttr = gl.getAttribLocation(shaderProgram, 'position');
      if (positionAttr !== -1) {
        gl.enableVertexAttribArray(positionAttr);
        gl.vertexAttribPointer(positionAttr, 2, gl.FLOAT, false, 0, 0);
      }

      // Uniforms
      const resolutionLoc = gl.getUniformLocation(shaderProgram, 'resolution');
      const timeLoc = gl.getUniformLocation(shaderProgram, 'time');
      const channel0Loc = gl.getUniformLocation(shaderProgram, 'iChannel0');
      const channel1Loc = gl.getUniformLocation(shaderProgram, 'iChannel1');

      if (channel0Loc !== -1) gl.uniform1i(channel0Loc, 0);
      if (channel1Loc !== -1) gl.uniform1i(channel1Loc, 1);

      console.log('🌌 Black hole renderer initialized successfully!');

      // Render-Loop
      let startTime = Date.now();
      const animate = () => {
        if (resolutionLoc !== -1) {
          gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
        }
        if (timeLoc !== -1) {
          gl.uniform1f(timeLoc, (Date.now() - startTime) / 1000);
        }
        
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(animate);
      };
      animate();
    }
  }
};
</script>

<style scoped>
.blackhole-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.blackhole-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>