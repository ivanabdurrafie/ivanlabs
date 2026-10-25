/** Site-wide content & navigation. Edit this to update the portfolio. */

export const site = {
  name: 'Ivan Abdurrafie',
  role: 'Backend Developer',
  tagline: 'Backend Developer specializing in microservices and scalable enterprise systems. 3+ years experience with C#, .NET Core, and Golang.',
  url: 'https://ivanabdurrafie.github.io/ivanlabs',
  email: 'iabdurrafie.work@gmail.com',
  github: 'https://github.com/ivanabdurrafie',
  linkedin: 'https://linkedin.com/in/ivan-abdurrafie',
  resumeFile: 'Ivan_Abdurrafie_Resume.pdf',
  availability: 'Available for opportunities',
  timezone: 'Asia/Jakarta', // WIB
  locale: 'en_US',
  goatcounter: 'https://ivan-abdurrafie.goatcounter.com/count',
};

/** Prefix a root-relative path with the Astro base path (`/ivanlabs`). */
export const withBase = (path: string): string =>
  `${import.meta.env.BASE_URL}/${path.replace(/^\//, '')}`;

export type NavItem = { href: string; label: string; index: string };

/** Page routes (root-relative; `withBase()` prefixes them). `/#…` is an anchor on home. */
export const nav: NavItem[] = [
  { href: '/', label: 'Home', index: '01' },
  { href: '/work', label: 'Work', index: '02' },
  { href: '/about', label: 'About', index: '03' },
  { href: '/#connect', label: 'Connect', index: '04' },
];

export const hero = {
  tagline: 'Backend Engineer',
  lines: [
    { text: 'BUILDING', accent: false },
    { text: 'ENTERPRISE', accent: true },
    { text: 'SYSTEMS', accent: false },
  ],
  columns: [
    'Backend Engineer specializing in .NET, Golang, and scalable microservices architecture.',
    '3+ years building high-performance distributed systems with enterprise scale.',
    'Proven ability to thrive in agile teams and reduce technical debt.',
  ],
};

export type Stat = { value: number; suffix: string; label: string; context: string };

export const metrics: Stat[] = [
  { value: 3, suffix: '+', label: 'Years Experience', context: 'Since 2022' },
  { value: 40, suffix: '%', label: 'Query Performance', context: 'Faster DB response via CQRS' },
  { value: 3, suffix: '', label: 'Core Services Optimized', context: 'Reducing technical debt across enterprise systems' },
];

export const about = [
  { lead: true, text: 'Backend Developer with 3+ years of experience building high-concurrency, enterprise-scale systems.' },
  { lead: false, text: 'Specialized in microservices architecture and CQRS patterns using C# and .NET Core within large corporate environments.' },
  { lead: false, text: 'Actively expanding into Golang to build faster, more efficient backend services for high-traffic applications.' },
  { lead: false, text: 'Proven ability to thrive in agile teams, proactively solve complex integration challenges, and keep systems reliable while reducing technical debt.' },
];

/** Principles shown in the scrolling marquee band (pure-CSS, between sections). */
export const marquee: string[] = [
  'BUILD FOR SCALE',
  'MEASURE EVERYTHING',
  'SIMPLE BEATS CLEVER',
  'OBSSESS OVER LATENCY',
  'SHIP, THEN POLISH',
];

export type SkillGroup = { icon: string; category: string; skills: string[] };

export const skills: SkillGroup[] = [
  {
    icon: 'server',
    category: 'Backend',
    skills: ['C#', 'Golang', '.NET Core', 'Entity Framework', 'REST APIs', 'Microservices', 'CQRS'],
  },
  {
    icon: 'layout-grid',
    category: 'Architecture',
    skills: ['System Design', 'Distributed', 'Relational Database Design', 'API Integration'],
  },
  {
    icon: 'database',
    category: 'Database',
    skills: ['PostgreSQL', 'Redis', 'SQL'],
  },
  {
    icon: 'search',
    category: 'Tools',
    skills: ['Git', 'Docker', 'Azure', 'Agile Development'],
  },
];

export type Role = {
  from: string;
  to: string;
  role: string;
  company: string;
  highlights: string[];
  metric: string;
  metricLabel: string;
};

export const experience: Role[] = [
  {
    from: '2022',
    to: 'PRESENT',
    role: 'Backend Developer',
    company: 'United Tractors (Astra Group)',
    highlights: [
      'Built and maintained backend microservices using C# and .NET Core for enterprise applications',
      'Implemented CQRS patterns, improving database query response times by ~40%',
    ],
    metric: '40%',
    metricLabel: 'Perf',
  },
  {
    from: '2021',
    to: '2022',
    role: 'Web Developer Intern',
    company: 'Perum Jasa Tirta I',
    highlights: [
      'Contributed to development of internal web applications, focusing on backend logic and database optimization',
      'Collaborated with senior developers to optimize performance, improving data retrieval times by ~15%',
    ],
    metric: '15%',
    metricLabel: 'Perf',
  },
];

export const education = {
  degree: 'Diploma 4 (D4), Informatics Engineering',
  school: 'Politeknik Negeri Malang',
  year: 'Graduated 2022',
  gpa: '3.73',
};

export type FaqItem = { q: string; a: string };

export const faq: FaqItem[] = [
  {
    q: 'Where are you based?',
    a: 'Indonesia (WIB, UTC+7). Comfortable collaborating across time zones with async-first habits.',
  },
  {
    q: 'What roles are you open to?',
    a: 'Backend and platform roles — C#/.NET or Golang microservices, API design, and system performance work. Currently available for opportunities.',
  },
  {
    q: 'Remote or on-site?',
    a: 'Open to remote, hybrid, and on-site arrangements.',
  },
  {
    q: 'How do I get your CV?',
    a: 'Download the PDF directly from this page, or email iabdurrafie.work@gmail.com to request it.',
  },
];
