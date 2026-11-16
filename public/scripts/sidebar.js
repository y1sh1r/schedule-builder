import { DAYS, validSlot } from './catalog.js';
import { loadEvents, saveEvents } from './calendar.js';

export function renderCourses(courses) {
    const list = document.querySelector('.sidebar-list');
    list.replaceChildren();
    if (!courses.length) {
        list.textContent = 'Keine passenden Kurse gefunden.';
        return;
    }
    courses.forEach(course => {
        const card = document.createElement('div');
        card.className = 'course-card';
        const title = document.createElement('h3');
        title.className = 'course-title';
        title.textContent = course.name;
        card.appendChild(title);
        if (course.beschreibung) {
            const description = document.createElement('p');
            description.textContent = course.beschreibung;
            card.appendChild(description);
        }
        // Position im Originalkurs merken: sie bleibt auch bei Suche und übersprungenen Slots stabil.
        (course.termine || [])
            .map((slot, slotIndex) => ({ slot, slotIndex }))
            .filter(({ slot }) => validSlot(slot))
            .forEach(({ slot, slotIndex }) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'btn-sm btn-sm-outline catalog-slot';
                button.textContent = `${slot.tag}, ${slot.start} – ${slot.ende === '00:00' ? '24:00' : slot.ende}${slot.ort ? ' · ' + slot.ort : ''}`;
                button.addEventListener('click', () => {
                    // Der Schlüssel erkennt bereits übernommene Slots; id und Name vermeiden Kollisionen.
                    const catalogKey = [String(course.id ?? '').trim(), course.name, slot.tag, slot.start, slot.ende, slotIndex].join('|');
                    const events = loadEvents();
                    if (events.some(event => event.catalogKey === catalogKey)) return;
                    events.push({
                        id: `catalog_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                        catalogKey,
                        title: course.name, typ: 'custom', isCustom: true,
                        roomOrDesc: slot.ort || course.beschreibung || '',
                        startTime: slot.start, endTime: slot.ende,
                        days: [DAYS.indexOf(slot.tag) + 2], cssClass: 'event-custom-blue',
                    });
                    if (!saveEvents(events)) {
                        alert('Der Termin konnte nicht gespeichert werden (Browser-Speicher voll oder gesperrt).');
                        return;
                    }
                    document.dispatchEvent(new CustomEvent('re-render-events'));
                });
                card.appendChild(button);
            });
        list.appendChild(card);
    });
}
