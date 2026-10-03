import type { ReactNode } from 'react';

export const siteContent: {
  brand: string;
  tagline: string;
  nav: { label: string; href: string }[];
  home: { eyebrow: string; headline: ReactNode; description: string };
  about: { eyebrow: string; title: string; description: string; note: string };
  steps: { title: string; description: string; icon: string }[];
  benefits: { title: string; description: string }[];
  listenerBenefits: string[];
  faqs: { q: string; a: string }[];
  placeholders: { email: string; phone: string; privacy: string; terms: string };
} = {
  brand: 'TalkOne',
  tagline: 'Real people. Real talk.',
  nav: [
    { label: 'About', href: '#about' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'For you', href: '#for-users' },
    { label: 'Questions', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ],
  home: {
    eyebrow: 'A little more room to be heard',
    headline: <>Sometimes, all you need is <em>someone to talk to.</em></>,
    description: 'TalkOne brings together people who want to be heard and thoughtful listeners who are ready to make time for a real conversation.',
  },
  about: {
    eyebrow: 'A simple idea, with people at its heart',
    title: 'A listening ear can change the shape of a day.',
    description: 'TalkOne is a platform for everyday conversation and human connection. When you want to talk through what is on your mind, share a small win, or simply have a thoughtful conversation, we make it easier to find someone willing to listen.',
    note: 'No perfect words needed. Just start where you are.',
  },
  steps: [
    { title: 'Say what’s on your mind', description: 'Choose the kind of conversation you’re looking for, in your own words.', icon: 'message' },
    { title: 'Meet a listener', description: 'Explore listeners and find someone whose approach feels right for you.', icon: 'people' },
    { title: 'Have a real conversation', description: 'Connect at a pace that feels comfortable. Being heard is a good place to begin.', icon: 'heart' },
    { title: 'Come back when you like', description: 'Keep a connection going or find a fresh perspective another time.', icon: 'repeat' },
  ],
  benefits: [
    { title: 'A conversation on your terms', description: 'Talk about everyday life, relationships, work, or whatever is taking up space.' },
    { title: 'Find a person who feels like a fit', description: 'Browse listener introductions and choose a conversation that feels comfortable.' },
    { title: 'Make space for connection', description: 'A thoughtful conversation can help a day feel a little less like yours to carry alone.' },
  ],
  listenerBenefits: ['Offer your time and a thoughtful ear', 'Meet people looking for conversation', 'Make room for meaningful connection'],
  faqs: [
    { q: 'What is TalkOne?', a: 'TalkOne is a platform that helps people looking for conversation connect with human listeners who are ready to make time for them.' },
    { q: 'What can I talk about?', a: 'Everyday challenges, relationships, work, feeling lonely, a recent win, or something else on your mind. You choose what to share and when.' },
    { q: 'Is TalkOne a therapy or emergency service?', a: 'No. TalkOne is for human conversation and listening. It does not provide clinical care, therapy, or emergency support. If you need urgent help, contact local emergency services or a trusted professional.' },
    { q: 'How do I become a listener?', a: 'Start with the listener registration page. For now, it only asks for an email address or phone number so you can express interest. This website does not send or store the information.' },
    { q: 'Is this form connected to TalkOne?', a: 'Not yet. The listener form is a frontend demonstration only. Submitting it does not contact TalkOne, create an account, verify your details, or submit an application.' },
    { q: 'Where can I get the app?', a: 'App Store and Google Play links will be added here when official download pages are available.' },
  ],
  placeholders: {
    email: '[Contact email placeholder]',
    phone: '[Contact phone placeholder]',
    privacy: '[Privacy policy URL placeholder]',
    terms: '[Terms URL placeholder]',
  },
};