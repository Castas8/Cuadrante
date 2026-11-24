// Muestra el mensaje de error del backend y, si vienen, sus detalles.
export default function ErrorBox({ error }) {
    if (!error) {
        return null;
    }

    return (
        <div className="error-box" role="alert">
            <strong>{error.message}</strong>
            {Array.isArray(error.details) && error.details.length > 0 && (
                <ul>
                    {error.details.map((detail) => <li key={detail}>{detail}</li>)}
                </ul>
            )}
        </div>
    );
}
