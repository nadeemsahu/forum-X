export const categories = [
  { id: 'c1', name: 'General Discussion', description: 'Talk about anything and everything.', icon: '💬' },
  { id: 'c2', name: 'React Developers', description: 'React, Redux, Next.js, and ecosystem.', icon: '⚛️' },
  { id: 'c3', name: 'Frontend Engineering', description: 'CSS, HTML, Web APIs.', icon: '🎨' },
  { id: 'c4', name: 'Career Advice', description: 'Resume reviews and interview prep.', icon: '💼' }
];

export const threads = [
  {
    id: 't1',
    categoryId: 'c2',
    title: 'Why functional components over class components?',
    author: 'ReactNinja',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    replyCount: 5,
    isRead: false,
    votes: 142
  },
  {
    id: 't2',
    categoryId: 'c2',
    title: 'Favorite CSS-in-JS library?',
    author: 'StyleMaster',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    replyCount: 2,
    isRead: true,
    votes: 56
  },
  {
    id: 't3',
    categoryId: 'c1',
    title: 'What is everyone working on this weekend?',
    author: 'WeekendCoder',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    replyCount: 1,
    isRead: false,
    votes: 310
  },
  {
    id: 't4',
    categoryId: 'c3',
    title: 'Tailwind vs Vanilla CSS for large projects',
    author: 'CSSPro',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    replyCount: 0,
    isRead: false,
    votes: -4
  }
];

export const posts = {
  t1: {
    id: 'p1',
    author: 'ReactNinja',
    text: 'I know hooks made functional components powerful, but are there any cases where class components are still better?\n\nSpecifically asking about **Error Boundaries** and `getSnapshotBeforeUpdate`.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    votes: 142,
    replies: [
      {
        id: 'r1',
        author: 'HookGuru',
        text: 'Error boundaries are the only hard requirement for class components right now. You still can\'t write them as functional components unfortunately.',
        timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
        votes: 89,
        replies: [
          {
            id: 'r2',
            author: 'ReactNinja',
            text: 'Ah I forgot about Error Boundaries. Thanks! Do you think they will ever add a `useErrorBoundary` hook?',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            votes: 12,
            replies: []
          }
        ]
      },
      {
        id: 'r3',
        author: 'LegacyDev',
        text: 'I still prefer classes for complex state objects. It feels cleaner to me to write `this.setState({ ...this.state, foo: "bar" })`.',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        votes: -15,
        replies: [
          {
            id: 'r4',
            author: 'HookGuru',
            text: '> I still prefer classes for complex state objects.\n\nHave you tried `useReducer`? It solves that problem neatly and keeps the state logic separate from the component.',
            timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
            votes: 45,
            replies: [
              {
                id: 'r5',
                author: 'LegacyDev',
                text: 'Actually yes, that is a fair point. `useReducer` does feel a lot like Redux which I love.',
                timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
                votes: 8,
                replies: []
              }
            ]
          }
        ]
      }
    ]
  },
  t2: {
    id: 'p2',
    author: 'StyleMaster',
    text: 'What CSS in JS library are you reaching for in 2026? Styled-components, Emotion, or something else?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    votes: 56,
    replies: [
      {
        id: 'r6',
        author: 'VanillaFan',
        text: 'Honestly, I just use plain CSS modules or vanilla CSS variables now. Native CSS is so powerful with nesting and `:has()`.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        votes: 102,
        replies: [
          {
            id: 'r7',
            author: 'StyleMaster',
            text: 'I agree for the most part, but theming can still be tricky without JS.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
            votes: 5,
            replies: []
          }
        ]
      }
    ]
  },
  t3: {
    id: 'p3',
    author: 'WeekendCoder',
    text: 'Just wanted to see what side projects everyone is hacking on this weekend! Share your repos below and I\'ll star them.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    votes: 310,
    replies: [
      {
        id: 'r8',
        author: 'StudentDev',
        text: 'Building a forum app for a skill development project. Trying to make it look God-Tier without using any UI frameworks!',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        votes: 450,
        replies: []
      }
    ]
  },
  t4: {
    id: 'p4',
    author: 'CSSPro',
    text: 'We are debating Tailwind vs Vanilla CSS for our new startup. Thoughts on maintainability at scale?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    votes: -4,
    replies: []
  }
};
