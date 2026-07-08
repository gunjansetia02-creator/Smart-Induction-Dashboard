'use client'

import { useEffect, useRef } from 'react'
import { detectVideoSource } from '@/lib/video-embed'

declare global {
  interface Window {
    YT?: any
    onYouTubeIframeAPIReady?: () => void
  }
}

let ytApiPromise: Promise<void> | null = null
function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()
  if (ytApiPromise) return ytApiPromise
  ytApiPromise = new Promise(resolve => {
    const prevCallback = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => { prevCallback?.(); resolve() }
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)
  })
  return ytApiPromise
}

export function VideoPlayer({
  url,
  initialPercent,
  initialPositionSeconds,
  onProgress,
  onComplete,
  onUnplayable,
}: {
  url: string
  initialPercent: number
  initialPositionSeconds: number
  onProgress: (percent: number, positionSeconds: number) => void
  onComplete: () => void
  onUnplayable: () => void
}) {
  const source = detectVideoSource(url)
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastPercentRef = useRef(initialPercent)

  useEffect(() => {
    if (source.kind !== 'youtube') return
    let cancelled = false

    loadYouTubeApi().then(() => {
      if (cancelled || !containerRef.current) return
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: source.videoId,
        playerVars: { rel: 0 },
        events: {
          onReady: (e: any) => {
            if (initialPositionSeconds > 0) e.target.seekTo(initialPositionSeconds, true)
          },
          onStateChange: (e: any) => {
            if (e.data === window.YT.PlayerState.PLAYING) {
              if (pollRef.current) clearInterval(pollRef.current)
              pollRef.current = setInterval(() => {
                const player = playerRef.current
                if (!player?.getDuration) return
                const duration = player.getDuration()
                const current = player.getCurrentTime()
                if (!duration) return
                const percent = Math.round((current / duration) * 100)
                if (percent > lastPercentRef.current) {
                  lastPercentRef.current = percent
                  onProgress(percent, current)
                  if (percent >= 95) onComplete()
                }
              }, 2000)
            } else if (pollRef.current) {
              clearInterval(pollRef.current)
            }
            if (e.data === window.YT.PlayerState.ENDED) onComplete()
          },
          onError: () => onUnplayable(),
        },
      })
    })

    return () => {
      cancelled = true
      if (pollRef.current) clearInterval(pollRef.current)
      playerRef.current?.destroy?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source.kind === 'youtube' ? source.videoId : null])

  if (source.kind === 'youtube') {
    return <div ref={containerRef} className="w-full max-w-[480px] aspect-video rounded-[4px] overflow-hidden bg-black" />
  }

  if (source.kind === 'drive') {
    return (
      <div>
        <iframe
          src={`https://drive.google.com/file/d/${source.fileId}/preview`}
          className="w-full max-w-[480px] aspect-video rounded-[4px] border-0"
          allow="autoplay"
        />
        <div className="text-[11px] text-faint mt-1.5">Watch progress can&apos;t be auto-tracked for Drive-hosted videos — mark it done once you&apos;ve watched it.</div>
      </div>
    )
  }

  if (source.kind === 'sharepoint') {
    // Koenig's SharePoint tenant blocks iframe embedding outright (X-Frame-Options), not just
    // login cookies — no amount of authentication fixes that, so don't attempt an iframe at all.
    return (
      <div className="w-full max-w-[480px] bg-white border border-bdr rounded-[6px] p-6 flex flex-col items-center text-center gap-2.5">
        <div className="w-[46px] h-[46px] rounded-full bg-sky-dim flex items-center justify-center text-[20px] text-sky">▶</div>
        <div className="text-[13px] text-navy font-semibold">This video is hosted on SharePoint</div>
        <div className="text-[11.5px] text-muted max-w-[320px]">SharePoint doesn&apos;t allow its videos to be shown inside other sites, so it opens in a new tab instead. Watch progress can&apos;t be auto-tracked here — mark it done once you&apos;ve watched it.</div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 px-[14px] py-[8px] text-[12.5px] font-semibold bg-sky text-white rounded no-underline hover:opacity-85"
        >
          ▶ Watch on SharePoint ↗
        </a>
      </div>
    )
  }

  // direct file
  return (
    <video
      src={url}
      controls
      className="w-full max-w-[480px] rounded-[4px] bg-black"
      onLoadedMetadata={e => {
        if (initialPositionSeconds > 0 && initialPositionSeconds < e.currentTarget.duration) {
          e.currentTarget.currentTime = initialPositionSeconds
        }
      }}
      onTimeUpdate={e => {
        const video = e.currentTarget
        if (!video.duration) return
        const percent = Math.round((video.currentTime / video.duration) * 100)
        if (percent <= lastPercentRef.current) return
        lastPercentRef.current = percent
        onProgress(percent, video.currentTime)
      }}
      onError={onUnplayable}
      onEnded={onComplete}
    />
  )
}
