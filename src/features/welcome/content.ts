import { Camera, Lightbulb, Mic, Target, TrendingUp, Wallet } from "lucide-react";
import type { BenefitItem, LandingCardItem } from "./types";

export const heroBenefits: BenefitItem[] = [
  { id: "voice-photo", label: "Track expenses by voice or photo" },
  { id: "alerts", label: "Get alerts before you're broke" },
];

export const preventionCards: LandingCardItem[] = [
  {
    id: "voice",
    title: "Record expenses by voice",
    description: "Just say it, we'll track it automatically.",
    icon: Mic,
  },
  {
    id: "receipt",
    title: "Snap a photo of your receipt",
    description: "Just snap a photo, done.",
    icon: Camera,
  },
  {
    id: "forecast",
    title: "See when you'll be broke",
    description: "Know in advance if you'll overshoot your budget.",
    icon: TrendingUp,
  },
];

export const goalsCards: LandingCardItem[] = [
  {
    id: "goals",
    title: "Simple Goals",
    description: "Set a specific target to save each month.",
    icon: Target,
  },
  {
    id: "budgeting",
    title: "Budgeting",
    description: "Set your spending limits before you overspend.",
    icon: Wallet,
  },
  {
    id: "insights",
    title: "Smart Insights",
    description: "Break down expenses and get personalized tips.",
    icon: Lightbulb,
  },
];
