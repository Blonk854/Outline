import { DELIVERY, QUESTIONS, UNKNOWN } from './questions.js';

export function visibleQuestions(answers = {}) {
  return QUESTIONS.map((question) => question.id === 'deliverable'
    ? { ...question, ...DELIVERY[answers.type] ?? DELIVERY[UNKNOWN] }
    : question);
}

export function answered(value) {
  return typeof value === 'string' && value.trim() !== '' && value.trim() !== UNKNOWN;
}

export function cleanAnswers(answers = {}) {
  const result = {};
  for (const question of QUESTIONS) {
    const value = answers[question.id];
    if (typeof value === 'string') result[question.id] = value.slice(0, 4000);
  }
  return result;
}