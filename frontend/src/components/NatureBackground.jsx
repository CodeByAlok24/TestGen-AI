const COMETS = [
  { id: 'c1', top: '14%', delay: '0s', duration: '11s', size: 180, angle: -18 },
  { id: 'c2', top: '28%', delay: '3.5s', duration: '13s', size: 220, angle: -14 },
  { id: 'c3', top: '52%', delay: '6.5s', duration: '12s', size: 160, angle: -20 },
  { id: 'c4', top: '70%', delay: '9.5s', duration: '15s', size: 200, angle: -12 },
]

const ASTEROIDS = [
  { id: 'a1', top: '20%', delay: '1.5s', duration: '24s', size: 16, drift: 180 },
  { id: 'a2', top: '42%', delay: '8s', duration: '28s', size: 22, drift: 220 },
  { id: 'a3', top: '64%', delay: '4.5s', duration: '26s', size: 14, drift: 200 },
  { id: 'a4', top: '76%', delay: '11s', duration: '30s', size: 18, drift: 240 },
]

export default function NatureBackground({ showDeckAccents = false, variant = "app" }) {
  const isAuth = variant === "auth"
  const cometSet = isAuth ? COMETS.slice(0, 2) : COMETS
  const asteroidSet = isAuth ? ASTEROIDS.slice(0, 2) : ASTEROIDS

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <style>
        {`
          @keyframes codex-comet-travel {
            0% { transform: translate3d(-18vw, 0, 0) rotate(var(--comet-angle)); opacity: 0; }
            8% { opacity: 0.95; }
            72% { opacity: 0.85; }
            100% { transform: translate3d(132vw, 18vh, 0) rotate(var(--comet-angle)); opacity: 0; }
          }

          @keyframes codex-asteroid-drift {
            0% { transform: translate3d(-10vw, 0, 0) rotate(0deg); opacity: 0; }
            10% { opacity: 0.9; }
            88% { opacity: 0.85; }
            100% { transform: translate3d(var(--asteroid-drift), 8vh, 0) rotate(360deg); opacity: 0; }
          }

          @keyframes codex-star-pulse {
            0%, 100% { opacity: 0.18; transform: scale(1); }
            50% { opacity: 0.42; transform: scale(1.18); }
          }

          @keyframes codex-star-drift {
            0% { transform: translate3d(0, 0, 0); }
            50% { transform: translate3d(10px, -12px, 0); }
            100% { transform: translate3d(0, 0, 0); }
          }

          @media (prefers-reduced-motion: reduce) {
            .codex-comet,
            .codex-asteroid,
            .codex-star {
              animation: none !important;
            }
          }
        `}
      </style>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 28%, rgba(255,132,48,0.14), transparent 18%), radial-gradient(circle at 18% 62%, rgba(95,182,255,0.1), transparent 18%), radial-gradient(circle at 86% 42%, rgba(220,196,136,0.1), transparent 20%), linear-gradient(180deg, rgba(6,5,15,0.2), rgba(5,4,13,0.7))',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '36%',
          width: 680,
          height: 680,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 34% 28%, rgba(255,216,168,0.92), rgba(255,120,40,0.92) 28%, rgba(152,49,11,0.96) 58%, rgba(61,18,10,0.98) 76%, rgba(18,8,10,0.98) 100%)',
          boxShadow: '0 0 220px rgba(255,102,24,0.18), inset -70px -70px 120px rgba(35,7,5,0.58)',
          opacity: 0.28,
          filter: 'blur(1px)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '38%',
          width: 920,
          height: 920,
          transform: 'translate(-50%, -50%) rotate(8deg)',
          borderRadius: '50%',
          border: '2px dashed rgba(255,255,255,0.16)',
          opacity: 0.34,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '38%',
          width: 1220,
          height: 1220,
          transform: 'translate(-50%, -50%) rotate(-12deg)',
          borderRadius: '50%',
          border: '2px dashed rgba(255,255,255,0.1)',
          opacity: 0.24,
        }}
      />

      {showDeckAccents && (
        <div
          style={{
            position: 'absolute',
            left: '8%',
            top: '30%',
            width: 280,
            height: 280,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 30% 24%, rgba(155,225,255,0.95), rgba(72,144,226,0.88) 44%, rgba(20,40,97,0.96) 80%)',
            opacity: 0.42,
            boxShadow: '0 0 80px rgba(107,181,255,0.14)',
          }}
        />
      )}

      {showDeckAccents && (
        <div
          style={{
            position: 'absolute',
            right: '5%',
            top: '24%',
            width: 390,
            height: 390,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 30% 30%, rgba(220,205,164,0.95), rgba(145,123,96,0.86) 44%, rgba(51,43,37,0.95) 80%)',
            opacity: 0.28,
            boxShadow: '0 0 100px rgba(192,156,114,0.08)',
          }}
        />
      )}

      {cometSet.map((comet) => (
        <div
          key={comet.id}
          className="codex-comet"
          style={{
            '--comet-angle': `${comet.angle}deg`,
            position: 'absolute',
            left: '-20vw',
            top: comet.top,
            width: isAuth ? Math.round(comet.size * 0.72) : comet.size,
            height: 3,
            borderRadius: 999,
            background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(170,228,255,0.9) 38%, rgba(255,255,255,1))',
            boxShadow: '0 0 16px rgba(157,223,255,0.4)',
            filter: 'blur(0.2px)',
            transform: `rotate(${comet.angle}deg)`,
            animation: `codex-comet-travel ${isAuth ? "16s" : comet.duration} linear ${comet.delay} infinite`,
            opacity: 0,
          }}
        >
          <span
            style={{
              position: 'absolute',
              right: -4,
              top: '50%',
              width: 8,
              height: 8,
              borderRadius: '50%',
              transform: 'translateY(-50%)',
              background: 'radial-gradient(circle, rgba(255,255,255,1), rgba(138,216,255,0.9) 68%, rgba(138,216,255,0) 100%)',
              boxShadow: '0 0 24px rgba(158,222,255,0.7)',
            }}
          />
        </div>
      ))}

      {asteroidSet.map((asteroid) => (
        <div
          key={asteroid.id}
          className="codex-asteroid"
          style={{
            '--asteroid-drift': `${asteroid.drift}vw`,
            position: 'absolute',
            left: '-8vw',
            top: asteroid.top,
            width: isAuth ? Math.round(asteroid.size * 0.7) : asteroid.size,
            height: isAuth ? Math.round(asteroid.size * 0.7) : asteroid.size,
            borderRadius: '45% 58% 52% 40%',
            background: 'radial-gradient(circle at 34% 30%, rgba(221,193,148,0.95), rgba(118,95,74,0.95) 56%, rgba(55,43,31,0.98) 100%)',
            boxShadow: '0 0 18px rgba(177,145,105,0.1)',
            animation: `codex-asteroid-drift ${isAuth ? "34s" : asteroid.duration} linear ${asteroid.delay} infinite`,
            opacity: 0,
          }}
        />
      ))}

      {Array.from({ length: 72 }).map((_, index) => {
        const x = (index * 31) % 100
        const y = (index * 17) % 100
        const size = index % 6 === 0 ? 3 : index % 3 === 0 ? 2 : 1.5
        const opacity = 0.18 + (index % 5) * 0.08
        const duration = 2.8 + (index % 4) * 1.2
        const delay = (index % 7) * 0.6
        const driftDuration = 18 + (index % 5) * 5

        return (
          <span
            key={index}
            className="codex-star"
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              borderRadius: '50%',
              background: '#ffffff',
              opacity,
              boxShadow: '0 0 14px rgba(255,255,255,0.36)',
              animation: `codex-star-pulse ${duration}s ease-in-out ${delay}s infinite, codex-star-drift ${driftDuration}s ease-in-out ${delay}s infinite`,
            }}
          />
        )
      })}
    </div>
  )
}
