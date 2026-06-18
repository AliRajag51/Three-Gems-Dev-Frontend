// Shared YouTube URL parsing — used by both the public plugin page (to embed the
// video) and the admin Details tab (to preview it), so they agree on what counts
// as a valid link.

// The 11-char video id from any common URL form (watch / youtu.be / embed / shorts
// / live), or null if the URL isn't a recognisable YouTube link.
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}

// A privacy-friendly embed URL for the video, or null if not parseable.
export function youtubeEmbedUrl(url: string | null | undefined): string | null {
  const id = youtubeId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}
