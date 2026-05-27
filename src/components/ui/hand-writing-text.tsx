"use client"

import { motion } from 'framer-motion'

interface HandWrittenTitleProps {
  title?: string
  subtitle?: string
  className?: string
}

function HandWrittenTitle({
  title = 'JokeSphere',
  subtitle = 'A fresh joke is being scribbled into place...',
  className,
}: HandWrittenTitleProps) {
  const draw: any = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 2.2, ease: 'easeInOut' },
        opacity: { duration: 0.4 },
      },
    },
  }

  return (
    <div className={className}>
      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center justify-center py-14 text-center sm:py-20">
        <motion.svg
          width="100%"
          height="100%"
          viewBox="0 0 1200 520"
          initial="hidden"
          animate="visible"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <title>JokeSphere loading sketch</title>
          <motion.path
            d="M 920 120
               C 1140 280, 980 470, 610 500
               C 240 500, 120 405, 145 255
               C 175 120, 345 65, 600 65
               C 840 65, 975 170, 920 120"
            fill="none"
            strokeWidth="12"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={draw}
            className="text-[var(--accent)] opacity-80"
          />
        </motion.svg>

        <div className="relative z-10 flex flex-col items-center gap-2 px-4">
          <motion.h1
            className="font-[family-name:var(--font-heading)] text-5xl tracking-tight text-[var(--text)] sm:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7 }}
          >
            {title}
          </motion.h1>
          {subtitle ? (
            <motion.p
              className="max-w-xl text-base text-[var(--muted)] sm:text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.7 }}
            >
              {subtitle}
            </motion.p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export { HandWrittenTitle }
