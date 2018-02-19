export function roundOffToTwoDigits(input) {
  // Function takes input in bits or higher unit of bits (kb,mb,gb)
  // to round off to 2 digits after decimal point.
  return Math.round(input * 100) / 100;
}
