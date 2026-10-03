import type { ListenerRegistrationData } from '@/types/listenerRegistration';

export type DemoRegistrationResult = {
  demo: true;
  message: string;
};

/**
 * Mock service seam for future authorized integration.
 * TODO: Replace this in-memory response with the approved listener API.
 * This demo does not transmit, persist, or log registration data.
 */
export async function registerListener(_data: ListenerRegistrationData): Promise<DemoRegistrationResult> {
  return {
    demo: true,
    message: 'Demo complete. Nothing was submitted or saved.',
  };
}