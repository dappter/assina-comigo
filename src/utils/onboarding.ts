/**
 * Utilitários de persistência para onboarding
 * Armazena em localStorage qual etapa foi completada
 */

const ONBOARDING_KEY = "assina_comigo_onboarding_completed";
const ONBOARDING_STEP_KEY = "assina_comigo_onboarding_step";

export function hasCompletedOnboarding(userId: string): boolean {
  if (typeof window === "undefined") return false;
  const completed = localStorage.getItem(`${ONBOARDING_KEY}_${userId}`);
  return completed === "true";
}

export function getOnboardingStep(userId: string): number {
  if (typeof window === "undefined") return 0;
  const step = localStorage.getItem(`${ONBOARDING_STEP_KEY}_${userId}`);
  return step ? parseInt(step, 10) : 0;
}

export function setOnboardingStep(userId: string, step: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${ONBOARDING_STEP_KEY}_${userId}`, step.toString());
}

export function completeOnboarding(userId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${ONBOARDING_KEY}_${userId}`, "true");
}

export function resetOnboarding(userId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`${ONBOARDING_KEY}_${userId}`);
  localStorage.removeItem(`${ONBOARDING_STEP_KEY}_${userId}`);
}
