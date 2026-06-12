import type { ComponentType } from "react";

export interface BenefitItem {
  id: string;
  label: string;
}

export interface LandingCardItem {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}
