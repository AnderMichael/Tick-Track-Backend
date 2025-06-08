export default function defineRomanNumbers(decimalNumber: number): string {
  const romanNumerals = [
    'I',
    'II',
    'III',
    'IV',
    'V',
    'VI',
    'VII',
    'VIII',
    'IX',
    'X',
  ];
  return romanNumerals[decimalNumber - 1] || decimalNumber.toString();
}
