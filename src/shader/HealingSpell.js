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



    vec4 Muzzle( vec2 uv)
    {
        vec2 u = ( uv.yx * vec2(-0.2,.8) - uv) / 0.05;
       
        
      float T = floor(  time * 20.),
           theta = atan(u.y + 2.2, u.x),
           len = (5.0 + sin(theta * 20. - T * 35.)) / 0.8;
           u.x *=  2.;
        
        
        float d = max(-0.6, 1. - length(u)/len);
        return d*(1.+.5* vec4( 0.0,
        -cos(theta *  6. - T *14.77),
                            0.0,
                               0.0));
    }


    
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
        
        float y =  sin(angle) * amplitude + offset;
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
      vec4 color = vec4(mix(bottom, top, vUv.y), 0.0);
      vec4 waveColor1 = vec4(1.0, 0.85, 0.3, 1.0);
      vec4 waveColor2 = vec4(1.0, 0.8, 0.2, 1.0);
        // color += vec4(clamp(Muzzle(vUv), 0.0, 1.0));   
        
        color += calcSine(vUv, 15.8, 0.1, 0.2, 1.6, 0.5, waveColor1, 0.25, 250.0, true);
        color += calcSine(vUv, 10.8, 0.1, 0.2, 1.6, 0.5, waveColor1, 0.25, 75.0, true);
        color += calcSine(vUv, 15.8, 0.2, 0.2, 1.6, 0.5, waveColor2, 0.5, 50.0, true);     
        color += calcSine(vUv, 5.8, 0.2, 0.2, 1.6, 0.5, waveColor2, 0.5, 125.0, true);     
         gl_FragColor = vec4(color.r, color.g, color.b, 1.0);





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
    <mesh {...props} ref={ref} rotation={[0.1, 0.2, 0.25]} position={[1.2,-2,-0.8]} >
      <planeBufferGeometry args={[16, 2]} />
      <customShader ref={materialRef} attach="material" transparent={false} />
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
