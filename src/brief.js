import { answered, cleanAnswers, visibleQuestions } from './flow.js';
import { TYPES } from './questions.js';

const GROUPS = [
  { title: 'Purpose', ids: ['idea', 'outcome'] },
  { title: 'People', ids: ['audience'] },
  { title: 'Project shape', ids: ['type', 'deliverable', 'essentials'] },
  { title: 'Practical details', ids: ['timing', 'budget', 'constraints'] },
  { title: 'Success and context', ids: ['success', 'notes'] },
];

const LABELS = {
  idea: 'Starting idea', audience: 'Intended audience', outcome: 'Desired change',
  type: 'Project type', deliverable: 'What it should include', essentials: 'Must-haves',
  timing: 'Timing', budget: 'Budget', constraints: 'Constraints and dependencies',
  success: 'Signs of success', notes: 'Other context',
};

export function makeBrief(input = {}) {
  const answers = cleanAnswers(input);
  const questions = visibleQuestions(answers);
  const sections = GROUPS.map(({ title, ids }) => ({
    title,
    entries: ids.filter((id) => answered(answers[id])).map((id) => ({
      id,
      label: LABELS[id],
      value: id === 'type' ? TYPES.find(({ value }) => value === answers[id])?.label ?? answers[id] : answers[id].trim(),
    })),
  })).filter(({ entries }) => entries.length);
  const open = questions.filter(({ id }) => !answered(answers[id])).map(({ id, title }) => ({ id, title }));
  return { sections, open };
}

function escapeMarkdown(value) {
  return value.replace(/([\\`*_{}\[\]()#+.!|>~-])/g, '\\$1').replace(/\r\n?/g, '\n').replace(/\n/g, '  \n');
}

export function toMarkdown(brief) {
  const lines = ['# Project brief', ''];
  for (const section of brief.sections) {
    lines.push(`## ${section.title}`, '');
    for (const entry of section.entries) {
      lines.push(`**${entry.label}:** ${escapeMarkdown(entry.value)}`, '');
    }
  }
  if (brief.open.length) {
    lines.push('## Open questions', '');
    for (const question of brief.open) lines.push(`- ${question.title}`);
    lines.push('');
  }
  return lines.join('\n').trimEnd() + '\n';
}