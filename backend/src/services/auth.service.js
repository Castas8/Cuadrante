"use strict";

const AppError = require("../utils/appError");
const { signToken } = require("../utils/token");
const UserModel = require("../models/user.model");

class AuthService {
    async register(data) {
        const email = data.email.trim().toLowerCase();

        // No se permiten correos duplicados
        const exists = await UserModel.exists({ email });

        if (exists) {
            throw new AppError(400, "Ya existe una cuenta con ese correo.");
        }

        // El modelo cifra la contraseña antes de guardar (pre save)
        const user = await UserModel.create({
            name: data.name.trim(),
            email,
            password: data.password
        });

        return { user, token: signToken(user) };
    }

    async login(data) {
        const email = data.email.trim().toLowerCase();

        // select("+password") trae el hash, que normalmente está oculto
        const user = await UserModel.findOne({ email }).select("+password");

        // Mismo mensaje si no existe el correo o si la contraseña está mal:
        // así no se revela qué correos están registrados
        if (!user || !(await user.comparePassword(data.password))) {
            throw new AppError(401, "Correo o contraseña incorrectos.");
        }

        return { user, token: signToken(user) };
    }

    async getById(id) {
        const user = await UserModel.findById(id);

        if (!user) {
            throw new AppError(401, "La sesión ya no es válida. Inicia sesión de nuevo.");
        }

        return user;
    }
}

module.exports = AuthService;
