// Logo de Cuadrante: un mapa dividido en 4 cuadrantes con un punto de entrega
export default function Logo({ size = 28 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
            <rect x="2" y="2" width="13" height="13" rx="3" fill="var(--brand)" />
            <rect x="17" y="2" width="13" height="13" rx="3" fill="var(--brand)" opacity="0.55" />
            <rect x="2" y="17" width="13" height="13" rx="3" fill="var(--brand)" opacity="0.55" />
            <rect x="17" y="17" width="13" height="13" rx="3" fill="var(--brand)" opacity="0.25" />
            <circle cx="16" cy="16" r="4.2" fill="var(--accent)" stroke="var(--surface)" strokeWidth="2" />
        </svg>
    );
}
