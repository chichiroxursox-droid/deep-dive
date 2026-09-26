// All lesson text lives here. `npm run lessons` exports it to LESSONS.md for review.
// Lines marked [CHECK] are AI claims waiting for Ethan's approval.

export type LessonId = 'tokens' | 'guess' | 'backpack' | 'chef' | 'factcheck'

export type LessonMeta = {
  id: LessonId
  num: number
  title: string
  rule: string
  intro: string[]
  bigIdea: string
  real: string
}

export const SAFETY = 'No accounts. No chatting with a live AI. Nothing you type leaves this page. Works offline once it loads.'

export const START = {
  title: 'Deep Dive',
  tagline: 'Explore an underwater lab and find out how chatbots really work.',
  teachers: 'For teachers: about 20 minutes, ages 10 to 14, no sign-up.',
  dive: 'Dive in (3D)',
  map: 'Map mode (no 3D)',
  mapHint: 'Map mode works with a keyboard alone and on slower computers.',
}

export const HALL = {
  help: 'WASD or arrow keys to walk. Drag to look around. Walk up to a lab and press E.',
  enter: 'Press E to dive in',
  license: 'Diver\'s License',
}

export const LESSONS: LessonMeta[] = [
  {
    id: 'tokens',
    num: 1,
    title: 'Token Reef',
    rule: 'AI reads text in chunks called tokens.',
    intro: [
      'A chatbot does not read letter by letter.',
      'It cuts text into chunks called tokens, and every AI cuts a little differently.',
      'The chunks you see here are real. They come from the tokenizer GPT-4o uses.',
    ],
    bigIdea: 'Representation and Reasoning',
    real: 'Real o200k_base tokenizer (the one GPT-4o uses), running in your browser.',
  },
  {
    id: 'guess',
    num: 2,
    title: 'Guessing Machine',
    rule: 'A language model guesses the next word.',
    intro: [
      'A chatbot writes one token at a time.',
      'Each time, it guesses what should come next.',
      'This machine is a tiny language model, a great-great-grandparent of ChatGPT: same job, way smaller.',
    ],
    bigIdea: 'Learning',
    real: 'A real word-level language model, trained in your browser on three public-domain books.',
  },
  {
    id: 'backpack',
    num: 3,
    title: 'Backpack',
    rule: 'AI can only hold so much of a chat at once. That\'s its context window.',
    intro: [
      'A chatbot carries your chat in a backpack.',
      'The backpack only holds so many tokens. That space is called the context window.',
      'When it gets full, something has to go.',
    ],
    bigIdea: 'Representation and Reasoning',
    real: 'Each message weighs its real token count from the GPT-4o tokenizer.',
  },
  {
    id: 'chef',
    num: 4,
    title: 'Robot Chef',
    rule: 'Say exactly what you want.',
    intro: [
      'The message you give a chatbot is called a prompt.',
      'If you leave something out, the chatbot has to guess it.',
      'Build a prompt from cards and see how close Pip gets.',
    ],
    bigIdea: 'Natural Interaction',
    real: 'Pip builds its answer only from the cards in your prompt, so every missing card shows up in the result.',
  },
  {
    id: 'factcheck',
    num: 5,
    title: 'Fact Check Lagoon',
    rule: 'AI can sound sure and still be wrong. Check facts that matter.',
    intro: [
      'Chatbots can say wrong things in a very sure voice.',
      'People call this a hallucination.',
      'Pip is 99% sure about every fact below. Use the Field Guide to check each one.',
    ],
    bigIdea: 'Societal Impact',
    real: 'Every Field Guide fact links to a NOAA page that was checked by hand.',
  },
]

export const LICENSE = {
  title: 'Diver\'s License',
  namePrompt: 'Your first name',
  nameNote: 'Your name stays on this computer. It never leaves this page.',
  locked: 'Finish a lab to add its rule to your license.',
  done: 'You finished every lab. You know how chatbots really work!',
  print: 'Print my license',
}
