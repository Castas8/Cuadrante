"use strict";

// Escapa caracteres especiales para que no rompan la expresión regular
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Quita acentos: "Jerónimo" -> "Jeronimo"
function removeAccents(value) {
    return value.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Regex que ignora mayúsculas y acentos:
// "martha" encuentra "Martha" y "jeronimo" encuentra "Jerónimo"
function buildSearchRegex(text) {
    const accentGroups = {
        a: "[aáàäâ]",
        e: "[eéèëê]",
        i: "[iíìïî]",
        o: "[oóòöô]",
        u: "[uúùüû]",
        n: "[nñ]"
    };

    const pattern = escapeRegex(removeAccents(text.trim().toLowerCase()))
        .split("")
        .map((char) => accentGroups[char] || char)
        .join("");

    return new RegExp(pattern, "i");
}

module.exports = { escapeRegex, buildSearchRegex };
