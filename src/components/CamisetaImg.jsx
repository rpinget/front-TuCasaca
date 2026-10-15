import './CamisetaImg.css'

// colores de cada equipo para dibujar la camiseta cuando no hay foto real
const ESTILOS = {
  'Boca Juniors': { tipo: 'banda', base: '#0b2f73', alt: '#f4c400', texto: '#f4c400' },
  'River Plate': { tipo: 'diagonal', base: '#ffffff', alt: '#d6001c', texto: '#111111' },
  'San Lorenzo': { tipo: 'rayas', base: '#0a2f6b', alt: '#c1121f', texto: '#ffffff' },
  'Real Madrid': { tipo: 'liso', base: '#ffffff', alt: '#d4af37', texto: '#1b2a6b' },
  'FC Barcelona': { tipo: 'rayas', base: '#a50044', alt: '#004d98', texto: '#edbb00' },
  Liverpool: { tipo: 'liso', base: '#c8102e', alt: '#ffffff', texto: '#ffffff' },
}
const POR_DEFECTO = { tipo: 'liso', base: '#23262d', alt: '#ffffff', texto: '#ffffff' }

const FORMA =
  'M70 20 L40 32 L12 70 L36 88 L52 74 L52 180 L148 180 L148 74 L164 88 L188 70 L160 32 L130 20 C124 34 112 40 100 40 C88 40 76 34 70 20 Z'

const CamisetaImg = ({ casaca, className = '' }) => {
  const alt = `Camiseta ${casaca.equipo.nombre} ${casaca.anio}`

  // si la casaca tiene una foto real se usa; si es el relleno, se dibuja la camiseta
  const hayFoto = casaca.imagenUrl && !casaca.imagenUrl.includes('placehold.co')
  if (hayFoto) {
    return (
      <div className={`camiseta ${className}`}>
        <img src={casaca.imagenUrl} alt={alt} className="camiseta__foto" />
      </div>
    )
  }

  const e = ESTILOS[casaca.equipo.nombre] ?? POR_DEFECTO
  const idClip = `forma-${casaca.id}`

  return (
    <div className={`camiseta ${className}`}>
      <svg viewBox="0 0 200 200" role="img" aria-label={alt} className="camiseta__svg">
        <defs>
          <clipPath id={idClip}><path d={FORMA} /></clipPath>
        </defs>
        <g clipPath={`url(#${idClip})`}>
          <rect width="200" height="200" fill={e.base} />
          {e.tipo === 'rayas' &&
            [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <rect key={i} x={12 + i * 22} y="0" width="11" height="200" fill={i % 2 ? e.alt : e.base} />
            ))}
          {e.tipo === 'banda' && <rect x="0" y="92" width="200" height="34" fill={e.alt} />}
          {e.tipo === 'diagonal' && <polygon points="30,30 72,30 182,172 140,172" fill={e.alt} />}
        </g>
        <path d={FORMA} fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth="2" />
        <path d="M70 20 C76 36 88 44 100 44 C112 44 124 36 130 20" fill="none" stroke={e.alt === '#ffffff' ? e.texto : e.alt} strokeWidth="5" />
        <text x="100" y="140" textAnchor="middle" fontSize="54" fontWeight="800"
          fontFamily="Bricolage Grotesque, sans-serif" fill={e.texto}
          stroke={e.base} strokeWidth="7" paintOrder="stroke">
          {casaca.numero}
        </text>
      </svg>
    </div>
  )
}

export default CamisetaImg
