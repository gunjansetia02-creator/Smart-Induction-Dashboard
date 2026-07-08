export type VideoSource =
  | { kind: 'youtube'; videoId: string }
  | { kind: 'drive'; fileId: string }
  | { kind: 'sharepoint' }
  | { kind: 'direct' } // a raw file the browser's <video> tag can play directly
  | { kind: 'unsupported' }

export function detectVideoSource(url: string): VideoSource {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = u.searchParams.get('v')
      if (id) return { kind: 'youtube', videoId: id }
      const shortsMatch = u.pathname.match(/^\/(shorts|embed)\/([^/?]+)/)
      if (shortsMatch) return { kind: 'youtube', videoId: shortsMatch[2] }
    }
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1)
      if (id) return { kind: 'youtube', videoId: id }
    }

    if (host === 'drive.google.com') {
      const match = u.pathname.match(/\/file\/d\/([^/]+)/)
      if (match) return { kind: 'drive', fileId: match[1] }
      const idParam = u.searchParams.get('id')
      if (idParam) return { kind: 'drive', fileId: idParam }
    }

    // SharePoint / OneDrive "for Business" share links, e.g.
    // https://company-my.sharepoint.com/:v:/g/personal/.../ID?e=token
    // Note: most tenants block these from being iframed at all (X-Frame-Options), so we
    // don't try to embed it — just detect it so the UI can offer a clean "open" experience.
    if (host.endsWith('.sharepoint.com') && /\/:v:\//.test(u.pathname)) {
      return { kind: 'sharepoint' }
    }

    if (/\.(mp4|webm|ogg|ogv|mov)$/i.test(u.pathname)) {
      return { kind: 'direct' }
    }

    return { kind: 'unsupported' }
  } catch {
    return { kind: 'unsupported' }
  }
}
