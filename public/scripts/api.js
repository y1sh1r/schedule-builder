/**
 * Zentrale Datenzugriffsschicht für Kursdaten vom Server.
 */

/**
 * Lädt alle Kurse vom Backend.
 * @returns {Promise<Array>} Kursliste oder leeres Array bei Fehler (UI bleibt nutzbar).
 */
export async function loadCourses() {
    try {
        const response = await fetch('/api/kurse');
        if (!response.ok) {
            throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        }
        const courses = await response.json();
        return Array.isArray(courses) ? courses.filter(course => course && typeof course.name === 'string' && Array.isArray(course.termine)) : [];
    } catch (error) {
        console.error('Fehler beim Laden der Kurse:', error);
        return [];
    }
}
