// This function expects string in snake case as input
// and returns string in camel case format separated by spaces:
// Example:
// golden_signals : Golden Signals
// alert-rules    : Alert Rules
// docs           : Docs
// docs name      : Docs Name
export function toCamelWithSpaces(string) {

  // Look for first character in the input string or
  // Any character which appears after '_' or '-' and
  // replace them with uppercase characters.
  return string.replace(/(^[a-z]|([-_ ][a-z]))/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', ' ')
      .replace('_', ' ');
  });
}