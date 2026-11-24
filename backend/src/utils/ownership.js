"use strict";

const mongoose = require("mongoose");

const AppError = require("./appError");

// Revisa que un id que manda el usuario (por ejemplo, la categoría de una entrega)
// exista y pertenezca a su cuenta. Así nadie puede ligar datos de otra cuenta.
async function assertOwned(Model, id, owner, label) {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError(400, `El id de ${label} no es válido.`);
    }

    const exists = await Model.exists({ _id: id, owner });

    if (!exists) {
        throw new AppError(400, `No existe ${label} con id ${id} en tu cuenta.`);
    }
}

module.exports = { assertOwned };
