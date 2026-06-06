'use client';

import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

export function EtherealBloom() {
  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        intensity={1.5}
        mipmapBlur
      />
      <Vignette offset={0.3} darkness={0.7} />
    </EffectComposer>
  );
}
