// Marco compartido de login y registro: panel de marca + formulario.
import Logo from "../components/Logo";

export default function AuthLayout({ title, subtitle, children }) {
    return (
        <div className="auth">
            <aside className="auth__hero">
                <div className="auth__brand">
                    <Logo size={40} />
                    <span>Cuadrante</span>
                </div>
                <h1>Cada pedido en su zona, cada zona con su repartidor.</h1>
                <p>
                    Dibuja tus zonas de reparto, asigna un repartidor a cada una y registra
                    entregas con un clic: Cuadrante detecta en qué zona cae cada pedido.
                </p>
                <div className="auth__grid" aria-hidden="true">
                    <span /><span /><span /><span />
                </div>
            </aside>

            <section className="auth__panel">
                <div className="auth__card">
                    <h2>{title}</h2>
                    <p className="muted">{subtitle}</p>
                    {children}
                </div>
            </section>
        </div>
    );
}
