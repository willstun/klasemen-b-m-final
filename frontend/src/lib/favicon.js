import { getImageUrl } from "./config";

export function setFavicon(url) {
  if (!url || typeof window === "undefined") return;
  let link = document.querySelector("link[rel='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = getImageUrl(url);
}
