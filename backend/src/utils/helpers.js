// backend/src/utils/helpers.js

/**
 * Genera un código alfanumérico aleatorio.
 * @param {number} length - La longitud del código a generar.
 * @returns {string} El código aleatorio.
 */
exports.generateRandomCode = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};
