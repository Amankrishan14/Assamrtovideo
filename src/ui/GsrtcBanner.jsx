import React from "react"
import ArFrame from "./ArFrame"

const banner = "/assets/banner/gsrtc-banner.png"
const video = "/videos/GSRTC.mp4"

export default function GsrtcBanner({ onVideoPlaying }) {
  return <ArFrame banner={banner} video={video} onVideoPlaying={onVideoPlaying} />
}


