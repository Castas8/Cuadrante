// Búsqueda y filtros. No filtra aquí: manda los valores al backend (?search=&category=&status=&zone=).
import { DELIVERY_STATUSES } from "../../utils/labels";

export default function FiltersBar({ filters, onChange, categories, zones }) {
    const update = (field) => (event) => onChange({ ...filters, [field]: event.target.value });
    const hasFilters = filters.search || filters.category !== "all" || filters.status !== "all" || filters.zone !== "all";

    return (
        <div className="filters">
            <label className="filters__search">
                <span className="sr-only">Buscar por nombre</span>
                <input
                    type="search"
                    placeholder="Buscar por nombre o descripción…"
                    value={filters.search}
                    onChange={update("search")}
                />
            </label>

            <select value={filters.category} onChange={update("category")} aria-label="Filtrar por categoría">
                <option value="all">Todas las categorías</option>
                {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                ))}
            </select>

            <select value={filters.status} onChange={update("status")} aria-label="Filtrar por estado">
                <option value="all">Todos los estados</option>
                {DELIVERY_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                ))}
            </select>

            <select value={filters.zone} onChange={update("zone")} aria-label="Filtrar por zona">
                <option value="all">Todas las zonas</option>
                {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
                <option value="none">Sin zona</option>
            </select>

            {hasFilters && (
                <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => onChange({ search: "", category: "all", status: "all", zone: "all" })}
                >
                    Limpiar
                </button>
            )}
        </div>
    );
}
