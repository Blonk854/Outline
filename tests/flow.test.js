import test from 'node:test';
import assert from 'node:assert/strict';
import { answered, cleanAnswers, visibleQuestions } from '../src/flow.js';
import { UNKNOWN } from '../src/questions.js';

test('starts broad, then adapts the deliverable question to the project type', () => {
  const questions = visibleQuestions();
  assert.deepEqual(questions.slice(0, 3).map(({ id }) => id), ['idea', 'audience', 'outcome']);
  assert.match(questions.find(({ id }) => id === 'deliverable').title, /finished project/);
  assert.match(visibleQuestions({ type: 'event' }).find(({ id }) => id === 'deliverable').title, /event/);
  assert.match(visibleQuestions({ type: 'digital' }).find(({ id }) => id === 'deliverable').title, /able to do/);
  assert.match(visibleQuestions({ type: 'service' }).find(({ id }) => id === 'deliverable').title, /service/);
  assert.match(visibleQuestions({ type: 'physical' }).find(({ id }) => id === 'deliverable').title, /create or change/);
  assert.equal(visibleQuestions({ type: 'other' }).length, 11);
});

test('unknown and blank answers are not mistaken for defined requirements', () => {
  assert.equal(answered(UNKNOWN), false);
  assert.equal(answered('   '), false);
  assert.equal(answered('an event'), true);
});

test('draft input ignores unexpected keys and values', () => {
  assert.deepEqual(cleanAnswers({ idea: 'A project', type: 'event', malicious: 'ignored', budget: 100 }), { idea: 'A project', type: 'event' });
});