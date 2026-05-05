/**
 * Formats a number by adding commas as thousands separators and specified decimal places.
 * @param {number} number - The number to format.
 * @param {number} decimalPlaces - The number of decimal places to include.
 * @returns {string} The formatted number string, or '0' if the input is invalid.
 */
export function formatNumberWithCommas(number, decimalPlaces = 0) {
  if (number === undefined || number === null || isNaN(number)) return '0';
  
  const options = {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  };
  
  return new Intl.NumberFormat('en-US', options).format(number);
}
