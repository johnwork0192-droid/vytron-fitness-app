import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import type { MuscleGroup } from './exercises'

export type ModelView = 'Front' | 'Back' | 'Side'

type AnatomyViewerProps = {
  selectedMuscle: MuscleGroup
  view: ModelView
  onSelectMuscle: (muscle: MuscleGroup) => void
  animating?: boolean
}

type MuscleProps = { position: [number, number, number]; scale: [number, number, number]; group: MuscleGroup; selected: MuscleGroup; rotation?: [number, number, number]; onSelect: (group: MuscleGroup) => void }

function Muscle({ position, scale, group, selected, rotation, onSelect }: MuscleProps) {
  const active = selected === group
  return (
    <mesh position={position} scale={scale} rotation={rotation} onClick={(event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); onSelect(group) }} castShadow>
      <sphereGeometry args={[1, 28, 22]} />
      <meshStandardMaterial color={active ? '#b9ff55' : '#f0f1ee'} emissive={active ? '#61ff00' : '#000000'} emissiveIntensity={active ? 1.4 : 0} roughness={active ? 0.28 : 0.46} metalness={0.04} />
    </mesh>
  )
}

function Limb({ start, end, radius, color = '#ebeeea' }: { start: [number, number, number]; end: [number, number, number]; radius: number; color?: string }) {
  const a = new THREE.Vector3(...start)
  const b = new THREE.Vector3(...end)
  const midpoint = a.clone().add(b).multiplyScalar(0.5)
  const direction = b.clone().sub(a)
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize())
  return <mesh position={midpoint} quaternion={quaternion} castShadow><capsuleGeometry args={[radius, Math.max(0.05, direction.length() - radius * 2), 8, 16]} /><meshStandardMaterial color={color} roughness={0.48} /></mesh>
}

function Mannequin({ selectedMuscle, onSelectMuscle, animating }: Pick<AnatomyViewerProps, 'selectedMuscle' | 'onSelectMuscle' | 'animating'>) {
  const figure = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (figure.current && animating) figure.current.position.y = Math.sin(clock.elapsedTime * 2.4) * 0.035
  })
  const muscle = (position: [number, number, number], scale: [number, number, number], group: MuscleGroup, rotation?: [number, number, number]) => <Muscle key={`${group}-${position.join('-')}`} position={position} scale={scale} group={group} selected={selectedMuscle} rotation={rotation} onSelect={onSelectMuscle} />
  return (
    <group ref={figure} position={[0, -0.02, 0]}>
      {/* Core mannequin silhouette */}
      <mesh position={[0, 1.48, 0]} scale={[0.48, 0.67, 0.25]} castShadow><sphereGeometry args={[1, 32, 28]} /><meshStandardMaterial color="#f0f1ee" roughness={0.48} /></mesh>
      <mesh position={[0, 1.03, 0]} scale={[0.34, 0.34, 0.22]} castShadow><sphereGeometry args={[1, 28, 22]} /><meshStandardMaterial color="#eceeea" roughness={0.5} /></mesh>
      <mesh position={[0, 2.36, 0]} scale={[0.21, 0.29, 0.2]} castShadow><sphereGeometry args={[1, 28, 24]} /><meshStandardMaterial color="#f2f3f0" roughness={0.42} /></mesh>
      <Limb start={[0, 2.1, 0]} end={[0, 1.98, 0]} radius={0.12} />
      {/* Arms and legs */}
      <Limb start={[-0.42, 1.92, 0]} end={[-0.67, 1.38, 0]} radius={0.14} />
      <Limb start={[-0.67, 1.38, 0]} end={[-0.72, 0.91, 0]} radius={0.105} />
      <Limb start={[-0.72, 0.91, 0]} end={[-0.72, 0.76, 0]} radius={0.075} />
      <Limb start={[0.42, 1.92, 0]} end={[0.67, 1.38, 0]} radius={0.14} />
      <Limb start={[0.67, 1.38, 0]} end={[0.72, 0.91, 0]} radius={0.105} />
      <Limb start={[0.72, 0.91, 0]} end={[0.72, 0.76, 0]} radius={0.075} />
      <Limb start={[-0.2, 0.98, 0]} end={[-0.24, 0.32, 0]} radius={0.18} />
      <Limb start={[-0.24, 0.32, 0]} end={[-0.24, -0.42, 0]} radius={0.115} />
      <Limb start={[-0.24, -0.42, 0]} end={[-0.24, -0.78, 0]} radius={0.08} />
      <Limb start={[0.2, 0.98, 0]} end={[0.24, 0.32, 0]} radius={0.18} />
      <Limb start={[0.24, 0.32, 0]} end={[0.24, -0.42, 0]} radius={0.115} />
      <Limb start={[0.24, -0.42, 0]} end={[0.24, -0.78, 0]} radius={0.08} />
      {/* Selectable muscle overlays on the front and back surface */}
      {muscle([-0.25, 1.77, 0.211], [0.23, 0.28, 0.075], 'Chest')}{muscle([0.25, 1.77, 0.211], [0.23, 0.28, 0.075], 'Chest')}
      {muscle([-0.21, 1.45, 0.239], [0.16, 0.22, 0.045], 'Abs')}{muscle([0, 1.45, 0.254], [0.14, 0.23, 0.045], 'Abs')}{muscle([0.21, 1.45, 0.239], [0.16, 0.22, 0.045], 'Abs')}
      {muscle([-0.48, 1.97, 0.02], [0.18, 0.18, 0.18], 'Shoulders')}{muscle([0.48, 1.97, 0.02], [0.18, 0.18, 0.18], 'Shoulders')}
      {muscle([-0.58, 1.59, 0.12], [0.12, 0.29, 0.115], 'Arms', [0, 0, -0.32])}{muscle([0.58, 1.59, 0.12], [0.12, 0.29, 0.115], 'Arms', [0, 0, 0.32])}
      {muscle([-0.59, 1.14, 0.11], [0.09, 0.24, 0.09], 'Arms', [0, 0, -0.12])}{muscle([0.59, 1.14, 0.11], [0.09, 0.24, 0.09], 'Arms', [0, 0, 0.12])}
      {muscle([-0.21, 0.62, 0.12], [0.17, 0.39, 0.15], 'Legs', [0, 0, -0.04])}{muscle([0.21, 0.62, 0.12], [0.17, 0.39, 0.15], 'Legs', [0, 0, 0.04])}
      {muscle([-0.24, -0.1, 0.095], [0.115, 0.32, 0.105], 'Legs')}{muscle([0.24, -0.1, 0.095], [0.115, 0.32, 0.105], 'Legs')}
      {muscle([-0.25, 1.55, -0.2], [0.21, 0.48, 0.09], 'Back', [0, 0, -0.08])}{muscle([0.25, 1.55, -0.2], [0.21, 0.48, 0.09], 'Back', [0, 0, 0.08])}
      {muscle([0, 1.77, -0.23], [0.13, 0.24, 0.055], 'Back')}
      <mesh position={[0, 2.37, 0.175]} scale={[0.04, 0.022, 0.012]}><sphereGeometry args={[1, 12, 8]} /><meshStandardMaterial color="#a2a59f" /></mesh>
    </group>
  )
}

function CameraPosition({ view }: { view: ModelView }) {
  const { camera } = useThree()
  useEffect(() => {
    const positions: Record<ModelView, [number, number, number]> = { Front: [0, 0.9, 5.5], Back: [0, 0.9, -5.5], Side: [5.5, 0.9, 0] }
    camera.position.set(...positions[view])
    camera.lookAt(0, 0.85, 0)
  }, [camera, view])
  return null
}

export default function AnatomyViewer({ selectedMuscle, view, onSelectMuscle, animating = false }: AnatomyViewerProps) {
  return (
    <div className="anatomy-canvas" aria-label="Interactive 3D anatomy model. Drag to rotate; use view buttons to change angle.">
      <Canvas camera={{ position: [0, 0.9, 5.5], fov: 34 }} shadows dpr={[1, 1.8]}>
        <color attach="background" args={['#141813']} />
        <ambientLight intensity={1.8} />
        <directionalLight position={[3, 5, 4]} intensity={3.1} castShadow />
        <pointLight position={[-3, 2, 2]} intensity={28} color="#a9ff4f" />
        <Suspense fallback={null}><CameraPosition view={view} /><Mannequin selectedMuscle={selectedMuscle} onSelectMuscle={onSelectMuscle} animating={animating} /></Suspense>
        <OrbitControls makeDefault enablePan={false} minDistance={3.7} maxDistance={7} minPolarAngle={0.22} maxPolarAngle={Math.PI - 0.22} target={[0, 0.85, 0]} />
      </Canvas>
      <span className="model-drag-hint">DRAG TO ROTATE <span>↻</span></span>
    </div>
  )
}
