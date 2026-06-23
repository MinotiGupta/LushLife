// src/components/lush/HeroCanvas.jsx
// Three.js Director's Cut Hero Scene
// Objects fall from above based on scroll, shatter on impact, powder cloud explodes.

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

// ── SHARED SCROLL STATE (updated by page scroll listener) ─────────────────
export const heroScroll = { y: 0 };

function getHeroProgress() {
  const vh = window.innerHeight || 800;
  return Math.min(heroScroll.y / (vh * 2), 1);
}

// ── IMPACT STATE (shared across components) ───────────────────────────────
const impact = {
  triggered: false,
  time: 0,
};

// ── UTILITY: eased t ─────────────────────────────────────────────────────
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// ═══════════════════════════════════════════════════════════════
//  PERFUME BOTTLE (Glass, Art Deco, 24-panel lathe)
// ═══════════════════════════════════════════════════════════════
function PerfumeBottle({ onImpact }) {
  const groupRef = useRef();
  const bodyRef = useRef();
  const lightRef = useRef();
  const shardsRef = useRef([]);
  const localImpact = useRef(false);
  const shardVelocities = useRef([]);
  const shardAngVel = useRef([]);
  const shardPositions = useRef([]);
  const shardRotations = useRef([]);
  const shardAge = useRef([]);
  const SHARD_COUNT = 28;

  const lathePoints = useMemo(() => {
    const pts = [
      [0.04, -1.9],
      [0.22, -1.7],
      [0.36, -1.3],
      [0.40, -0.8],
      [0.40,  0.2],
      [0.38,  0.7],
      [0.32,  1.1],
      [0.20,  1.35],
      [0.14,  1.55],
      [0.17,  1.70],
      [0.17,  1.85],
      [0.07,  1.95],
    ];
    return pts.map(([r, y]) => new THREE.Vector2(r, y));
  }, []);

  // Pre-build shard data
  useEffect(() => {
    shardVelocities.current = Array.from({ length: SHARD_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      return new THREE.Vector3(
        Math.cos(angle) * speed,
        0.5 + Math.random() * 3.5,
        Math.sin(angle) * speed,
      );
    });
    shardAngVel.current = Array.from({ length: SHARD_COUNT }, () =>
      new THREE.Euler(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12,
      )
    );
    shardPositions.current = Array.from({ length: SHARD_COUNT }, () => new THREE.Vector3(-2, 0, 0));
    shardRotations.current = Array.from({ length: SHARD_COUNT }, () => new THREE.Euler(0, 0, 0));
    shardAge.current = new Array(SHARD_COUNT).fill(0);
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const hp = getHeroProgress();

    if (!localImpact.current) {
      const FALL_END = 0.48;
      if (hp < FALL_END) {
        const t = easeOutCubic(hp / FALL_END);
        groupRef.current.position.y = THREE.MathUtils.lerp(16, 0.3, t);
        groupRef.current.position.x = THREE.MathUtils.lerp(-3.5, -2, t);
        groupRef.current.rotation.x = hp * 9;
        groupRef.current.rotation.y = hp * 3;
        if (lightRef.current) lightRef.current.intensity = 2.5 * (1 - t * 0.3);
      } else {
        localImpact.current = true;
        if (bodyRef.current) bodyRef.current.visible = false;
        if (lightRef.current) lightRef.current.intensity = 0;
        // Reset shard positions to bottle world pos
        const wp = new THREE.Vector3();
        groupRef.current.getWorldPosition(wp);
        shardPositions.current.forEach(p => p.copy(wp));
        shardAge.current.fill(0);
        impact.triggered = true;
        impact.time = state.clock.elapsedTime;
        if (onImpact) onImpact();
      }
    } else {
      // Animate shards
      shardPositions.current.forEach((pos, i) => {
        const age = (shardAge.current[i] += delta);
        pos.x += shardVelocities.current[i].x * delta;
        pos.y += shardVelocities.current[i].y * delta - 4.9 * age * age * delta;
        pos.z += shardVelocities.current[i].z * delta;
        shardRotations.current[i].x += shardAngVel.current[i].x * delta;
        shardRotations.current[i].y += shardAngVel.current[i].y * delta;
        shardRotations.current[i].z += shardAngVel.current[i].z * delta;
        if (shardsRef.current[i]) {
          shardsRef.current[i].position.copy(pos);
          shardsRef.current[i].rotation.copy(shardRotations.current[i]);
          // Fade out over time
          if (shardsRef.current[i].material) {
            shardsRef.current[i].material.opacity = Math.max(0, 1 - age / 4);
          }
        }
      });
    }
  });

  return (
    <>
      <group ref={groupRef} position={[-3.5, 16, 0]}>
        <mesh ref={bodyRef} castShadow>
          <latheGeometry args={[lathePoints, 24]} />
          <meshPhysicalMaterial
            color="#C8820A"
            transmission={0.88}
            ior={1.52}
            thickness={3.5}
            clearcoat={1.0}
            clearcoatRoughness={0.02}
            roughness={0.0}
            metalness={0.0}
            transparent
            opacity={0.9}
          />
        </mesh>
        {/* Gold cap */}
        <mesh position={[0, 2.15, 0]}>
          <cylinderGeometry args={[0.09, 0.15, 0.38, 24]} />
          <meshStandardMaterial color="#D4AF37" metalness={1.0} roughness={0.04} emissive="#D4AF37" emissiveIntensity={0.1} />
        </mesh>
        {/* Chain link */}
        <mesh position={[0.06, 2.05, 0]} rotation={[0, 0, Math.PI / 4]}>
          <torusGeometry args={[0.06, 0.015, 8, 16]} />
          <meshStandardMaterial color="#D4AF37" metalness={1.0} roughness={0.05} />
        </mesh>
        <pointLight ref={lightRef} color="#D4AF37" intensity={2.5} distance={8} decay={2} />
      </group>

      {/* Shards (world space) */}
      {Array.from({ length: SHARD_COUNT }, (_, i) => (
        <mesh
          key={`bs${i}`}
          ref={el => { shardsRef.current[i] = el; }}
          visible={localImpact.current}
          castShadow
        >
          <tetrahedronGeometry args={[0.08 + Math.random() * 0.22, 0]} />
          <meshPhysicalMaterial
            color="#C8E8FF"
            transmission={0.7}
            roughness={0.05}
            metalness={0}
            emissive="#00FFE7"
            emissiveIntensity={0.3}
            transparent
            opacity={1}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  LIPSTICK TUBE (Matte black + crimson bullet)
// ═══════════════════════════════════════════════════════════════
function LipstickTube() {
  const groupRef = useRef();
  const bodyRef = useRef();
  const bulletRef = useRef();
  const smearRef = useRef();
  const localImpact = useRef(false);
  const shardsRef = useRef([]);
  const shardVel = useRef([]);
  const shardAngVel = useRef([]);
  const shardPos = useRef([]);
  const shardRot = useRef([]);
  const shardAge = useRef([]);
  const SHARD_COUNT = 18;

  useEffect(() => {
    shardVel.current = Array.from({ length: SHARD_COUNT }, () =>
      new THREE.Vector3((Math.random() - 0.5) * 5, Math.random() * 3 + 0.5, (Math.random() - 0.5) * 5)
    );
    shardAngVel.current = Array.from({ length: SHARD_COUNT }, () =>
      new THREE.Euler((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10)
    );
    shardPos.current = Array.from({ length: SHARD_COUNT }, () => new THREE.Vector3(0, 0, 0));
    shardRot.current = Array.from({ length: SHARD_COUNT }, () => new THREE.Euler(0, 0, 0));
    shardAge.current = new Array(SHARD_COUNT).fill(0);
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const hp = getHeroProgress();

    if (!localImpact.current) {
      const FALL_END = 0.43;
      if (hp < FALL_END) {
        const t = easeOutCubic(hp / FALL_END);
        groupRef.current.position.y = THREE.MathUtils.lerp(18, 0.0, t);
        groupRef.current.position.x = THREE.MathUtils.lerp(0.5, 0, t);
        groupRef.current.rotation.z -= delta * 0.5;
      } else {
        localImpact.current = true;
        if (bodyRef.current) bodyRef.current.visible = false;
        if (bulletRef.current) bulletRef.current.visible = false;
        if (smearRef.current) smearRef.current.visible = true;
        const wp = new THREE.Vector3();
        groupRef.current.getWorldPosition(wp);
        shardPos.current.forEach(p => p.copy(wp));
        shardAge.current.fill(0);
      }
    } else {
      // Animate chrome shards
      shardPos.current.forEach((pos, i) => {
        const age = (shardAge.current[i] += delta);
        pos.x += shardVel.current[i].x * delta;
        pos.y += shardVel.current[i].y * delta - 4.9 * age * age * delta;
        pos.z += shardVel.current[i].z * delta;
        shardRot.current[i].x += shardAngVel.current[i].x * delta;
        shardRot.current[i].y += shardAngVel.current[i].y * delta;
        shardRot.current[i].z += shardAngVel.current[i].z * delta;
        if (shardsRef.current[i]) {
          shardsRef.current[i].position.copy(pos);
          shardsRef.current[i].rotation.copy(shardRot.current[i]);
          if (shardsRef.current[i].material) {
            shardsRef.current[i].material.opacity = Math.max(0, 1 - age / 3.5);
          }
        }
      });
    }
  });

  return (
    <>
      <group ref={groupRef} position={[0.5, 18, 0]}>
        <group ref={bodyRef}>
          {/* Tube body */}
          <mesh castShadow>
            <cylinderGeometry args={[0.22, 0.22, 2.9, 32]} />
            <meshStandardMaterial color="#1A1A1A" metalness={0.95} roughness={0.18} />
          </mesh>
          {/* Titanium crimp */}
          <mesh position={[0, -1.35, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.22, 32]} />
            <meshStandardMaterial color="#B0B0B0" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Bullet */}
          <group ref={bulletRef} position={[0, 1.65, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.20, 0.20, 0.85, 32]} />
              <meshStandardMaterial
                color="#FF1A4B" roughness={0.04}
                emissive="#FF1A4B" emissiveIntensity={0.18}
              />
            </mesh>
            {/* Angled top */}
            <mesh position={[0.08, 0.38, 0]} rotation={[0, 0, -0.45]}>
              <coneGeometry args={[0.155, 0.28, 32]} />
              <meshStandardMaterial
                color="#FF1A4B" roughness={0.04}
                emissive="#FF1A4B" emissiveIntensity={0.18}
              />
            </mesh>
          </group>
        </group>

        {/* Crimson smear (persistent after impact) */}
        <mesh ref={smearRef} visible={false} position={[0.6, -0.5, 0.15]} rotation={[0, 0, 0.38]}>
          <boxGeometry args={[3.5, 0.12, 0.04]} />
          <meshStandardMaterial
            color="#FF1A4B"
            roughness={0.02}
            emissive="#FF1A4B"
            emissiveIntensity={0.25}
          />
        </mesh>
      </group>

      {/* Chrome shards */}
      {Array.from({ length: SHARD_COUNT }, (_, i) => (
        <mesh key={`ls${i}`} ref={el => { shardsRef.current[i] = el; }} visible={localImpact.current}>
          <boxGeometry args={[0.05 + Math.random() * 0.25, 0.02, 0.15 + Math.random() * 0.2]} />
          <meshStandardMaterial
            color="#C0C0C0"
            metalness={0.95}
            roughness={0.05}
            transparent
            opacity={1}
          />
        </mesh>
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  HAIR SHEARS (Mirror blades + neon handle rings)
// ═══════════════════════════════════════════════════════════════
function HairShears() {
  const groupRef = useRef();
  const bodyRef = useRef();
  const localImpact = useRef(false);
  const blade1Ref = useRef();
  const blade2Ref = useRef();
  const restTimer = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const hp = getHeroProgress();

    if (!localImpact.current) {
      const FALL_END = 0.53;
      if (hp < FALL_END) {
        const t = easeOutCubic(hp / FALL_END);
        groupRef.current.position.y = THREE.MathUtils.lerp(19, -0.2, t);
        groupRef.current.position.x = THREE.MathUtils.lerp(4.5, 2.2, t);
        groupRef.current.rotation.x = hp * 13.2;
        groupRef.current.rotation.y = hp * 13.2;
        groupRef.current.rotation.z = hp * 13.2;
      } else {
        localImpact.current = true;
      }
    } else {
      restTimer.current += delta;
      // Blades spin outward then settle
      if (restTimer.current < 4 && blade1Ref.current && blade2Ref.current) {
        const spinSpeed = Math.max(0, 4.2 - restTimer.current * 1.2);
        blade1Ref.current.rotation.z += spinSpeed * delta;
        blade2Ref.current.rotation.z -= spinSpeed * delta;
        // Emissive flash on peak rotation
        if (spinSpeed > 3.5) {
          blade1Ref.current.material.emissiveIntensity = 8;
          blade2Ref.current.material.emissiveIntensity = 8;
        } else {
          blade1Ref.current.material.emissiveIntensity = Math.max(0, spinSpeed * 0.3);
          blade2Ref.current.material.emissiveIntensity = Math.max(0, spinSpeed * 0.3);
        }
      }
    }
  });

  return (
    <group ref={groupRef} position={[4.5, 19, 0]}>
      <group ref={bodyRef}>
        {/* Blade 1 */}
        <mesh ref={blade1Ref} position={[-0.05, 0.6, 0.02]} rotation={[0, 0, 0.12]} castShadow>
          <boxGeometry args={[0.035, 3.2, 0.018]} />
          <meshStandardMaterial
            color="#E8E8E8"
            metalness={1.0}
            roughness={0.02}
            envMapIntensity={2.5}
            emissive="#E8E8E8"
            emissiveIntensity={0}
          />
        </mesh>
        {/* Blade 2 */}
        <mesh ref={blade2Ref} position={[0.05, 0.6, 0.02]} rotation={[0, 0, -0.12]} castShadow>
          <boxGeometry args={[0.035, 3.2, 0.018]} />
          <meshStandardMaterial
            color="#E8E8E8"
            metalness={1.0}
            roughness={0.02}
            envMapIntensity={2.5}
            emissive="#E8E8E8"
            emissiveIntensity={0}
          />
        </mesh>
        {/* Pivot */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.055, 0.055, 0.065, 16]} />
          <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.08} />
        </mesh>
        {/* Handle ring 1 (index) */}
        <mesh position={[-0.18, -1.5, 0]}>
          <torusGeometry args={[0.32, 0.055, 10, 32]} />
          <meshStandardMaterial
            color="#0D0D0D" roughness={0.6} metalness={0}
            emissive="#00FFE7" emissiveIntensity={1.2}
          />
        </mesh>
        {/* Handle ring 2 (thumb, larger) */}
        <mesh position={[0.22, -1.75, 0]}>
          <torusGeometry args={[0.42, 0.058, 10, 32]} />
          <meshStandardMaterial
            color="#0D0D0D" roughness={0.6} metalness={0}
            emissive="#00FFE7" emissiveIntensity={1.2}
          />
        </mesh>
        {/* Handle connector */}
        <mesh position={[0, -0.9, 0]}>
          <boxGeometry args={[0.06, 0.8, 0.04]} />
          <meshStandardMaterial color="#1A1A1A" metalness={0.5} roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════
//  BLUSH COMPACT + POWDER CLOUD
// ═══════════════════════════════════════════════════════════════
function BlushCompact() {
  const groupRef = useRef();
  const compactBodyRef = useRef();
  const particlesRef = useRef();
  const localImpact = useRef(false);
  const explodeTime = useRef(0);
  const PARTICLE_COUNT = 4000;

  // Particle data
  const { positions, colors, velocities } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = Array.from({ length: PARTICLE_COUNT }, () => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 0.5 + Math.random() * 7;
      const upBias = Math.random() * 4; // Push upward
      return {
        x: Math.sin(phi) * Math.cos(theta) * speed,
        y: Math.abs(Math.cos(phi)) * speed + upBias,
        z: Math.sin(phi) * Math.sin(theta) * speed,
        decay: 0.97 + Math.random() * 0.02,
      };
    });
    // Color distribution: 60% violet, 25% crimson, 15% gold
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = Math.random();
      if (r < 0.6) {
        // #8B00FF violet
        colors[i * 3 + 0] = 0.545; colors[i * 3 + 1] = 0.0; colors[i * 3 + 2] = 1.0;
      } else if (r < 0.85) {
        // #FF1A4B crimson
        colors[i * 3 + 0] = 1.0; colors[i * 3 + 1] = 0.10; colors[i * 3 + 2] = 0.29;
      } else {
        // #D4AF37 gold
        colors[i * 3 + 0] = 0.83; colors[i * 3 + 1] = 0.69; colors[i * 3 + 2] = 0.22;
      }
    }
    return { positions, colors, velocities };
  }, []);

  // Geo attributes
  const posAttr = useMemo(() => new THREE.BufferAttribute(positions.slice(), 3), [positions]);
  const colAttr = useMemo(() => new THREE.BufferAttribute(colors.slice(), 3), [colors]);

  // Current particle positions (mutable)
  const curPos = useRef(positions.slice());
  const curVel = useRef(velocities.map(v => ({ ...v })));
  const exploded = useRef(false);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const hp = getHeroProgress();

    if (!localImpact.current) {
      const FALL_END = 0.58;
      if (hp < FALL_END) {
        const t = easeOutCubic(hp / FALL_END);
        groupRef.current.position.y = THREE.MathUtils.lerp(14, -0.3, t);
        groupRef.current.position.x = THREE.MathUtils.lerp(3.5, 1.8, t);
        groupRef.current.rotation.x = hp * 6;
        groupRef.current.rotation.z = hp * 4;
      } else {
        localImpact.current = true;
        if (compactBodyRef.current) compactBodyRef.current.visible = false;
        // Set particle origin to compact world position
        const wp = new THREE.Vector3();
        groupRef.current.getWorldPosition(wp);
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          curPos.current[i * 3 + 0] = wp.x;
          curPos.current[i * 3 + 1] = wp.y;
          curPos.current[i * 3 + 2] = wp.z;
        }
        explodeTime.current = 0;
        exploded.current = true;
      }
    }

    if (exploded.current && particlesRef.current) {
      explodeTime.current += delta;
      const geo = particlesRef.current.geometry;
      const posAttr = geo.attributes.position;
      const GRAVITY = 0.12; // Low gravity per spec

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const v = curVel.current[i];
        curPos.current[i * 3 + 0] += v.x * delta;
        curPos.current[i * 3 + 1] += v.y * delta;
        curPos.current[i * 3 + 2] += v.z * delta;
        // Decelerate
        v.x *= v.decay;
        v.z *= v.decay;
        // Apply gravity (0.12× real)
        v.y -= GRAVITY * delta * 60;

        posAttr.array[i * 3 + 0] = curPos.current[i * 3 + 0];
        posAttr.array[i * 3 + 1] = curPos.current[i * 3 + 1];
        posAttr.array[i * 3 + 2] = curPos.current[i * 3 + 2];
      }
      posAttr.needsUpdate = true;

      // Dim the cloud over time
      if (particlesRef.current.material) {
        particlesRef.current.material.opacity = Math.max(0, 0.85 - explodeTime.current / 9);
      }
    }
  });

  return (
    <>
      <group ref={groupRef} position={[3.5, 14, 0]}>
        <group ref={compactBodyRef}>
          {/* Base */}
          <mesh castShadow>
            <cylinderGeometry args={[1.1, 1.1, 0.38, 64]} />
            <meshStandardMaterial color="#1A1A1A" metalness={0.3} roughness={0.7} />
          </mesh>
          {/* Rose-gold lid */}
          <mesh position={[0, 0.27, 0]} castShadow>
            <cylinderGeometry args={[1.15, 1.15, 0.14, 64]} />
            <meshStandardMaterial
              color="#E8B4A0" metalness={1.0} roughness={0.08}
              envMapIntensity={1.8}
            />
          </mesh>
          {/* Powder dome */}
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.98, 0.98, 0.06, 64]} />
            <meshStandardMaterial color="#C49A8A" roughness={0.95} metalness={0} />
          </mesh>
        </group>
      </group>

      {/* Particle cloud (always rendered, starts at 0,0,0 until explosion) */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[new Float32Array(positions), 3]} />
          <bufferAttribute attach="attributes-color" args={[new Float32Array(colors), 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.07}
          vertexColors
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  GOLD LIQUID DROPLETS
// ═══════════════════════════════════════════════════════════════
function GoldDroplets() {
  const ref = useRef();
  const DROPLET_COUNT = 80;
  const dropped = useRef(false);
  const time = useRef(0);

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(DROPLET_COUNT * 3);
    const velocities = Array.from({ length: DROPLET_COUNT }, () => ({
      x: (Math.random() - 0.5) * 6,
      y: 2 + Math.random() * 8,
      z: (Math.random() - 0.5) * 4,
      vy: 0,
    }));
    return { positions, velocities };
  }, []);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const hp = getHeroProgress();

    if (!dropped.current && hp > 0.48) {
      dropped.current = true;
      time.current = 0;
      // Set droplets at bottle world position
      for (let i = 0; i < DROPLET_COUNT; i++) {
        positions[i * 3 + 0] = -2 + (Math.random() - 0.5) * 0.5;
        positions[i * 3 + 1] = 0.3 + Math.random() * 0.3;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      }
    }

    if (dropped.current) {
      time.current += delta;
      const posAttr = ref.current.geometry.attributes.position;
      const ZERO_G_SWITCH = 5; // seconds until zero gravity kicks in (drift phase)

      for (let i = 0; i < DROPLET_COUNT; i++) {
        const v = velocities[i];
        posAttr.array[i * 3 + 0] += v.x * delta * 0.4;
        posAttr.array[i * 3 + 1] += v.y * delta;
        posAttr.array[i * 3 + 2] += v.z * delta * 0.4;

        if (time.current < ZERO_G_SWITCH) {
          v.y -= 9.8 * 0.7 * delta; // Under gravity
          if (posAttr.array[i * 3 + 1] < -2) {
            v.y = Math.abs(v.y) * 0.5; // Bounce
            v.x *= 0.85;
            v.z *= 0.85;
          }
        } else {
          // Zero gravity drift - particles orbit slowly
          v.y *= 0.98;
          v.x *= 0.995;
          v.z *= 0.995;
        }
      }
      posAttr.needsUpdate = true;
      if (ref.current.material) {
        ref.current.material.opacity = Math.min(1, time.current * 2);
      }
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#D4AF37"
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        emissive="#D4AF37"
        sizeAttenuation
      />
    </points>
  );
}

// ═══════════════════════════════════════════════════════════════
//  AMBIENT FLOATING PARTICLES (void floor shimmer)
// ═══════════════════════════════════════════════════════════════
function AmbientParticles() {
  const ref = useRef();
  const COUNT = 200;
  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10 - 3;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < COUNT; i++) {
      pos.array[i * 3 + 1] += Math.sin(t * 0.3 + i * 0.5) * 0.002;
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#FFFFFF"
        transparent
        opacity={0.12}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

// ═══════════════════════════════════════════════════════════════
//  CAMERA RIG (parallax from cursor + scroll pullback)
// ═══════════════════════════════════════════════════════════════
function CameraRig({ mouseRef }) {
  const { camera } = useThree();

  useFrame((state) => {
    const mx = mouseRef.current?.nx ?? 0;
    const my = mouseRef.current?.ny ?? 0;

    // Cursor parallax: ±3° H, ±2° V
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mx * 1.8, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.5 + my * 1.2, 0.05);

    const hp = getHeroProgress();
    // Scroll pullback during detonation
    const targetZ = hp < 0.5
      ? 10
      : THREE.MathUtils.lerp(10, 14, (hp - 0.5) / 0.5);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.04);

    camera.lookAt(0, 0.5, 0);
  });

  return null;
}

// ═══════════════════════════════════════════════════════════════
//  MAIN HERO CANVAS COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function HeroScene({ mouseRef }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.08} color="#FFFFFF" />
      {/* High altitude white spot */}
      <spotLight position={[0, 14, 2]} color="#FFFFFF" intensity={0.35} angle={0.6} penumbra={0.4} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      {/* Left rim — Electric Blue Neon */}
      <pointLight position={[-9, 3, -2]} color="#00CFFF" intensity={2.2} />
      {/* Right rim — Blue-Violet Neon */}
      <pointLight position={[9, 3, -2]} color="#5B5FFF" intensity={1.6} />
      {/* Underneath fill — Violet powder bounce */}
      <pointLight position={[0, -2, 2]} color="#8B00FF" intensity={0.7} />

      {/* 3D Objects */}
      <PerfumeBottle onImpact={() => {}} />
      <LipstickTube />
      <HairShears />
      <BlushCompact />
      <GoldDroplets />
      <AmbientParticles />

      {/* Reflective floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#050508" roughness={0.08} metalness={0.15} />
      </mesh>

      {/* Camera rig */}
      <CameraRig mouseRef={mouseRef} />

      {/* Post-processing */}
      <EffectComposer multisampling={4}>
        <Bloom
          luminanceThreshold={0.65}
          luminanceSmoothing={0.04}
          intensity={1.1}
          radius={0.55}
          blendFunction={BlendFunction.ADD}
        />
        <Noise
          opacity={0.018}
          blendFunction={BlendFunction.OVERLAY}
        />
      </EffectComposer>
    </>
  );
}
