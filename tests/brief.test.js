import test from 'node:test';
import assert from 'node:assert/strict';
import { makeBrief, toMarkdown } from '../src/brief.js';
import { UNKNOWN } from '../src/questions.js';

test('early completion labels gaps as open questions without inventing detail', () => {
  const brief = makeBrief({ idea: 'A way to bring people together' });
  assert.equal(brief.sections.length, 1);
  assert.equal(brief.sections[0].entries[0].value, 'A way to bring people together');
  assert.equal(brief.open.length, 10);
  assert.match(toMarkdown(brief), /## Open questions/);
});

test('edited project type changes the open follow-up prompt', () => {
  const answers = { idea: 'Get neighbors together', type: 'event', budget: UNKNOWN };
  assert.match(makeBrief(answers).open.find(({ id }) => id === 'deliverable').title, /event/);
  answers.type = 'digital';
  assert.match(makeBrief(answers).open.find(({ id }) => id === 'deliverable').title, /able to do/);
  assert.ok(makeBrief(answers).open.some(({ id }) => id === 'budget'));
});

test('Markdown export cannot turn customer text into headings, links or lists', () => {
  const markdown = toMarkdown(makeBrief({ idea: '# Big idea\n[link](https://example.com)\n- task', type: 'other' }));
  assert.match(markdown, /\\# Big idea/);
  assert.match(markdown, /\\\[link\\\]\\\(https:\/\/example\\\.com\\\)/);
  assert.match(markdown, /\\- task/);
  assert.match(markdown, /Something else/);
});