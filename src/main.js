import './style.css';
import logoUrl from '../logo/bss_green_primo.svg';
import { answered, cleanAnswers, visibleQuestions } from './flow.js';
import { makeBrief, toMarkdown } from './brief.js';
import { UNKNOWN } from './questions.js';

const STORAGE_KEY = 'outline-project-draft-v1';
const app = document.querySelector('#app');
let answers = {};
let step = 0;
let reviewing = false;
let status = '';

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  answers = cleanAnswers(saved.answers);
  if (Number.isInteger(saved.step)) step = Math.max(0, Math.min(visibleQuestions().length - 1, saved.step));
  reviewing = saved.reviewing === true && answered(answers.idea);
} catch { /* Storage is optional in restricted browser modes. */ }

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, step, reviewing })); }
  catch { /* The form remains usable when storage is unavailable. */ }
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(label, className, action) {
  const node = element('button', className, label);
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
}

function moveTo(index) {
  step = index;
  reviewing = false;
  status = '';
  save();
  render();
  window.scrollTo(0, 0);
}

function finish() {
  if (!answered(answers.idea)) {
    step = 0;
    reviewing = false;
    status = 'Add a starting idea before creating a brief.';
    render();
    return;
  }
  reviewing = true;
  status = '';
  save();
  render();
  window.scrollTo(0, 0);
}

function renderQuestion(main) {
  const questions = visibleQuestions(answers);
  const question = questions[step];
  const intro = element('div', 'question-intro');
  intro.append(element('p', 'eyebrow', `Question ${String(step + 1).padStart(2, '0')} / ${questions.length}  ·  ${question.stage}`));
  const heading = element('h1', '', question.title);
  heading.id = 'page-heading';
  intro.append(heading, element('p', 'hint', question.hint));
  main.append(intro);

  const field = element('div', 'field');
  if (question.options) {
    const group = element('div', 'option-grid');
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', question.title);
    for (const option of question.options) {
      const choice = button('', 'option', () => {
        answers[question.id] = option.value;
        group.querySelectorAll('.option').forEach((node) => {
          node.classList.toggle('selected', node === choice);
          node.setAttribute('aria-pressed', String(node === choice));
        });
        save();
      });
      choice.setAttribute('aria-pressed', String(answers[question.id] === option.value));
      choice.classList.toggle('selected', answers[question.id] === option.value);
      choice.append(element('span', 'option-title', option.label), element('span', 'option-detail', option.detail));
      group.append(choice);
    }
    field.append(group);
  } else {
    const input = document.createElement('textarea');
    input.id = 'answer';
    input.rows = 5;
    input.maxLength = 4000;
    input.placeholder = question.placeholder;
    input.value = answers[question.id] === UNKNOWN ? '' : answers[question.id] ?? '';
    input.setAttribute('aria-label', question.title);
    input.addEventListener('input', () => {
      answers[question.id] = input.value;
      save();
      if (status) { status = ''; document.querySelector('.error')?.remove(); }
    });
    field.append(input);
    if (!question.required) {
      field.append(button('Not sure yet', 'text-action', () => {
        answers[question.id] = UNKNOWN;
        save();
        if (step === questions.length - 1) finish();
        else moveTo(step + 1);
      }));
    }
  }
  if (status) field.append(element('p', 'error', status));
  main.append(field);

  const actions = element('div', 'actions');
  if (step > 0) actions.append(button('← Back', 'btn quiet', () => moveTo(step - 1)));
  const next = button(step === questions.length - 1 ? 'Create brief →' : 'Continue →', 'btn primary', () => {
    if (question.required && !answered(answers[question.id])) {
      status = 'Add a starting idea to continue.';
      render();
      return;
    }
    if (step === questions.length - 1) finish();
    else moveTo(step + 1);
  });
  actions.append(next);
  main.append(actions);
  if (step < questions.length - 1) main.append(button('Create brief with what I have', 'finish-early', finish));
}

function renderBrief(main) {
  const brief = makeBrief(answers);
  const intro = element('div', 'question-intro');
  intro.append(element('p', 'eyebrow', 'Your working brief'));
  const heading = element('h1', '', 'A clearer place to begin.');
  heading.id = 'page-heading';
  intro.append(heading, element('p', 'hint', 'Review what you know. Open questions are ready for the next conversation.'));
  main.append(intro);

  const tools = element('div', 'brief-tools');
  tools.append(button('Copy brief', 'btn primary', async () => {
    try {
      await navigator.clipboard.writeText(toMarkdown(brief));
      setStatus('Brief copied to clipboard.');
    } catch { setStatus('Copy was blocked by your browser. Use Download instead.'); }
  }));
  tools.append(button('Download .md', 'btn secondary', () => {
    const url = URL.createObjectURL(new Blob([toMarkdown(brief)], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'project-brief.md';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus('Brief downloaded.');
  }));
  main.append(tools);
  const message = element('p', 'tool-status', status);
  message.setAttribute('role', 'status');
  main.append(message);

  for (const section of brief.sections) {
    const sectionNode = element('section', 'brief-section');
    sectionNode.append(element('h2', '', section.title));
    for (const entry of section.entries) {
      const row = element('div', 'brief-entry');
      const body = element('div', 'brief-entry-body');
      body.append(element('h3', '', entry.label), element('p', '', entry.value));
      row.append(body, button('Edit', 'edit-link', () => moveTo(visibleQuestions(answers).findIndex(({ id }) => id === entry.id))));
      sectionNode.append(row);
    }
    main.append(sectionNode);
  }
  if (brief.open.length) {
    const sectionNode = element('section', 'brief-section open-questions');
    sectionNode.append(element('h2', '', 'Open questions'));
    for (const item of brief.open) {
      const row = element('div', 'open-row');
      row.append(element('span', '', item.title), button('Answer', 'edit-link', () => moveTo(visibleQuestions(answers).findIndex(({ id }) => id === item.id))));
      sectionNode.append(row);
    }
    main.append(sectionNode);
  }
  main.append(button('← Return to questions', 'btn quiet return', () => moveTo(step)));
}

function setStatus(message) {
  status = message;
  document.querySelector('.tool-status').textContent = message;
}

function render() {
  const questions = visibleQuestions(answers);
  app.replaceChildren();
  const shell = element('div', 'shell');
  const header = element('header', 'topbar');
  const brand = element('div', 'brand');
  const logo = element('img', 'brand-logo');
  logo.src = logoUrl;
  logo.alt = 'Powered by BigSoy Studios';
  logo.width = 205;
  logo.height = 65;
  brand.append(logo, element('span', 'brand-divider'), element('span', 'product-name', 'OUTLINE / 01'));
  header.append(brand, element('span', 'top-label', 'PROJECT DISCOVERY STUDIO'));
  header.append(button('Clear draft', 'clear', () => {
    if (!confirm('Clear this draft and start again? This cannot be undone.')) return;
    answers = {};
    step = 0;
    reviewing = false;
    status = '';
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* Storage may be unavailable. */ }
    render();
  }));
  shell.append(header);

  const layout = element('div', 'layout');
  const aside = element('aside', 'sidebar');
  aside.append(element('p', 'eyebrow', reviewing ? 'THE FINAL CUT / 01' : 'THE FIRST DRAFT / 01'));
  aside.append(element('h2', 'side-title', 'Make something worth talking about.'));
  aside.append(element('p', 'side-copy', 'The best ideas start messy. Let’s give yours a shape.'));
  const stages = element('div', 'stages');
  const stageNames = [...new Set(questions.map(({ stage }) => stage))];
  stageNames.forEach((name, index) => {
    const node = element('div', 'stage');
    const currentStage = questions[step].stage;
    node.classList.toggle('active', !reviewing && name === currentStage);
    node.append(element('span', 'stage-number', String(index + 1).padStart(2, '0')), element('span', '', name));
    stages.append(node);
  });
  aside.append(stages);
  const progress = element('div', 'progress');
  const percent = reviewing ? 100 : Math.round(((step + 1) / questions.length) * 100);
  progress.append(element('span', '', reviewing ? 'Brief ready' : `${step + 1} of ${questions.length} questions`));
  const track = element('div', 'track');
  const fill = element('div', 'fill');
  fill.style.width = `${percent}%`;
  track.append(fill);
  progress.append(track);
  aside.append(progress);
  layout.append(aside);
  const main = element('main', 'workspace');
  main.setAttribute('aria-labelledby', 'page-heading');
  if (reviewing) renderBrief(main);
  else renderQuestion(main);
  layout.append(main);
  shell.append(layout);
  const footer = element('footer', 'footer', 'Your answers stay in this browser until you clear the draft. Nothing is submitted or sent to a server.');
  shell.append(footer);
  app.append(shell);
  if (!reviewing) main.querySelector('textarea')?.focus();
  else {
    main.querySelector('h1')?.setAttribute('tabindex', '-1');
    main.querySelector('h1')?.focus();
  }
}

render();