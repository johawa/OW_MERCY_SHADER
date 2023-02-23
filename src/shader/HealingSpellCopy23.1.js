import { useRef, useState } from "react";
import { OrbitControls, Plane, shaderMaterial } from "@react-three/drei";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import glsl from "babel-plugin-glsl/macro";

const CustomShader = shaderMaterial(
  {
    time: { value: 0 },
  },
  glsl`
    uniform float time;
    varying vec2 vUv;
    
    void main() {
      vUv = uv;   

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  glsl`
    varying vec2 vUv;     
    uniform float time; 

    const vec3 top = vec3(0, 0, 0);
    const vec3 bottom = vec3(0, 0, 0);
    const float widthFactor = 1.5;
    
    vec4 calcSine(vec2 uv,
                 float speed, 
                 float frequency,
                 float amplitude, 
                 float shift, 
                 float offset,
                 vec4 color, 
                 float width,
                 float exponent, 
                 bool dir)
    {
        float angle = time * speed * frequency * -1.0 + (shift + uv.x) * 2.0;
        
        float y = sin(angle) * amplitude + offset;
        float clampY = clamp(0.0, y, y);
        float diffY = y - uv.y;
        
        float dsqr = distance(y, uv.y);
        float scale = 1.0;
        
        if(dir && diffY > 0.0)
        {
            dsqr = dsqr * 4.0;
        }
        else if(!dir && diffY < 0.0)
        {
            dsqr = dsqr * 4.0;
        }
        
        scale = pow(smoothstep(width * widthFactor, 0.0, dsqr), exponent);
        
        return min(color * scale, color);
    }

    void main() {	
 
        //  float light = 0.01 /  abs(vUv.x - 0.5);  
       
        //  vec3 color = vec3(1.0, 0.8, 0.4);
        //  vec4 finalColor = vec4(color * light * 3.0, 1.0);
    
        //  gl_FragColor = finalColor;
        vec4 color = vec4(mix(bottom, top, vUv.y), 0.0);
        vec4 waveColor1 = vec4(1.0, 0.85, 0.3, 1.0);
        vec4 waveColor2 = vec4(1.0, 0.8, 0.2, 1.0);

        color += calcSine(vUv, 15.8, 0.1, 0.2, 1.6, 0.5, waveColor1, 0.25, 25.0, true);
        color += calcSine(vUv, 15.8, 0.2, 0.2, 1.6, 0.5, waveColor2, 0.5, 50.0, true);
       
        gl_FragColor = vec4(color);
    }
    `
);

extend({ CustomShader });

function Box(props) {
  const ref = useRef(null);
  const materialRef = useRef(null);

  useFrame((state) => {
    if (materialRef.current) {
      const t = state.clock.getElapsedTime();
      materialRef.current.uniforms.time.value = t;
    }
  });

  return (
    <mesh {...props} ref={ref}>
      <planeBufferGeometry args={[5, 2, 2]} />
      <customShader ref={materialRef} attach="material" transparent={true} />
    </mesh>
  );
}

function HealingSpell() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />

      <Box position={[0, 0, 0]} />

      {/* <OrbitControls /> */}
    </Canvas>
  );
}

export default HealingSpell;
