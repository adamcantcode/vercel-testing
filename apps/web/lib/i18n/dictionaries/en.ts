/**
 * UI strings owned by code (labels, errors, chrome). Marketing copy lives
 * in Sanity; these are the strings a developer adds alongside a component.
 */
export const en = {
  skipToContent: 'Skip to content',
  languageSwitcher: 'Change language',
  mainNav: 'Main navigation',
  openMenu: 'Open menu',
  closeMenu: 'Close menu',
  footerRights: 'All rights reserved.',
  notFoundTitle: 'Page not found',
  notFoundBody: "We couldn't find the page you're looking for.",
  backHome: 'Back to home',
  fallbackNotice:
    "This page isn't available in your language yet, so we're showing the English version.",
  pricing: {
    contactUs: 'Contact us',
    perInterval: { month: '/month', year: '/year', 'one-time': 'one-time' },
    recommended: 'Most popular',
  },
  testimonials: {
    previous: 'Previous testimonial',
    next: 'Next testimonial',
    goTo: 'Go to testimonial',
  },
  form: {
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Work email',
    company: 'Company',
    message: 'How can we help?',
    optional: 'optional',
    submitting: 'Sending…',
    genericError: 'Something went wrong. Please try again.',
    errors: {
      required: 'This field is required',
      email: 'Enter a valid work email',
      tooLong: 'This is too long',
    },
  },
}

export type Dictionary = typeof en
