"use strict";

// Opciones comunes de los schemas:
// - timestamps: MongoDB agrega createdAt y updatedAt solo
// - toJSON: al responder, _id se convierte en id y se quita __v
const baseSchemaOptions = {
    timestamps: true,
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform(doc, ret) {
            ret.id = ret._id.toString();
            delete ret._id;
            return ret;
        }
    }
};

module.exports = { baseSchemaOptions };
