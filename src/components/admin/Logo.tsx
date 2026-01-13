'use client'
import React from 'react'

const Logo: React.FC = () => {
  return (
    <img
      src="/favicon-daramis-logo.png"
      alt="Daramis"
      width={40}
      height={40}
      style={{
        display: 'block',
        borderRadius: '6px',
      }}
    />
  )
}

export default Logo
