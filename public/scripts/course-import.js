import { CatalogError, parseCatalog } from './catalog.js';

const STORAGE_KEY = 'importedCourses';

export async function initCourseImport(loadCourses, renderCourses) {
    const button = document.getElementById('btn-import-courses');
    const input = document.getElementById('course-file');
    const status = document.getElementById('course-import-status');
    const sidebar = document.querySelector('.sidebar');
    const search = document.querySelector('.sidebar-filter input');
    let courses;

    function refresh() {
        sidebar.hidden = !courses?.length;
        if (sidebar.hidden) return;
        const query = search.value.trim().toLocaleLowerCase('de');
        renderCourses(courses.filter(course => course.name.toLocaleLowerCase('de').includes(query)));
    }

    search.addEventListener('input', refresh);
    button.addEventListener('click', () => input.click());
    input.addEventListener('change', async () => {
        const file = input.files[0];
        if (!file) return;
        button.disabled = true;
        status.hidden = false;
        try {
            const imported = parseCatalog(await file.text());
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ kurse: imported }));
            courses = imported;
            search.value = '';
            refresh();
            status.textContent = imported.length === 1 ? 'Ein Kurs importiert.' : `${imported.length} Kurse importiert.`;
        } catch (error) {
            if (error instanceof CatalogError) {
                status.textContent = `Import fehlgeschlagen. ${error.message}`;
            } else if (error instanceof SyntaxError) {
                status.textContent = 'Import fehlgeschlagen. Die Datei enthält kein gültiges JSON.';
            } else if (error instanceof DOMException) {
                status.textContent = 'Die Kursdatei konnte nicht gelesen oder gespeichert werden.';
            } else {
                status.textContent = 'Import fehlgeschlagen. Prüfe die Kursdatei.';
            }
        } finally {
            button.disabled = false;
            input.value = '';
        }
    });

    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) courses = parseCatalog(saved, { requireIds: false });
    } catch {
        // Bei ungültigen gespeicherten Daten den Projektkatalog verwenden.
    }
    if (!courses) {
        const defaults = await loadCourses();
        courses ??= defaults;
    }
    refresh();
}
