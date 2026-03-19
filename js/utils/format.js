/**
 * Formats a number by adding commas as thousands separators.
 * @param {number} number - The number to format.
 * @returns {string} The formatted number string, or '0' if the input is invalid.
 */
export function formatNumberWithCommas(number) {
  if (number === undefined || number === null || isNaN(number)) return '0';
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
