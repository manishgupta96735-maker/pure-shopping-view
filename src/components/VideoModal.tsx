import { useCallback, useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  X,
} from "lucide-react";

const VIDEO_ID = "dzuZ-_xscps";

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

function loadYouTubeApi(): Promise<any> {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) return resolve(window.YT);
    const existing = document.getElementById("yt-iframe-api");
    if (!existing) {
      const tag = document.createElement("script");
      tag.id = "yt-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(window.YT);
    };
    const poll = window.setInterval(() => {
      if (window.YT && window.YT.Player) {
        window.clearInterval(poll);
        resolve(window.YT);
      }
    }, 200);
  });
}

function fmt(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const s = Math.floor(seconds % 60);
  const m = Math.floor(seconds / 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoModal({ onClose }: { onClose: () => void }) {
  const holderRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(70);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let raf = 0;

    loadYouTubeApi().then((YT) => {
      if (cancelled || !holderRef.current) return;
      playerRef.current = new YT.Player(holderRef.current, {
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          disablekb: 1,
          fs: 0,
          loop: 1,
          playlist: VIDEO_ID,
          iv_load_policy: 3,
          origin: window.location.origin,
        },
        events: {
          onReady: (e: any) => {
            setReady(true);
            setDuration(e.target.getDuration() || 0);
            e.target.setVolume(volume);
            e.target.mute();
            e.target.playVideo();
          },
          onStateChange: (e: any) => {
            setPlaying(e.data === 1);
            if (e.data === 1) setDuration(e.target.getDuration() || 0);
          },
        },
      });
    });

    const tick = () => {
      const p = playerRef.current;
      if (p?.getCurrentTime && !seeking) {
        setTime(p.getCurrentTime() || 0);
        if (!duration && p.getDuration) setDuration(p.getDuration() || 0);
      }
      raf = window.setTimeout(tick, 250) as unknown as number;
    };
    tick();

    return () => {
      cancelled = true;
      window.clearTimeout(raf);
      playerRef.current?.destroy?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    playing ? p.pauseVideo() : p.playVideo();
  }, [playing]);

  const toggleMute = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (muted) {
      p.unMute();
      p.setVolume(volume || 70);
      setMuted(false);
    } else {
      p.mute();
      setMuted(true);
    }
  }, [muted, volume]);

  const goFullscreen = useCallback(() => {
    const el = shellRef.current as any;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
    }
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      style={{ background: "color-mix(in oklab, var(--foreground) 35%, transparent)" }}
      onClick={onClose}
    >
      <div
        ref={shellRef}
        onClick={(e) => e.stopPropagation()}
        className="glass-panel w-full max-w-4xl overflow-hidden rounded-3xl p-3 shadow-2xl sm:p-4"
      >
        <div className="relative w-full overflow-hidden rounded-2xl bg-black pt-[56.25%]">
          <div className="absolute inset-0">
            <div ref={holderRef} className="h-full w-full" />
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-3">
          <input
            type="range"
            aria-label="Seek"
            min={0}
            max={duration || 100}
            step={0.5}
            value={Math.min(time, duration || 100)}
            onMouseDown={() => setSeeking(true)}
            onTouchStart={() => setSeeking(true)}
            onChange={(e) => setTime(Number(e.target.value))}
            onMouseUp={(e) => {
              setSeeking(false);
              playerRef.current?.seekTo(Number((e.target as HTMLInputElement).value), true);
            }}
            onTouchEnd={(e) => {
              setSeeking(false);
              playerRef.current?.seekTo(Number((e.target as HTMLInputElement).value), true);
            }}
            className="glass-range"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={togglePlay} className="glass-ctrl" aria-label={playing ? "Pause" : "Play"}>
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
            <button onClick={toggleMute} className="glass-ctrl" aria-label={muted ? "Unmute" : "Mute"}>
              {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
            <input
              type="range"
              aria-label="Volume"
              min={0}
              max={100}
              value={muted ? 0 : volume}
              onChange={(e) => {
                const v = Number(e.target.value);
                setVolume(v);
                const p = playerRef.current;
                if (!p) return;
                p.setVolume(v);
                if (v > 0 && muted) {
                  p.unMute();
                  setMuted(false);
                }
                if (v === 0) {
                  p.mute();
                  setMuted(true);
                }
              }}
              className="glass-range"
              style={{ width: "6rem", flex: "none" }}
            />
            <span className="ml-1 text-xs tabular-nums text-muted-foreground">
              {fmt(time)} / {fmt(duration)}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={goFullscreen} className="glass-ctrl" aria-label="Fullscreen">
                <Maximize className="size-4" />
              </button>
              <button onClick={onClose} className="glass-ctrl" aria-label="Close">
                <X className="size-4" />
              </button>
            </div>
          </div>
          {!ready && <p className="text-xs text-muted-foreground">Loading player…</p>}
          {muted && ready && (
            <p className="text-xs text-muted-foreground">Started muted — tap the sound icon to unmute.</p>
          )}
        </div>
      </div>
    </div>
  );
}
