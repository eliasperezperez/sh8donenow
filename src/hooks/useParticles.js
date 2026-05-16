import { useContext } from 'react';
import { ParticleContext } from '../components/ParticleSystem';

export function useParticles() {
  return useContext(ParticleContext);
}
