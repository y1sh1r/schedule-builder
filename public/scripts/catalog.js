/**
 * Validierung des Kurskatalogs (reine Logik, ohne DOM-Zugriff).
 */

export const DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

const TIME = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

/** Fehler mit einer Meldung, die direkt dem Nutzer angezeigt werden darf. */
export class CatalogError extends Error {}

/**
 * Ein Termin ist gültig, wenn Wochentag und Uhrzeiten stimmen und die Endzeit nach dem Start liegt.
 * "00:00" als Ende bedeutet Tagesende, 00:00–00:00 ist aber kein sinnvoller Termin.
 */
export function validSlot(slot) {
    return Boolean(slot) && DAYS.includes(slot.tag) && TIME.test(slot.start) && TIME.test(slot.ende) &&
        (slot.ende === '00:00' ? slot.start !== '00:00' : slot.ende > slot.start);
}

/**
 * Liest einen Kurskatalog aus JSON-Text.
 * @param {string} text JSON-Inhalt
 * @param {{requireIds?: boolean}} options requireIds: jede id muss vorhanden und eindeutig sein
 *        (für neue Importe; bereits gespeicherte ältere Kataloge werden toleranter gelesen).
 */
export function parseCatalog(text, { requireIds = true } = {}) {
    const { kurse } = JSON.parse(text.replace(/^\uFEFF/, '')) ?? {};
    if (!Array.isArray(kurse) || !kurse.length || !kurse.every(course =>
        typeof course?.name === 'string' && course.name.trim() &&
        Array.isArray(course.termine) && course.termine.length &&
        course.termine.every(validSlot)
    )) {
        throw new CatalogError('Prüfe die Kursnamen, Wochentage und Uhrzeiten in der JSON-Datei.');
    }
    if (requireIds) {
        const ids = kurse.map(course => (typeof course.id === 'string' ? course.id.trim() : ''));
        if (ids.some(id => !id)) {
            throw new CatalogError('Jeder Kurs braucht eine nicht leere id.');
        }
        if (new Set(ids).size !== ids.length) {
            throw new CatalogError('Die id jedes Kurses muss eindeutig sein.');
        }
    }
    return kurse;
}
