import {
  Monitor,
  Smartphone,
  Laptop,
  Tablet,
  Tv,
  HelpCircle,
} from "lucide-react";

export const deviceIcons = {
  desktop: Monitor,
  laptop: Laptop,
  mobile: Smartphone,
  tablet: Tablet,
  tv: Tv,
  unknown: HelpCircle,
};

export function getDeviceType(deviceString = "") {
  const str = deviceString.toLowerCase();

  if (
    str.includes("mobile") ||
    str.includes("iphone") ||
    str.includes("android")
  )
    return "mobile";
  if (str.includes("tablet") || str.includes("ipad")) return "tablet";
  if (str.includes("laptop") || str.includes("macbook")) return "laptop";
  if (str.includes("desktop") || str.includes("mac") || str.includes("windows"))
    return "desktop";
  if (str.includes("tv")) return "tv";

  return "unknown";
}
