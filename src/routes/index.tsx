import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play } from "lucide-react";
import shopping3d from "@/assets/shopping-3d.png";
import { VideoModal } from "@/components/VideoModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shopping Video — A Premium 3D Shopping Moment" },
      {
        name: "description",
        content: "Watch the shopping video in a soft, premium 3D shopping scene.",
      },
      { property: "og:title", content: "Shopping Video" },
      {
        property: "og:description",
        content: "Watch the shopping video in a soft, premium 3D shopping scene.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [open, setOpen] = useState(false);

  return (
    <main className="scene relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div className="blob blob-1" aria-hidden />
      <div className="blob blob-2" aria-hidden />
      <div className="blob blob-3" aria-hidden />

      <div className="relative flex w-full max-w-xl flex-col items-center text-center">
        <div className="glass-panel float-soft rounded-[2.5rem] p-6 sm:p-10">
          <img
            src={shopping3d}
            alt="3D shopping cart with grocery products and a shopping bag"
            width={1024}
            height={1024}
            className="h-auto w-64 select-none drop-shadow-2xl sm:w-80"
          />
        </div>

        <h1 className="mt-10 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Shopping Video
        </h1>

        <button onClick={() => setOpen(true)} className="watch-btn mt-8">
          <Play className="size-4" />
          WATCH VIDEO
        </button>
      </div>

      {open && <VideoModal onClose={() => setOpen(false)} />}
    </main>
  );
}
