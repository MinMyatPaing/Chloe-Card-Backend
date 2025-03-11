/**
 * throw response error
 * @param {number} status - error status
 * @param {string} message - error message
 * @throws {Error} response error directed to next()
 */
export const throwError = (status, message) => {
    const error = new Error(message);
    error.status = status;
    throw error;
}