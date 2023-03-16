import { shaderMaterial, useGLTF } from "@react-three/drei";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import glsl from "babel-plugin-glsl/macro";
import { useRef, useState } from "react";
import * as THREE from "three";
import { useTimer } from "use-timer";

const CustomShader = shaderMaterial(
  {
    time: { value: 0 },
    mixAmount: { value: 0.0 },
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
    uniform float mixAmount; 

    const float SPEED = 5.0;
    const float FREQ = 8.0;
    const float MAX_HEIGHT = 0.052;
    const float THICKNESS = 0.03;
    const float BLOOM = 1.85; // above 1 will reduce
    const float WOBBLE = 2.0; // how much each end wobbles
    
    float beam(vec2 uv, float max_height, float offset, float speed, float freq, float thickness) {
      uv.y -= 0.5;    
      float height = max_height * (WOBBLE + min(1. - uv.x, 1.));    
      float ramp = smoothstep(0., 2.0 / freq, uv.x);    
      height *= ramp;
      uv.y += sin(uv.x * freq - time * speed + offset) * height;    
      float f = thickness / abs(uv.y);
      f = pow(f, BLOOM);      
      return f;
    }    

    void main() {	       
    

       float f = beam(1.0 - vUv, MAX_HEIGHT, 0., SPEED, FREQ * 1.5, THICKNESS * 0.5) + 
			  beam(1.0 - vUv, MAX_HEIGHT, time, SPEED, FREQ, THICKNESS) +
			  beam(1.0 - vUv, MAX_HEIGHT, time + 0.5, SPEED + 0.2, FREQ * 0.9, THICKNESS * 0.5);

       vec3 yellow = vec3(250.0, 212.0, 50.0) / 250.0;
       vec3 blue = vec3(100, 149, 237) / 250.0;
       vec3 mixcolor = mix(yellow, blue, mixAmount);
  
       vec3 color = f * mixcolor;       
      
       color.r *= mixcolor.r / (distance(vec2((1.0 - vUv.x + 0.5), (1.0 - vUv.y - 0.5) * 2.5 + 0.5), vec2(0.5)));
       color.g *= mixcolor.g / (distance(vec2((1.0 - vUv.x + 0.5), (1.0 - vUv.y - 0.5) * 2.5 + 0.5), vec2(0.5)));
       color.b *= mixcolor.b / (distance(vec2((1.0 - vUv.x + 0.5), (1.0 - vUv.y - 0.5) * 2.5 + 0.5), vec2(0.5)));

       gl_FragColor = vec4(color, 0.0);
    }
        `
);

extend({ CustomShader });

function Bow({ changeColor }) {
  const { nodes } = useGLTF("/bow.glb");
  const { time, start, pause, reset } = useTimer({
    interval: 1000 / 30,
  });
  const materialRef = useRef(null);

  useFrame((state) => {
    if (materialRef.current) {
      const t = state.clock.getElapsedTime();
      materialRef.current.uniforms.time.value = t;
    }

    if (changeColor === true) {
      start();
      let mixAmount = Math.abs(Math.sin(time / 30));
      materialRef.current.uniforms.mixAmount.value = mixAmount;
      if (mixAmount >= 0.95) {
        pause();
      }
    } else if (changeColor === false) {
      reset();
      materialRef.current.uniforms.mixAmount.value = 0.0;
    }
  });

  return (
    <mesh
      geometry={nodes.Plane.geometry}
      position={[3, 0.15, 1.9]}
      rotation={[0.0, 0.04, 0.2]}
    >
      <customShader
        ref={materialRef}
        attach="material"
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function HealingSpell() {
  const [isPressed, setPressed] = useState(false);

  return (
    <Canvas
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => {
        setPressed(false);
      }}
    >
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />

      <Bow changeColor={isPressed} />
    </Canvas>
  );
}

export default HealingSpell;
useGLTF.preload("/bow.glb");
