import { UAParser } from "ua-parser-js";

export function getBrowserInfo(userAgent = "") {
  const ua = userAgent || "";
  const p = new UAParser(ua);
  const b = p.getBrowser();
  let name = b.name || "";

  if (/YaBrowser\/(\d+)/i.test(ua)) name = "Yandex";
  else if (/OPR\/(\d+)/i.test(ua)) name = "Opera";

  const major =
    b.major ||
    (b.version ? b.version.split(".")[0] : "") ||
    (/\b(?:Chrome|Edg|YaBrowser|OPR)\/(\d+)/.exec(ua)?.[1] ?? "");

  const isWV =
    /\b; wv\b/.test(ua) ||
    (/\bAndroid\b/.test(ua) &&
      /\bChrome\/\d+/.test(ua) &&
      !/\bVersion\/\d+/.test(ua));
  if (isWV && /Chrome/i.test(name)) return `WebView (Chrome ${major})`;

  return [name || "Браузер", major].filter(Boolean).join(" ");
}

export function parseUA(userAgent = "") {
  const p = new UAParser(userAgent || "");
  const b = p.getBrowser();
  const os = p.getOS();
  const d = p.getDevice();

  // Браузер
  let browserName = b.name || "";
  if (/YaBrowser/i.test(userAgent)) browserName = "Yandex";
  else if (/OPR/i.test(userAgent)) browserName = "Opera";

  const browser = [
    browserName,
    b.major || (b.version ? b.version.split(".")[0] : ""),
  ]
    .filter(Boolean)
    .join(" ");

  const osStr = [os.name, os.version].filter(Boolean).join(" ").trim();

  const vendorModel =
    [d.vendor, d.model].filter(Boolean).join(" ").trim() ||
    (d.type ? d.type : "");

  return [browser || "Неизвестный браузер", osStr, vendorModel]
    .filter(Boolean)
    .join(" • ");
}

export function getDeviceTypeFromUA(userAgent = "") {
  const t = new UAParser(userAgent).getDevice().type;
  return t || "desktop";
}
