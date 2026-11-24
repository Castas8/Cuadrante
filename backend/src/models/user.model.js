"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Cuántas veces se "revuelve" la contraseña al cifrarla. 10 es el estándar.
const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 80
        },
        email: {
            type: String,
            required: true,
            unique: true, // MongoDB no deja guardar dos usuarios con el mismo correo
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            select: false // nunca se regresa en las consultas, a menos que se pida
        }
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            transform(doc, ret) {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.password;
                return ret;
            }
        }
    }
);

// Antes de guardar: si la contraseña cambió, se cifra con bcrypt.
// Así en MongoDB solo queda el hash, nunca el texto plano.
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

// Compara la contraseña que escribió el usuario con el hash guardado
userSchema.methods.comparePassword = function (plainPassword) {
    return bcrypt.compare(plainPassword, this.password);
};

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
