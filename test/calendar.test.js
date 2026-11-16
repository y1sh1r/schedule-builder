import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../public/scripts/calendar.js', import.meta.url), 'utf8').replaceAll('export ', '');

test('Zeitgrenzen: Mitternacht, frühe Termine und exakte Endzeiten', () => {
    const context = vm.createContext({});
    vm.runInContext(source, context);
    for (const [expression, expected] of [
        ['timeToRow("00:00")', 2],
        ['timeToRow("06:00")', 26],
        ['timeToRowEnd("06:15")', 27],
        ['timeToRowEnd("00:00")', 98],
        ['timeToRow("22:30")', 92],
        ['timeToRowEnd("23:30")', 96],
        ['eventDurationMinutes({startTime:"23:00",endTime:"00:00"})', 60],
    ]) assert.equal(vm.runInContext(expression, context), expected);
});

test('Wochenendtermine werden dargestellt und Titel sicher ausgegeben', () => {
    const blocks = [];
    const context = vm.createContext({
        localStorage: { getItem: () => JSON.stringify([
            {id:1,title:'<img src=x>',isCustom:true,days:[7,8],startTime:'06:00',endTime:'06:15'}
        ]) },
        document: {
            querySelector: () => ({appendChild: block => blocks.push(block)}),
            querySelectorAll: () => [],
            createElement: () => ({style:{},addEventListener(){}}),
        },
    });
    vm.runInContext(source + '\nrenderEvents();', context);
    assert.equal(blocks.length, 2);
    assert.equal(blocks[0].style.gridArea, '26 / 7 / 27 / 8');
    assert.equal(blocks[1].style.gridArea, '26 / 8 / 27 / 9');
    assert.ok(blocks.every(b => b.innerHTML.includes('&lt;img src=x&gt;')));
});

function renderWith(stored) {
    const blocks = [];
    const context = vm.createContext({
        localStorage: { getItem: () => stored },
        document: {
            querySelector: () => ({ appendChild: block => blocks.push(block) }),
            querySelectorAll: () => [],
            createElement: () => ({ style: {}, addEventListener() {} }),
        },
    });
    vm.runInContext(source + '\nrenderEvents();', context);
    return blocks;
}

test('Defekte oder unvollständige Daten im localStorage brechen die Darstellung nicht', () => {
    assert.equal(renderWith('{kaputt').length, 0);
    assert.equal(renderWith('{"a":1}').length, 0);
    assert.equal(renderWith(null).length, 0);
    const mixed = JSON.stringify([
        { id: 1, title: 'ohne Tage', startTime: '08:00', endTime: '09:00' },
        { id: 2, title: 'ok', days: [2], startTime: '08:00', endTime: '09:00' },
    ]);
    assert.equal(renderWith(mixed).length, 1);
});

test('Überlappende Termine werden nebeneinander dargestellt', () => {
    const blocks = renderWith(JSON.stringify([
        { id: 1, title: 'A', days: [2], startTime: '08:00', endTime: '10:00' },
        { id: 2, title: 'B', days: [2], startTime: '09:00', endTime: '11:00' },
    ]));
    assert.equal(blocks.length, 2);
    assert.equal(blocks[0].style.width, 'calc(50% - 8px)');
    assert.notEqual(blocks[0].style.marginLeft, blocks[1].style.marginLeft);
});

test('Zeiten und Typ werden im HTML escaped', () => {
    const blocks = renderWith(JSON.stringify([
        { id: 1, title: 't', typ: '<b>x</b>', days: [2], startTime: '08:00', endTime: '12:00' },
    ]));
    assert.ok(!blocks[0].innerHTML.includes('<b>x</b>'));
});

test('saveEvents meldet Speicherfehler, statt zu werfen', () => {
    const context = vm.createContext({
        localStorage: { setItem() { throw new Error('QuotaExceededError'); } },
    });
    vm.runInContext(source, context);
    assert.equal(vm.runInContext('saveEvents([])', context), false);
    const ok = vm.createContext({ localStorage: { setItem() {} } });
    vm.runInContext(source, ok);
    assert.equal(vm.runInContext('saveEvents([])', ok), true);
});
