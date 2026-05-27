import * as React from 'react'
import { useEffect, useRef, useState } from 'react'

type MouseFollowingEyesProps = {
  className?: string
}

const MouseFollowingEyes: React.FC<MouseFollowingEyesProps> = ({ className }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const eye1Ref = useRef<HTMLDivElement>(null)
  const eye2Ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  return (
    <div
      className={`flex items-center justify-center rounded-[28px] bg-white/55 p-4 shadow-[var(--shadow)] backdrop-blur-xl ${className ?? ''}`}
      onMouseMove={handleMouseMove}
    >
      <div className="flex gap-4">
        <Eye
          mouseX={mousePos.x}
          mouseY={mousePos.y}
          selfRef={eye1Ref as React.RefObject<HTMLDivElement>}
          otherRef={eye2Ref as React.RefObject<HTMLDivElement>}
        />
        <Eye
          mouseX={mousePos.x}
          mouseY={mousePos.y}
          selfRef={eye2Ref as React.RefObject<HTMLDivElement>}
          otherRef={eye1Ref as React.RefObject<HTMLDivElement>}
        />
      </div>
    </div>
  )
}

interface EyeProps {
  mouseX: number
  mouseY: number
  selfRef: React.RefObject<HTMLDivElement>
  otherRef: React.RefObject<HTMLDivElement>
}

const Eye: React.FC<EyeProps> = ({ mouseX, mouseY, selfRef, otherRef }) => {
  const pupilRef = useRef<HTMLDivElement>(null)
  const [center, setCenter] = useState({ x: 0, y: 0 })

  const updateCenter = () => {
    if (!selfRef.current) return
    const rect = selfRef.current.getBoundingClientRect()
    setCenter({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    })
  }

  useEffect(() => {
    updateCenter()
    window.addEventListener('resize', updateCenter)
    return () => window.removeEventListener('resize', updateCenter)
  }, [])

  useEffect(() => {
    updateCenter()

    const isInside = (ref: React.RefObject<HTMLDivElement>) => {
      const rect = ref.current?.getBoundingClientRect()
      if (!rect) return false
      return (
        mouseX >= rect.left &&
        mouseX <= rect.right &&
        mouseY >= rect.top &&
        mouseY <= rect.bottom
      )
    }

    if (isInside(selfRef) || isInside(otherRef)) return

    const dx = mouseX - center.x
    const dy = mouseY - center.y
    const angle = Math.atan2(dy, dx)

    const maxMove = 16
    const pupilX = Math.cos(angle) * maxMove
    const pupilY = Math.sin(angle) * maxMove

    if (pupilRef.current) {
      pupilRef.current.style.transform = `translate(${pupilX}px, ${pupilY}px)`
    }
  }, [mouseX, mouseY, center.x, center.y, selfRef, otherRef])

  return (
    <div
      ref={selfRef}
      className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-[var(--text)] bg-[var(--accent)]/40 sm:h-24 sm:w-24"
    >
      <div
        ref={pupilRef}
        className="absolute h-7 w-7 rounded-full bg-[var(--text)] transition-transform duration-75"
      >
        <div className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full bg-white" />
      </div>
    </div>
  )
}

export { MouseFollowingEyes }
