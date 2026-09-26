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

// Lab 1. Splits are never written here: the lesson asks the real tokenizer.
export const TOKENS = {
  loading: 'Loading the real tokenizer...',
  ask: 'How many tokens do you think this is?',
  show: 'Show me',
  next: 'Next',
  result: 'You guessed {guess}. The tokenizer made {n}.',
  exact: 'Spot on!',
  close: 'So close!',
  off: 'Now you know!',
  space: 'A dot (·) is a space. Spaces ride along with the word after them.',
  numbers: 'The small number under each chunk is its token number. Inside the AI, every chunk is really a number.',
  rounds: ['fish', 'jellyfish', 'The ocean is deep.', 'strawberry'],
  strawberry:
    'How many r\'s are in strawberry? You can count them. The AI never sees letters, only chunks like the ones above. That is one reason chatbots can trip on counting letters.',
  letters: '{letters} letters, but only {n} tokens.',
  name: 'Now type your own name. How does the AI cut it up?',
  namePlaceholder: 'Your name',
  free: 'Try anything else: a word, an emoji, or a silly sentence.',
}

// Public-domain books the language model reads (Project Gutenberg, license header removed).
export const BOOKS = [
  { file: 'twenty-thousand-leagues.txt', title: 'Twenty Thousand Leagues Under the Sea', author: 'Jules Verne', gutenberg: 164 },
  { file: 'treasure-island.txt', title: 'Treasure Island', author: 'Robert Louis Stevenson', gutenberg: 120 },
  { file: 'aesops-fables.txt', title: 'Aesop\'s Fables', author: 'Aesop, translated by V. S. Vernon Jones', gutenberg: 11339 },
]

// Lab 2. Probabilities are never written here: they come from counting words in BOOKS.
export const GUESS = {
  loading: 'The machine is reading three old books...',
  read: 'It just read {words} words from three old books, right here in your browser.',
  prompt: 'The captain looked at the',
  ask: 'What word comes next? Type a guess or pick one.',
  suggestions: ['sea', 'map', 'door', 'sky', 'fish'],
  reveal: 'Show the machine\'s top 5',
  yours: 'The machine gave "{word}" a {p} chance.',
  never: 'The machine never saw "{word}" after "{context}" in its books, so it gives it 0%.',
  how: 'It counted every word that came after "{context}" in the books. More counts make a bigger bar.',
  storyTitle: 'Story mode',
  story: 'Now let the machine write, one word at a time. The temperature dial changes how it picks.',
  temps: [
    { t: 0, label: 'Ice cold' },
    { t: 0.6, label: 'Cool' },
    { t: 1, label: 'Just right' },
    { t: 1.6, label: 'Warm' },
    { t: 2.5, label: 'Red hot' },
  ],
  cold: 'Cold: it always picks its top guess, so it gets stuck repeating itself.',
  hot: 'Hot: it picks long shots more often, so it gets silly.',
  write: 'Write a story',
  start: 'the captain',
}

export const LICENSE = {
  title: 'Diver\'s License',
  namePrompt: 'Your first name',
  nameNote: 'Your name stays on this computer. It never leaves this page.',
  locked: 'Finish a lab to add its rule to your license.',
  done: 'You finished every lab. You know how chatbots really work!',
  print: 'Print my license',
}
