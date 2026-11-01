export const CONTACT_EMAIL = "garg.arnav2004@gmail.com";

// A form link if one is set, otherwise an email, so feedback always has somewhere to go.
export const FEEDBACK_HREF =
  process.env.NEXT_PUBLIC_FEEDBACK_URL ||
  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("PMPrep AI feedback")}`;
