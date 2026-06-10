export const emailPattern =
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

export const creditCardPatterns = [
  /\b4[0-9]{12}(?:[0-9]{3})?\b/g,
  /\b(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}\b/g,
  /\b3[47][0-9]{13}\b/g,
  /\b(?:6011|65[0-9]{2}|64[4-9][0-9]|6221[0-9]{2}|6222[0-9]{2}|6223[0-9]{2}|6224[0-9]{2}|6225[0-9]{2}|6226[0-9]{2}|6227[0-9]{2}|6228[0-9]{2}|6229[0-9]{2})[0-9]{10,12}\b/g,
  /\b(?:\d[ -]*?){13,16}\b/g,
];

export const phonePatterns = [
  /\b\+\d{1,4}[ .-]?\d{1,14}(?:[ .-]?\d{1,14})*\b/g,
  /\b\+\d{1,4}[ .-]?\(\d{1,4}\)[ .-]?\d{1,14}(?:[ .-]?\d{1,14})*\b/g,
  /\b\+\d{1,4}[ .-]?\d{1,4}[ .-]?\d{1,14}(?:\/\d{1,4})+\b/g,
  /\b1[ .-]?\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}\b/g,
  /\b\d{3}[.-]?\d{3}[.-]?\d{4}\b/g,
  /\b\d{1,4}[ ]\d{1,4}[ ]\d{1,4}[ ]\d{1,4}\b/g,
  /\b\d{6,10}(?:\/\d{1,4}){1,5}\b/g,
  /\b\(\d{3}\)[ .-]?\d{3}[ .-]?\d{4}\b/g,
  /\b\+\d{1,4}[ ]\d{4}[ ]\d{6}\b/g,
  /\b\+\d{1,4}\(\d{3}\)\d{3}[-]?\d{4}\b/g,
  /\b\d{3}[-]\d{3}[-]\d{4}\b/g,
  /\b\+\d{1,4}[ ]?\d{1,4}[ ]?\d{4}[ ]?\d{4}\b/g,
  /\b\+[0-9]{10,15}\b/g,
  /\b\+\d{1,4}[ ]?\d{1,4}[ ]?\d{1,4}[ ]?\d{1,4}\b/g,
  /\b\d{1,4}[ -]?\d{1,4}[ -]?\d{1,4}[ -]?\d{1,4}\b/g,
];

export const addressPatterns = [
  /\b\d+\s+[A-Za-z0-9\s,.-]+(?:Avenue|Ave|Street|St|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Plaza|Plz|Square|Sq)\b/gi,
  /\bP\.?O\.?\s*Box\s+\d+\b/gi,
  /\b[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}\b/g,
  /\b\d{5}(?:-\d{4})?\b/g,
];

export const ssnPattern = /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g;

export function isLikelyPhoneNumber(value: string): boolean {
  const digitsOnly = value.replace(/\D/g, '');
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

export function isPartOfUrl(match: string, fullText: string): boolean {
  const matchIndex = fullText.indexOf(match);
  if (matchIndex === -1) {
    return false;
  }

  const textBeforeMatch = fullText.substring(0, matchIndex);
  const urlPrefixRegex = /https?:\/\/[^\s]*$/;
  return urlPrefixRegex.test(textBeforeMatch);
}
