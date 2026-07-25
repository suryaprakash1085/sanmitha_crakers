import { Award, ShieldCheck, Truck, Headset, Sparkles, Flame, Gift, Star, Heart, Target, Eye, Zap, LucideIcon } from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  Award, ShieldCheck, Truck, Headset, Sparkles, Flame, Gift, Star, Heart, Target, Eye, Zap,
};

export const ICON_NAMES = Object.keys(ICON_MAP);

export const Icon = ({ name, className }: { name: string; className?: string }) => {
  const Cmp = ICON_MAP[name] ?? Sparkles;
  return <Cmp className={className} />;
};
