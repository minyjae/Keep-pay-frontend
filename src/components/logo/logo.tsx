import React from 'react'

type LogoProps = {
  width?: number | string
  height?: number | string
  className?: string
  alt?: string
}

export default function Logo({
  width = 100,
  height = 100,
  className = "",
  alt = "LEGO Logo"
}: LogoProps = {}) {
  return (
    <img 
      src="/LEGO_logo.svg.png" 
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  )
}
