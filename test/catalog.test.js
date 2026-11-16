import test from 'node:test';
import assert from 'node:assert/strict';
import { CatalogError, parseCatalog, validSlot } from '../public/scripts/catalog.js';

const slot = { tag: 'Montag', start: '10:00', ende: '11:30' };
const catalog = (...kurse) => JSON.stringify({ kurse });
const course = (id, name = 'Mathe') => ({ id, name, termine: [slot] });

test('validSlot: Wochentage, Uhrzeiten und Tagesende', () => {
    assert.equal(validSlot(slot), true);
    assert.equal(validSlot({ ...slot, ende: '00:00' }), true);
    assert.equal(validSlot({ ...slot, ende: '09:00' }), false);
    assert.equal(validSlot({ ...slot, start: '10:60' }), false);
    assert.equal(validSlot({ ...slot, tag: 'Monday' }), false);
    assert.equal(validSlot({ tag: 'Montag', start: '00:00', ende: '00:00' }), false);
    assert.equal(validSlot(null), false);
});

test('parseCatalog verlangt nicht leere, eindeutige ids beim Import', () => {
    assert.equal(parseCatalog(catalog(course('a'), course('b', 'Physik'))).length, 2);
    assert.throws(() => parseCatalog(catalog(course(''))), CatalogError);
    assert.throws(() => parseCatalog(catalog({ name: 'X', termine: [slot] })), CatalogError);
    assert.throws(() => parseCatalog(catalog(course('a'), course(' a ', 'Physik'))), CatalogError);
});

test('parseCatalog liest ältere gespeicherte Kataloge ohne ids, wenn requireIds false ist', () => {
    assert.equal(parseCatalog(catalog(course('')), { requireIds: false }).length, 1);
});

test('parseCatalog lehnt ungültige Inhalte ab', () => {
    assert.throws(() => parseCatalog('{kaputt'), SyntaxError);
    assert.throws(() => parseCatalog('null'), CatalogError);
    assert.throws(() => parseCatalog(catalog({ id: 'a', name: 'X', termine: [] })), CatalogError);
    assert.equal(parseCatalog('\uFEFF' + catalog(course('a'))).length, 1);
});
