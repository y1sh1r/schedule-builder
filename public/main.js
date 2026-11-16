import { loadCourses } from './scripts/api.js';
import { renderCourses } from './scripts/sidebar.js';
import { setupCalendarModal, renderEvents } from './scripts/calendar.js';
import { initExport } from './scripts/export.js';
import { initCourseImport } from './scripts/course-import.js';

document.addEventListener('DOMContentLoaded', () => {
    setupCalendarModal();
    renderEvents();
    initExport();
    initCourseImport(loadCourses, renderCourses);
});
