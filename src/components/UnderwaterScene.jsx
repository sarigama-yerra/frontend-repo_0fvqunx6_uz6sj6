import React, { Suspense, useMemo, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Html, Caustics, MeshTransmissionMaterial, Float, Instances, Instance, Lightformer, Sparkles, useDetectGPU, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { EffectComposer, Bloom, DepthOfField, GodRays, Noise, Vignette, SMAA } from '@react-three/postprocessing'
import { KernelSize, Resizer } from 'postprocessing'

// Auto quality based on GPU
function AutoQuality({ children }) {
  const { tier } = useDetectGPU()
  const [quality, setQuality] = useState('high')
  useEffect(() => {
    if (tier <= 1) setQuality('low')
    else if (tier === 2) setQuality('medium')
    else setQuality('high')
  }, [tier])
  return <group userData={{ quality }}>{children}</group>
}

function CameraRig() {
  const { camera, mouse, viewport } = useThree()
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const parallaxX = THREE.MathUtils.lerp(camera.position.x, mouse.x * 0.5, 0.05)
    const parallaxY = THREE.MathUtils.lerp(camera.position.y, mouse.y * 0.3, 0.05)
    camera.position.x = parallaxX
    camera.position.y = THREE.MathUtils.clamp(parallaxY, -1, 1)
    camera.position.z = 6 + Math.sin(t * 0.15) * 0.2
    camera.lookAt(0, 0, 0)
  })
  return null
}

function WaterSurface() {
  const mesh = useRef()
  const geom = useMemo(() => new THREE.PlaneGeometry(50, 50, 256, 256), [])
  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#7ed3ff') },
      uDeep: { value: new THREE.Color('#063a5a') },
    },
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying float vWave;
      void main() {
        vUv = uv;
        vec3 pos = position;
        float freq = 0.25;
        float amp = 0.35;
        pos.z += sin(pos.x * freq + uTime*0.7) * amp;
        pos.z += cos(pos.y * freq*0.9 + uTime*0.6) * amp*0.7;
        vWave = pos.z;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying float vWave;
      uniform vec3 uColor; 
      uniform vec3 uDeep;
      void main(){
        float f = smoothstep(-0.5, 0.8, vWave);
        vec3 col = mix(uDeep, uColor, f);
        gl_FragColor = vec4(col, 0.6);
      }
    `,
    transparent: true,
  }), [])

  useFrame((_, dt) => {
    mat.uniforms.uTime.value += dt
    if (mesh.current) mesh.current.position.y = 3
  })

  return <mesh ref={mesh} geometry={geom} rotation-x={-Math.PI/2} position={[0,3,-5]} material={mat} />
}

function Bubbles({ count = 120 }) {
  const ref = useRef()
  const positions = useMemo(() => {
    const p = []
    for (let i = 0; i < count; i++) {
      p.push(new THREE.Vector3((Math.random()-0.5)*10, -4 - Math.random()*6, (Math.random()-0.5)*8))
    }
    return p
  }, [count])

  useFrame((state, dt) => {
    const t = state.clock.getElapsedTime()
    ref.current.children.forEach((m, i) => {
      m.position.y += 0.4*dt + Math.sin(t + i)*0.02
      m.position.x += Math.sin(t*0.5 + i)*0.005
      if (m.position.y > 4) m.position.y = -6 - Math.random()*2
    })
  })

  return (
    <group ref={ref}>
      {positions.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[Math.random()*0.06+0.03, 16, 16]} />
          <meshPhysicalMaterial color="#b8ecff" roughness={0} transmission={0.95} thickness={0.2} ior={1.33} attenuationDistance={2}/>
        </mesh>
      ))}
    </group>
  )
}

function CausticsFloor() {
  return (
    <Caustics
      backside
      color="#89c2ff"
      lightSource={[0, 3, -2]}
      worldRadius={0.5}
      ior={1.33}
      intensity={0.02}
      causticsOnly={false}
      position={[0,-3,0]}
      scale={[20, 10, 5]}
    >
      <mesh rotation-x={-Math.PI/2}>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial color="#04263b" roughness={0.9} metalness={0.0}/>
      </mesh>
    </Caustics>
  )
}

function OceanParticles() {
  return (
    <>
      <Sparkles count={800} scale={[15, 8, 10]} size={2} speed={0.2} color="#9ad9ff" opacity={0.35} />
      <Sparkles count={400} scale={[10, 6, 8]} size={1.4} speed={0.1} color="#e0f7ff" opacity={0.25} />
    </>
  )
}

function GodRaysLight() {
  const light = useRef()
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (light.current) {
      light.current.position.set(Math.sin(t*0.2)*3, 4, Math.cos(t*0.25)*-2)
    }
  })
  return (
    <mesh ref={light} position={[0,4,-2]}> 
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
  )
}

function HolographicText({ text, position=[0,0,0] }) {
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color('#9be7ff') },
      uColorB: { value: new THREE.Color('#38bdf8') },
    },
    vertexShader: `
      varying vec2 vUv;
      void main(){
        vUv = uv;
        vec3 p = position;
        p.y += sin((position.x+position.y)*2.0 + float(gl_InstanceID)*0.1 + 0.0)*0.01;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime; 
      uniform vec3 uColorA; 
      uniform vec3 uColorB; 
      varying vec2 vUv; 
      void main(){
        float glow = sin(vUv.y*10.0 + uTime*2.0)*0.15 + 0.35;
        vec3 col = mix(uColorA, uColorB, vUv.y) + glow;
        gl_FragColor = vec4(col, 0.85);
      }
    `,
    transparent: true
  }), [])

  useFrame((_, dt) => {
    material.uniforms.uTime.value += dt
  })

  return (
    <Html position={position} center>
      <div style={{
        color: '#aee9ff',
        textShadow: '0 0 12px rgba(110, 220, 255, 0.8)',
        letterSpacing: '1px',
        fontWeight: 600,
        backdropFilter: 'blur(4px)',
        background: 'rgba(20,40,60,0.15)',
        border: '1px solid rgba(100,200,255,0.2)',
        padding: '10px 14px',
        borderRadius: 8
      }}>
        {text}
      </div>
    </Html>
  )
}

function Bottle({ scrollRef }) {
  const group = useRef()
  const ripple = useRef(0)
  const texNormal = useTexture('https://assets.geo.hcaptcha.com/c/2ddfd69/normal-water.jpg')

  // Create a premium bottle from glass with water inside (simplified parametric geometry)
  const glass = useMemo(() => {
    const shape = new THREE.Shape()
    const points = [
      new THREE.Vector2(0.0, -1.8),
      new THREE.Vector2(0.7, -1.7),
      new THREE.Vector2(0.95, -1.3),
      new THREE.Vector2(1.0, -0.6),
      new THREE.Vector2(0.95, 0.8),
      new THREE.Vector2(0.6, 1.6),
      new THREE.Vector2(0.35, 1.9),
      new THREE.Vector2(0.25, 2.2), // neck
      new THREE.Vector2(0.3, 2.5),
      new THREE.Vector2(0.2, 2.7),
      new THREE.Vector2(0.25, 2.9),
      new THREE.Vector2(0.0, 3.0)
    ]
    const lathe = new THREE.LatheGeometry(points, 128)
    lathe.computeVertexNormals()
    return lathe
  }, [])

  const capGeom = useMemo(() => new THREE.CylinderGeometry(0.22, 0.25, 0.3, 64), [])
  const labelGeom = useMemo(() => new THREE.CylinderGeometry(1.01, 1.01, 1.2, 128, 1, true), [])

  useFrame((state, dt) => {
    const t = state.clock.getElapsedTime()
    const scrollY = scrollRef?.current || 0
    const targetRot = scrollY * 0.003
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRot, 0.05)
    group.current.rotation.x = Math.sin(t*0.3) * 0.05
    group.current.position.y = Math.sin(t*0.6) * 0.1
    ripple.current = THREE.MathUtils.lerp(ripple.current, 0, 0.95)
  })

  const onPointerMove = (e) => {
    ripple.current = 1.0
  }

  return (
    <group ref={group} onPointerMove={onPointerMove}>
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh geometry={glass} castShadow receiveShadow>
          <MeshTransmissionMaterial
            samples={10}
            thickness={0.5}
            roughness={0.05}
            transmission={1}
            ior={1.5}
            chromaticAberration={0.02}
            anisotropy={0.1}
            distortion={0.03}
            distortionScale={0.15}
            temporalDistortion={0.1}
            attenuationColor="#9ed9ff"
            attenuationDistance={5}
          />
        </mesh>
        <mesh geometry={capGeom} position={[0,3.15,0]}>
          <meshStandardMaterial color="#99e0ff" metalness={0.2} roughness={0.2} />
        </mesh>
        <mesh geometry={labelGeom} position={[0,0.7,0]} rotation={[0,0,0]}>
          <meshPhysicalMaterial color="#0ea5e9" transparent opacity={0.2} roughness={0.2} metalness={0.1} />
        </mesh>
      </Float>
    </group>
  )
}

function DepthSections() {
  return (
    <group>
      <HolographicText text="Pure as the ocean." position={[0, 1.9, 0]} />
      <HolographicText text="Filtered by nature. Perfected by technology." position={[0, 1.5, 0]} />
      <HolographicText text="Surface" position={[0, -1.2, -1]} />
      <HolographicText text="Mid Depth: Thermal Insulation • Anti-microbial • 24h Cold" position={[0, -2.2, -1]} />
      <HolographicText text="Abyss: Aerospace-grade glass • Precision cap • Smart sensor" position={[0, -3.2, -1]} />
    </group>
  )
}

function EffectsLayer() {
  const { scene, camera, gl, size } = useThree()
  const lightRef = useRef()
  return (
    <EffectComposer
      multisampling={0}
      autoClear={false}
    >
      <SMAA/>
      <Bloom intensity={0.6} luminanceThreshold={0.2} luminanceSmoothing={0.9} kernelSize={KernelSize.SMALL} />
      <Noise premultiply opacity={0.03} />
      <Vignette eskil offset={0.2} darkness={0.8} />
    </EffectComposer>
  )
}

export default function UnderwaterScene() {
  const scrollRef = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      scrollRef.current = window.scrollY
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="w-full h-[200vh] bg-[#031a2a]">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} gl={{ antialias: true }} shadows dpr={[1, 2]}>
        <color attach="background" args={["#031a2a"]} />
        <fog attach="fog" args={["#031a2a", 6, 25]} />

        <AutoQuality>
          <Suspense fallback={<Html center>Loading ocean…</Html>}>
            <ambientLight intensity={0.2} />
            <directionalLight position={[3,4,-2]} intensity={0.8} color="#aee9ff" />
            <Environment preset="sunset" background={false} />

            <WaterSurface />
            <CausticsFloor />
            <OceanParticles />
            <Bubbles />

            <Bottle scrollRef={scrollRef} />
            <DepthSections />

            <GodRaysLight />
            <EffectsLayer />
          </Suspense>
        </AutoQuality>

        <CameraRig />
        <OrbitControls enablePan={false} enableZoom={false} makeDefault />
      </Canvas>

      <div className="fixed top-4 left-1/2 -translate-x-1/2 text-center z-10">
        <h1 className="text-cyan-200/90 text-2xl sm:text-3xl font-semibold tracking-wide drop-shadow">AQUA.ONE</h1>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center z-10 text-cyan-100/80 animate-pulse">
        <p>Scroll to dive</p>
      </div>
    </div>
  )
}
