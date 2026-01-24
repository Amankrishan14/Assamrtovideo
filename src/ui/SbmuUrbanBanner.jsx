import React from "react"
import ArFrame from "./ArFrame"

const banner = "/assets/banner/sbmu-banner.png"
const video = "/videos/SBMU.mp4"

export default function SbmuUrbanBanner({ onVideoPlaying }) {
  return <ArFrame banner={banner} video={video} onVideoPlaying={onVideoPlaying} />
}


