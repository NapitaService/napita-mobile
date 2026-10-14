/**
 * Colombian mobile numbers ("celular"), used for sign-up codes by WhatsApp/SMS.
 * Shared by customer sign-up and (later) business sign-up.
 *
 * A Colombian celular has 10 digits and starts with 3 (300–359), e.g. 300 123 4567.
 * Landlines start with 60 and can't receive the code.
 */

export type PhoneProblem =
  | 'empty'
  | 'landline' // starts with 60
  | 'notMobile' // doesn't start with 3
  | 'unknownPrefix' // starts with 36–39, not used for mobiles
  | 'tooShort'
  | null; // valid

export const PHONE_LENGTH = 10;

/** Keeps only digits, drops a pasted +57 / 0057 country code, and caps at 10 digits. */
export function cleanPhone(input: string) {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('0057')) digits = digits.slice(4);
  else if (digits.length > PHONE_LENGTH && digits.startsWith('57')) digits = digits.slice(2);
  return digits.slice(0, PHONE_LENGTH);
}

/**
 * What's wrong with the number, or null if it's a valid celular.
 * Problems with the first digits show while typing; `tooShort` only once the
 * person is done (left the field or pressed the button).
 */
export function phoneProblem(digits: string): PhoneProblem {
  if (digits.length === 0) return 'empty';
  if (digits.startsWith('60')) return 'landline';
  if (digits[0] !== '3') return 'notMobile';
  if (digits.length >= 2 && Number(digits[1]) > 5) return 'unknownPrefix';
  if (digits.length < PHONE_LENGTH) return 'tooShort';
  return null;
}

/** Problems worth showing before the person has finished typing. */
export function isEarlyProblem(problem: PhoneProblem) {
  return problem === 'landline' || problem === 'notMobile' || problem === 'unknownPrefix';
}
