// All lesson text lives here. `npm run lessons` exports it to LESSONS.md for review.
// Lines marked [CHECK] are AI claims waiting for Ethan's approval.

export type LessonId = 'tokens' | 'guess' | 'backpack' | 'chef' | 'factcheck' | 'toolbox'

export type LessonMeta = {
  id: LessonId
  num: number
  title: string
  rule: string
  intro: string[]
  bigIdea: string
  real: string
  bonus?: boolean
}

export const coreDone = (done: ReadonlySet<LessonId>, all: LessonMeta[]) => all.filter((l) => !l.bonus).every((l) => done.has(l.id))

export const SAFETY = 'No accounts. No chatting with a live AI. Nothing you type leaves this page. Works offline once it loads.'

export const START = {
  title: 'Deep Dive',
  tagline: 'Explore an underwater lab and find out how chatbots really work.',
  teachers: 'For teachers: about 20 minutes, ages 10 to 14, no sign-up.',
  dive: 'Dive in (3D)',
  map: 'Map mode (no 3D)',
  mapHint: 'Map mode works with a keyboard alone and on slower computers.',
  noWebGL: 'This computer can\'t show 3D, so Map mode has every lab.',
  calm: 'Your computer asks for less motion, so Map mode is a calm pick. It has every lab.',
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
  {
    id: 'toolbox',
    num: 6,
    title: 'Toolbox',
    rule: 'Tools make AI more reliable. An agent picks its own tools.',
    intro: [
      'A chatbot only writes words, so it can slip on exact math or today\'s news.',
      'Tools fix that. A calculator does exact math. A weather tool looks things up.',
      'An agent is an AI that picks its own tools and takes steps on its own.',
    ],
    bigIdea: 'Representation and Reasoning',
    real: 'The calculator really calculates. The weather tool is pretend, so the app never goes online.',
    bonus: true,
  },
]

export const CORE = LESSONS.filter((l) => !l.bonus)

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

// Lab 3. Each message's weight is counted by the real tokenizer at runtime.
export const BACKPACK = {
  chat: [
    { from: 'you', text: 'Hi Pip! My dog\'s name is Biscuit.' },
    { from: 'pip', text: 'Hi! I love dogs. What else is new?' },
    { from: 'you', text: 'I had pancakes for breakfast today.', filler: true },
    { from: 'pip', text: 'Yum! Pancakes are a good way to start the day.', filler: true },
    { from: 'you', text: 'What is the biggest fish in the sea?' },
    { from: 'pip', text: 'The whale shark is the biggest fish in the sea.' },
    { from: 'you', text: 'Cool! My favorite color is green.', filler: true },
    { from: 'pip', text: 'Green like seaweed! Nice choice.', filler: true },
  ],
  question: 'What\'s my dog\'s name?',
  answer: 'Biscuit',
  goal: 'Chat with Pip, then ask it about your dog. Can Pip still find the answer?',
  tip: 'Tip: pin one message so it never falls out, or toss chat you don\'t need.',
  next: 'Next message',
  ask: 'Ask Pip: "What\'s my dog\'s name?"',
  pack: 'Pip\'s backpack',
  meter: '{used} of {cap} tokens',
  pin: 'Pin',
  unpin: 'Unpin',
  toss: 'Toss',
  fell: 'Fell out:',
  fellNow: '"{text}" fell out of the backpack!',
  right: 'Your dog\'s name is Biscuit! I found it in my backpack.',
  wrong: 'Hmm... is your dog\'s name Max?',
  wrongWhy: 'Pip could not find the answer in its backpack, so it guessed. The guess is wrong!',
  rightWhy: 'The answer was still in the backpack, so Pip could use it.',
  real: 'In this game the oldest message falls out. Real apps handle it differently: some drop old messages, some squeeze them into a summary. Either way, details can get lost.',
  again: 'Try again',
}

// Lab 4. Pip's card is assembled only from the cards in the prompt. Stars check the finished card.
export const CHEF = {
  goal: 'Goal: a funny 3-line birthday card for Maya, who loves sharks.',
  build: 'Pick cards to build your prompt. Then press Cook it!',
  cards: [
    { id: 'task', label: 'Task', text: 'Write a birthday card.' },
    { id: 'who', label: 'Who it\'s for', text: 'It\'s for my friend Maya.' },
    { id: 'details', label: 'Details', text: 'She loves sharks.' },
    { id: 'length', label: 'Length', text: 'Make it 3 lines.' },
    { id: 'tone', label: 'Tone', text: 'Make it funny.' },
    { id: 'example', label: 'Example', text: 'Here is one I like: "Happy birthday, Sam! You rock. Love, your friend"' },
  ],
  prompt: 'Your prompt',
  emptyPrompt: '(no cards yet)',
  cook: 'Cook it!',
  output: 'Pip made this:',
  openers: {
    cardNamed: 'Happy birthday, Maya!',
    cardAnon: 'Happy birthday to you!',
    named: 'Hi Maya!',
    anon: 'Hello there!',
  },
  body: {
    plain_generic: [
      { text: 'I hope you have a nice day.' },
      { text: 'Eat some cake.' },
      { text: 'Have fun with your friends.' },
      { text: 'Enjoy your presents.' },
      { text: 'Have a good year.' },
    ],
    plain_sharks: [
      { text: 'Sharks are big fish that live in the sea.' },
      { text: 'Some sharks have many rows of teeth.' },
      { text: 'Have fun with your friends.' },
      { text: 'Enjoy your presents.' },
      { text: 'Have a good year.' },
    ],
    funny_generic: [
      { text: 'You are not old. You are a classic!', funny: true },
      { text: 'Eat cake like nobody is watching.', funny: true },
      { text: 'Party like a dancing banana.', funny: true },
      { text: 'Enjoy your presents.' },
      { text: 'Have a good year.' },
    ],
    funny_sharks: [
      { text: 'You are more fun than a shark at a pool party!', funny: true },
      { text: 'Eat your cake like a hungry shark. Chomp!', funny: true },
      { text: 'Have a fin-tastic, jaw-some day.', funny: true },
      { text: 'Enjoy your presents.' },
      { text: 'Have a good year.' },
    ],
  },
  signoff: { text: 'Love, your friend' },
  goals: [
    { id: 'card', label: 'It is a birthday card', miss: 'Pip did not know what to make. Try the Task card.' },
    { id: 'maya', label: 'It is for Maya', miss: 'Pip did not know who it was for.' },
    { id: 'sharks', label: 'It talks about sharks', miss: 'Pip did not know Maya loves sharks.' },
    { id: 'short', label: 'It is 3 lines long', miss: 'Pip did not know how long to make it, so it kept going.' },
    { id: 'funny', label: 'It is funny', miss: 'Pip did not know you wanted it funny.' },
  ],
  example: 'The Example card shows Pip a style you like. Pip copied the sign-off.',
  win: '5 stars! When you say exactly what you want, you get closer to what you want.',
}

// Lab 5. Every guide fact was checked against its source page on 2026-09-26.
export const FACTS = {
  task: 'For each fact, pick one: backed up by the guide, wrong by the guide, or not in the guide.',
  sure: '99% sure',
  choices: [
    { id: 'backed', label: 'Backed up' },
    { id: 'wrong', label: 'Wrong' },
    { id: 'missing', label: 'Not in the guide' },
  ],
  claims: [
    { id: 'octopus', text: 'An octopus has three hearts.', answer: 'backed', guide: 'octopus', why: 'The guide says so. Surprising, but true!' },
    { id: 'bones', text: 'A shark\'s skeleton is made of bone, just like yours.', answer: 'wrong', guide: 'sharks', why: 'The guide says shark skeletons are made of cartilage, not bone. Pip made this up.' },
    { id: 'bluewhale', text: 'The blue whale is the biggest fish in the ocean.', answer: 'wrong', guide: 'whaleshark', why: 'The guide says the biggest fish is the whale shark. The blue whale is the biggest animal, but it is a mammal, not a fish.' },
    { id: 'horseshoe', text: 'Horseshoe crabs have blue blood.', answer: 'backed', guide: 'horseshoe', why: 'The guide says so. It sounds made up, but it is true!' },
    { id: 'clownfish', text: 'Clownfish glow in the dark to scare away sharks.', answer: 'missing', subject: 'clownfish', why: 'Nothing in the guide backs this up. Pip made it up. If you can\'t find it in a good source, don\'t trust it yet.' },
  ],
  guideTitle: 'Field Guide',
  guideOpen: 'Open the Field Guide',
  guide: [
    { id: 'octopus', title: 'Octopus', fact: 'Octopuses have three hearts. Two pump blood to the gills, and one pumps it to the rest of the body.', source: 'NOAA Ocean Service', url: 'https://oceanservice.noaa.gov/news/feb26/undersea-creatures-valentines-day.html' },
    { id: 'sharks', title: 'Sharks', fact: 'Sharks, skates, and rays are fish with skeletons made of cartilage instead of bone.', source: 'NOAA National Marine Sanctuaries', url: 'https://sanctuaries.noaa.gov/education/teachers/sharks/background.html' },
    { id: 'bluewhale', title: 'Blue whale', fact: 'The blue whale is the largest animal on Earth. It is a mammal (class Mammalia).', source: 'NOAA Fisheries', url: 'https://www.fisheries.noaa.gov/species/blue-whale' },
    { id: 'whaleshark', title: 'Whale shark', fact: 'The whale shark is the largest fish in the world.', source: 'NOAA National Marine Sanctuaries', url: 'https://sanctuaries.noaa.gov/education/teachers/whale-sharks.html' },
    { id: 'horseshoe', title: 'Horseshoe crab', fact: 'Horseshoe crab blood is blue, and it is copper-based.', source: 'NOAA Ocean Today', url: 'https://oceantoday.noaa.gov/fullmoon-bluebloodsbattlebacteria/' },
  ],
  check: 'Check my answers',
  score: 'You got {n} of {total} right.',
  lesson: 'Pip was 99% sure every time, even when it was wrong. Sounding sure is not the same as being right.',
  source: 'Source',
}

// Lab 6 (bonus). The calculator's answer is computed in code, never written here.
export const TOOLBOX = {
  task: 'Pip has four jobs. Give Pip the right tool for each one. Drag a tool onto a job, or press a tool button.',
  tools: [
    { id: 'calc', label: 'Calculator', icon: '\u{1F9EE}', about: 'Does exact math.' },
    { id: 'weather', label: 'Weather', icon: '\u{1F326}\uFE0F', about: 'Looks up the weather.' },
    { id: 'skill', label: 'Skill card', icon: '\u{1F4CB}', about: 'Saved instructions, like the station\'s report format.' },
    { id: 'none', label: 'No tool', icon: '\u{1F4AC}', about: 'Pip just writes.' },
  ],
  jobs: [
    {
      id: 'math',
      text: 'What is 4,839 x 27?',
      a: 4839,
      b: 27,
      tool: 'calc',
      answers: {
        calc: '{product}. The calculator does it exactly.',
        none: '4,839 x 27 is 130,563.',
        weather: 'Sunny and 78 degrees.',
        skill: 'LAB REPORT. Topic: a big number.',
      },
      wrongWhy: 'Close, but wrong! Without a calculator, Pip guesses big numbers one piece at a time, and a digit can slip.',
    },
    {
      id: 'weather',
      text: 'What\'s the weather at the beach today?',
      tool: 'weather',
      answers: {
        weather: 'The beach sensor says 78 degrees, sunny, light wind.',
        none: 'It is probably sunny and 72 degrees!',
        calc: 'The weather is 0.',
        skill: 'LAB REPORT. Weather: unknown.',
      },
      rightNote: 'In this game the weather tool is pretend. Real weather tools look up live data.',
      wrongWhy: 'Pip made that up. Without a tool, it has no way to know today\'s weather.',
    },
    {
      id: 'report',
      text: 'Write today\'s lab report in the station\'s format.',
      tool: 'skill',
      answers: {
        skill: 'STATION LAB REPORT | Day 12 | What we saw: 3 octopuses by the reef | What it means: the reef is healthy',
        none: 'Today we saw some octopuses and it was cool.',
        calc: '3',
        weather: 'Sunny.',
      },
      wrongWhy: 'Pip did not know the station\'s format. A skill card is saved instructions Pip can follow every time.',
    },
    {
      id: 'joke',
      text: 'Tell me a crab joke.',
      tool: 'none',
      answers: {
        none: 'Why don\'t crabs share? Because they\'re shellfish!',
        calc: 'Crab joke = 0.5',
        weather: 'Partly crabby, 70 degrees.',
        skill: 'LAB REPORT. Joke: crab.',
      },
      wrongWhy: 'This job did not need a tool. The wrong tool just got in the way.',
    },
  ],
  right: 'Right tool!',
  wrong: 'Wrong tool.',
  agentTitle: 'Agent mode',
  agentGoal: 'Now Pip is an agent. It picks its own tools. Your goal for Pip: "Plan a beach trip for {divers} divers. Snacks cost ${price} each. Write it up as a lab report."',
  agentAsk: 'Pip wants to take these steps. Say yes or no to each one.',
  divers: 3,
  price: 4,
  steps: [
    { tool: 'weather', text: 'Use Weather to check the beach.', ok: true },
    { tool: 'calc', text: 'Use Calculator: {divers} x ${price} for snacks.', ok: true },
    { tool: 'skill', text: 'Use the Skill card to write the lab report.', ok: true },
    { tool: 'send', text: 'Send the report to everyone in the station.', ok: false },
  ],
  yes: 'Yes',
  no: 'No',
  sendWhy: 'You never asked Pip to send anything. Agents can take real actions, so a person should check each step.',
  agentDone: 'Plan ready: sunny beach, snacks cost ${total}, report written. And nothing was sent without asking you.',
  agentOops: 'Look again at the steps marked in red.',
}

export const LICENSE = {
  title: 'Diver\'s License',
  namePrompt: 'Your first name',
  nameNote: 'Your name stays on this computer. It never leaves this page.',
  locked: 'Finish a lab to add its rule to your license.',
  done: 'You finished every lab. You know how chatbots really work!',
  print: 'Print my license',
}

// AI claims waiting for Ethan's OK. Shown as [CHECK] in LESSONS.md only, never in the app.
export const CHECK: Record<string, string> = {
  'tokens.strawberry': 'Newer chatbots often count letters fine. "can trip" is hedged, but confirm the wording.',
  'backpack.wrongWhy': 'Real chatbots sometimes say "I don\'t know" instead of guessing. Is "so it guessed" fair for kids?',
}
