export type VideoPlatform = "youtube" | "facebook" | "tiktok";

const YOUTUBE_HOSTS = [
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be",
];

const TIKTOK_HOSTS = [
  "tiktok.com",
  "www.tiktok.com",
  "m.tiktok.com",
  "vm.tiktok.com",
];

export const normalizeUrl = (url: string) => {
  try {
    return new URL(url.trim());
  } catch {
    return null;
  }
};

export const getYoutubeVideoId = (url: string): string | null => {
  const parsed = normalizeUrl(url);
  if (!parsed) return null;

  if (parsed.hostname === "youtu.be") {
    return parsed.pathname.split("/")[1] || null;
  }

  if (parsed.searchParams.has("v")) {
    return parsed.searchParams.get("v");
  }

  const path = parsed.pathname.replace(/^\/+/, "");
  if (path.startsWith("embed/")) {
    return path.split("/")[1] || null;
  }

  return null;
};

export const getTikTokVideoId = (url: string): string | null => {
  const parsed = normalizeUrl(url);
  if (!parsed) return null;

  //handle vm.tiktok.com short links
  if (parsed.hostname === "vm.tiktok.com") {
    return parsed.pathname.split("/")[1] || null;
  }

  //standard tiktok URL format: tiktok.com/@username/video/1234567890
  const path = parsed.pathname.replace(/^\/+/, "");
  const videoMatch = path.match(/video\/(\d+)/);
  if (videoMatch) {
    return videoMatch[1];
  }

  return null;
}

export const detectVideoPlatform = (url: string): VideoPlatform | null => {
  const parsed = normalizeUrl(url);
  if (!parsed) return null;

  const host = parsed.hostname.toLowerCase();

  if (YOUTUBE_HOSTS.includes(host)) {
    return "youtube";
  }

  if (host.includes("facebook.com") || host.includes("fb.watch")) {
    return "facebook";
  }

  if (TIKTOK_HOSTS.includes(host)) {
    return "tiktok";
  }

  return null;
};

export function getVideoEmbedUrl(
  platform: 'youtube' | 'facebook' | 'tiktok',
  url: string
): string | null {
  if (platform === 'youtube') {
    // handle youtube.com + youtu.be
    try {
      const u = new URL(url);
      let id = u.searchParams.get('v');

      if (!id && url.includes('youtu.be/')) {
        id = url.split('youtu.be/')[1].split(/[?&]/)[0];
      }

      if (!id) return null;
      return `https://www.youtube.com/embed/${id}`;
    } catch {
      return null;
    }
  }

  if (platform === 'facebook') {
    // IMPORTANT: Facebook expects the ORIGINAL post/video URL as href=
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
      url
    )}&show_text=false`;
  }

  if(platform === 'tiktok') {
    const videoId = getTikTokVideoId(url);
    if (!videoId) return null;
    //tiktok embed url format
    return `https://www.tiktok.com/embed/v2/${videoId}`;
  }

  return null;
}

export const getVideoThumbnailUrl = (
  platform: VideoPlatform,
  url: string
): string | null => {
  if (platform === "youtube") {
    const videoId = getYoutubeVideoId(url);
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  // Facebook and TikTok do not offer a simple thumbnail without API calls.
  // Return null so the UI can fall back to a generic background.
  return null;
};

