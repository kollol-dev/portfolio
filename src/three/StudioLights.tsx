"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { lighting } from "@/styles/tokens3d";

/** Three-point studio rig plus a procedural reflection environment. */
export function StudioLights() {
  const { ambient, key, fill, rim, environment, contactShadow } = lighting;
  return (
    <>
      <ambientLight intensity={ambient.intensity} color={ambient.color} />
      <directionalLight position={key.position} intensity={key.intensity} color={key.color} />
      <directionalLight position={fill.position} intensity={fill.intensity} color={fill.color} />
      <directionalLight position={rim.position} intensity={rim.intensity} color={rim.color} />

      {/* Built from Lightformers so there is no HDR download. */}
      <Environment resolution={environment.resolution} environmentIntensity={environment.intensity}>
        <Lightformer form="rect" intensity={2} position={[2, 3, 3]} scale={[3, 2, 1]} target={[0, 1, 0]} />
        <Lightformer
          form="rect"
          intensity={0.8}
          color="#cfdcff"
          position={[-3, 2, 1]}
          scale={[2, 3, 1]}
          target={[0, 1, 0]}
        />
        <Lightformer form="ring" intensity={1.2} position={[0, 4, -3]} scale={2} target={[0, 1, 0]} />
      </Environment>

      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={contactShadow.opacity}
        blur={contactShadow.blur}
        far={contactShadow.far}
        scale={contactShadow.scale}
        resolution={contactShadow.resolution}
        color="#000000"
      />
    </>
  );
}
