"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { lighting } from "@/styles/tokens3d";
import { useQuality } from "./quality";

/**
 * Photographic three-point rig plus a dim procedural reflection environment.
 * Only the key light casts a shadow, onto an invisible shadow-catcher floor;
 * the contact shadow grounds the feet. Low-power devices skip the shadow map.
 */
export function StudioLights() {
  const { ambient, key, fill, rim, environment, contactShadow } = lighting;
  const castShadows = useQuality() === "high";
  const { bounds, mapSize } = key.shadow;

  return (
    <>
      <ambientLight intensity={ambient.intensity} color={ambient.color} />
      <directionalLight
        position={key.position}
        intensity={key.intensity}
        color={key.color}
        castShadow={castShadows}
        shadow-mapSize={[mapSize.high, mapSize.high]}
        shadow-bias={key.shadow.bias}
        shadow-normalBias={key.shadow.normalBias}
        shadow-camera-left={bounds.left}
        shadow-camera-right={bounds.right}
        shadow-camera-top={bounds.top}
        shadow-camera-bottom={bounds.bottom}
        shadow-camera-near={bounds.near}
        shadow-camera-far={bounds.far}
      />
      <directionalLight position={fill.position} intensity={fill.intensity} color={fill.color} />
      <directionalLight position={rim.position} intensity={rim.intensity} color={rim.color} />

      {castShadows ? (
        <mesh rotation-x={-Math.PI / 2} position-y={0.0005} receiveShadow>
          <planeGeometry args={[4, 4]} />
          <shadowMaterial transparent opacity={key.shadow.opacity} color={contactShadow.color} />
        </mesh>
      ) : null}

      {/* Built from Lightformers so there is no HDR download. */}
      <Environment resolution={environment.resolution} environmentIntensity={environment.intensity}>
        {environment.formers.map((f, i) => (
          <Lightformer
            key={i}
            form={f.form}
            intensity={f.intensity}
            color={f.color}
            position={f.position}
            scale={[...f.scale]}
            target={[0, 1, 0]}
          />
        ))}
      </Environment>

      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={contactShadow.opacity}
        blur={contactShadow.blur}
        far={contactShadow.far}
        scale={contactShadow.scale}
        resolution={contactShadow.resolution}
        color={contactShadow.color}
      />
    </>
  );
}
