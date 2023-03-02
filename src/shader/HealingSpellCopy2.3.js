import { useRef, useEffect } from "react";
import { OrbitControls, Plane, shaderMaterial } from "@react-three/drei";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import glsl from "babel-plugin-glsl/macro";
import * as THREE from "three";

import { useSpring } from "@react-spring/web";

import { useGLTF } from "@react-three/drei";

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

       vec3 randomFactors = vec3(1.0, 1.0, 1.0);


     // vec4 blue = vec4(0.1, 0.6, 1.0, 1.0);

        // color += vec4(clamp(Muzzle(vUv), 0.0, 1.0));   
        
        color += calcSine(vUv, 15.8, 0.2, 0.2, .02, 0.5, waveColor2, 0.5, 50.0, true);     
        // color += calcSine(vUv, 10.8, 0.1, 0.2, 1.6, 0.5, waveColor1, 0.25, 75.0, true);
        // color += calcSine(vUv, 5.8, 0.2, 0.2, 1.6, 0.5, waveColor2, 0.5, 125.0, true);            
        // color += calcSine(vUv, 15.8, 0.2, 0.2, 1.6, 0.5, waveColor2, 0.5, 150.0, true);     
        // color += calcSine(vUv, 5.8, 0.2, 0.2, 1.6, 0.5, waveColor2, 0.5, 175.0, true);    
      
        //   color += calcSine(vUv, 7.8, 0.1, 0.2, 1.6, 0.5, waveColor1, 0.25, 150.0, true);

          // color -= vUv.x;

        color.r *=  1.0 / (distance(vec2((vUv.x + 0.5 * randomFactors.x), (vUv.y - 0.5 * randomFactors.y) * 5.0 + 0.5), vec2(0.5)));
         color.g *=  0.85 / (distance(vec2((vUv.x + 0.5 * randomFactors.x), (vUv.y - 0.5 * randomFactors.y) * 5.0 + 0.5), vec2(0.5)));
         color.b *=  0.2 / (distance(vec2((vUv.x + 0.5 * randomFactors.x), (vUv.y - 0.5 * randomFactors.y) * 5.0 + 0.5), vec2(0.5)));

        gl_FragColor = vec4(color.r, color.g, color.b, 0.0);
    }
        `
);

extend({ CustomShader });

function Bow(props) {
  const { nodes, materials } = useGLTF("/bow.glb");

  const ref = useRef(null);

  const materialRef = useRef(null);

  useFrame((state) => {
    if (materialRef.current) {
      const t = state.clock.getElapsedTime();
      materialRef.current.uniforms.time.value = t;
    }
  });

  return (
    <mesh
      geometry={nodes.Plane.geometry}
      position={[3.8, 0.15, 1.9]}
      rotation={[0, 0.04, 0.2]}
    >
      <customShader
        ref={materialRef}
        attach="material"
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Box(props) {
  const ref = useRef(null);
  const materialRef = useRef(null);

  useFrame((state, delta) => {
    if (materialRef.current) {
      const t = state.clock.getElapsedTime();
      materialRef.current.uniforms.time.value = t;

      // ref.current.rotation.x += delta;
    }
  });

  return (
    <mesh
      {...props}
      ref={ref}
      // rotation={[0.1, 0.2, 0.25]}
      // position={[1.2, -2, -1.8]}
    >
      <planeBufferGeometry args={[5, 2]} />
      <customShader
        ref={materialRef}
        attach="material"
        transparent={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function HealingSpell() {
  const springs = useSpring({
    from: { x: 0 },
    to: { x: 100 },
  });

  useEffect(() => {
    springs.x.start();
    console.log(springs.x.get());
  });

  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />

      {/* <Bow /> */}
      <Box position={[0, 0, 0]} />

      {/* <OrbitControls /> */}
    </Canvas>
  );
}

export default HealingSpell;
useGLTF.preload("/bow.glb");
