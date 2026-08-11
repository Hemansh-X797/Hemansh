export type Book = {
  slug: string;
  title: string;
  cover: string; // public/book_covers/*
  description: string;
  status: 'available' | 'coming-soon';
};

export const books: Book[] = [
  {
    slug: 'the-discipline-code',
    title: 'The Discipline Code',
    cover: '/book_covers/The_Discipline_code.png',
    description: 'A tactical blueprint on discipline, strategic execution, and cognitive focus.',
    status: 'available',
  },
  {
    slug: 'the-science-of-raising-humans',
    title: 'The Science of Raising Humans',
    cover: '/book_covers/the-science-of-raising-humans.jpg', // pending — cover not uploaded yet
    description: 'A grounded, evidence-aware look at how humans are actually raised — and shaped.',
    status: 'available',
  },
  {
    slug: '10-minute-morning-productivity-hack',
    title: '10-Minute Morning Productivity Hack',
    cover: '/book_covers/THE_10_Minute_Productivvity_boosting_kit.jpg',
    description: 'A short, high-leverage system for winning the first ten minutes of the day.',
    status: 'available',
  },
];
