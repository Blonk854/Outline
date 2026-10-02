export const UNKNOWN = 'Not sure yet';

export const TYPES = [
  { value: 'digital', label: 'Digital product', detail: 'Website, app, tool' },
  { value: 'event', label: 'Event', detail: 'Gathering, launch, workshop' },
  { value: 'physical', label: 'Physical space or product', detail: 'Place, object, installation' },
  { value: 'service', label: 'Service or process', detail: 'Offering, program, workflow' },
  { value: 'other', label: 'Something else', detail: 'A different kind of project' },
  { value: UNKNOWN, label: UNKNOWN, detail: 'We can decide later' },
];

export const DELIVERY = {
  digital: { title: 'What should someone be able to do with it?', hint: 'Think of the one or two most important actions, not a full feature list.', placeholder: 'For example, book an appointment and see availability' },
  event: { title: 'What should happen at the event?', hint: 'Consider the format and the experience people should leave with.', placeholder: 'For example, a hands-on workshop for 30 people' },
  physical: { title: 'What are you hoping to create or change?', hint: 'Describe the place or object and how people will use it.', placeholder: 'For example, a welcoming space for small team meetings' },
  service: { title: 'What would the service help people do?', hint: 'Describe the experience from the customer’s point of view.', placeholder: 'For example, get help within one business day' },
  other: { title: 'What would the finished project include?', hint: 'Describe what you expect to exist when the work is done.', placeholder: 'For example, a guide and a pilot program' },
  [UNKNOWN]: { title: 'What could the finished project look like?', hint: 'A rough guess is enough. You can change this later.', placeholder: 'For example, a tool, an event, or a new service' },
};

export const QUESTIONS = [
  { id: 'idea', stage: 'The big picture', title: 'What is the idea so far?', hint: 'Start wherever you are. A single sentence is enough.', placeholder: 'I have an idea for...', required: true },
  { id: 'audience', stage: 'The big picture', title: 'Who is this for?', hint: 'Name the people who would use it, attend it, or benefit from it.', placeholder: 'For example, local business owners' },
  { id: 'outcome', stage: 'The big picture', title: 'What do you hope will change?', hint: 'Focus on the problem or opportunity, not the solution.', placeholder: 'For example, make it easier to find reliable support' },
  { id: 'type', stage: 'Shape of the project', title: 'What kind of project might this be?', hint: 'Pick the closest fit. It does not have to be final.', options: TYPES },
  { id: 'deliverable', stage: 'Shape of the project', ...DELIVERY[UNKNOWN] },
  { id: 'essentials', stage: 'Shape of the project', title: 'What absolutely needs to be included?', hint: 'List only the essentials; details can come later.', placeholder: 'For example, accessible to people on mobile phones' },
  { id: 'timing', stage: 'Practical details', title: 'When would you like this to happen?', hint: 'A season, date, or flexible window all work.', placeholder: 'For example, before the end of the year' },
  { id: 'budget', stage: 'Practical details', title: 'Is there a budget or range in mind?', hint: 'An approximate range is useful, but not required.', placeholder: 'For example, around $5,000' },
  { id: 'constraints', stage: 'Practical details', title: 'Are there any limits or dependencies?', hint: 'Think approvals, partners, tools, locations, or things to avoid.', placeholder: 'For example, the venue needs wheelchair access' },
  { id: 'success', stage: 'The finish line', title: 'How would you know it worked?', hint: 'Picture a good result a few months after launch.', placeholder: 'For example, 50 customers using it each month' },
  { id: 'notes', stage: 'The finish line', title: 'Anything else we should know?', hint: 'Inspiration, existing work, concerns, or decisions still to make.', placeholder: 'One thing I do not want to lose is...' },
];