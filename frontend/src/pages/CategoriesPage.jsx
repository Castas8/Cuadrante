// Vista de categorías: CRUD completo con búsqueda.
import { useCallback, useEffect, useState } from "react";

import Modal from "../components/Modal";
import ConfirmDelete from "../components/ConfirmDelete";
import CategoryForm from "../components/forms/CategoryForm";
import { categoriesApi } from "../api/endpoints";
import { useToast } from "../context/ToastContext";

export default function CategoriesPage() {
    const notify = useToast();
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState(null);

    const load = useCallback(async () => {
        const response = await categoriesApi.list({ search });
        setCategories(response.data);
    }, [search]);

    useEffect(() => { load().catch((e) => notify(e.message, "error")); }, [load, notify]);

    const save = async (form) => {
        if (modal.id) {
            await categoriesApi.update(modal.id, form);
            notify("Categoría actualizada");
        } else {
            await categoriesApi.create(form);
            notify("Categoría creada");
        }
        setModal(null);
        await load();
    };

    const remove = async (category) => {
        try {
            await categoriesApi.remove(category.id);
            notify(`Categoría "${category.name}" eliminada`);
            await load();
        } catch (error) {
            // Por ejemplo: la categoría la usan entregas
            notify(error.message, "error");
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Categorías</h1>
                    <p className="muted">Lo que repartes. El color de cada categoría es el color de sus puntos en el mapa.</p>
                </div>
                <button type="button" className="btn btn--primary" onClick={() => setModal({})}>+ Nueva categoría</button>
            </div>

            <section className="card">
                <div className="filters filters--compact">
                    <input type="search" placeholder="Buscar categoría…" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>

                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr><th>Color</th><th>Nombre</th><th>Descripción</th><th>Creada</th><th /></tr>
                        </thead>
                        <tbody>
                            {categories.length === 0 && <tr><td colSpan={5} className="table__empty">Sin resultados.</td></tr>}
                            {categories.map((category) => (
                                <tr key={category.id}>
                                    <td><i className="dot dot--lg" style={{ background: category.color }} /></td>
                                    <td className="strong">{category.name}</td>
                                    <td>{category.description || <span className="muted">—</span>}</td>
                                    <td className="muted">{new Date(category.createdAt).toLocaleDateString("es-MX")}</td>
                                    <td className="table__actions">
                                        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setModal(category)}>Editar</button>
                                        <ConfirmDelete onConfirm={() => remove(category)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {modal && (
                <Modal title={modal.id ? "Editar categoría" : "Nueva categoría"} onClose={() => setModal(null)}>
                    <CategoryForm initial={modal.id ? modal : null} onSubmit={save} onCancel={() => setModal(null)} />
                </Modal>
            )}
        </div>
    );
}
