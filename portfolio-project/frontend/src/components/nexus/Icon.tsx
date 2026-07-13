import type { ComponentType } from "react";
import {
  FiActivity,
  FiArrowRight,
  FiBox,
  FiDatabase,
  FiDownload,
  FiGitBranch,
  FiGithub,
  FiGrid,
  FiImage,
  FiLayers,
  FiLinkedin,
  FiMail,
  FiMaximize2,
  FiMinus,
  FiX,
  FiZoomIn,
  FiZoomOut,
} from "react-icons/fi";

/**
 * Thin name→react-icons/fi map so the ported YO.sys design components keep
 * their `<Icon name="…" size={n} />` call sites (originally CDN Feather).
 */
const ICONS: Record<string, ComponentType<{ size?: number }>> = {
  "arrow-right": FiArrowRight,
  download: FiDownload,
  github: FiGithub,
  linkedin: FiLinkedin,
  mail: FiMail,
  "maximize-2": FiMaximize2,
  "zoom-in": FiZoomIn,
  "zoom-out": FiZoomOut,
  x: FiX,
  image: FiImage,
  minus: FiMinus,
  layers: FiLayers,
  "git-branch": FiGitBranch,
  activity: FiActivity,
  database: FiDatabase,
  grid: FiGrid,
  box: FiBox,
};

export function Icon({ name, size = 16 }: { name: string; size?: number }) {
  const Glyph = ICONS[name] ?? FiBox;
  return <Glyph size={size} />;
}
