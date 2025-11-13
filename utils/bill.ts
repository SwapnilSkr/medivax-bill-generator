import { ItemType } from "@/types/bill";

export const numberToWords = (num: number): string => {
  const units = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (num === 0) return "Zero";

  const sayNumberInWords = (num: number): string => {
    if (num < 20) return units[num];
    if (num < 100)
      return (
        tens[Math.floor(num / 10)] + (num % 10 ? " " + units[num % 10] : "")
      );
    if (num < 1000)
      return (
        units[Math.floor(num / 100)] +
        " Hundred" +
        (num % 100 ? " " + sayNumberInWords(num % 100) : "")
      );
    if (num < 100000)
      return (
        sayNumberInWords(Math.floor(num / 1000)) +
        " Thousand" +
        (num % 1000 ? " " + sayNumberInWords(num % 1000) : "")
      );
    if (num < 10000000)
      return (
        sayNumberInWords(Math.floor(num / 100000)) +
        " Lakh" +
        (num % 100000 ? " " + sayNumberInWords(num % 100000) : "")
      );
    return (
      sayNumberInWords(Math.floor(num / 10000000)) +
      " Crore" +
      (num % 10000000 ? " " + sayNumberInWords(num % 10000000) : "")
    );
  };

  const totalAmount = Math.round(num);
  const rupees = Math.floor(totalAmount);
  const paise = Math.round((totalAmount - rupees) * 100);

  let result = sayNumberInWords(rupees) + " Rupees";
  if (paise > 0) {
    result += " and " + sayNumberInWords(paise) + " Paise";
  }

  return result + " Only";
};

export const calculateTotal = (items: ItemType[]): number => {
  return items.reduce((total, item) => {
    return total + (item.amount !== null ? item.amount : 0);
  }, 0);
};

export const calculateTotalItems = (items: ItemType[]): number => {
  return items.reduce((total, item) => {
    return total + (item.qty !== null ? item.qty : 0);
  }, 0);
};

export const getActiveItemCount = (items: ItemType[]): number => {
  return items.filter((item) => item.qty !== null || item.description !== "")
    .length;
};

export const createEmptyItem = (id: number): ItemType => {
  return {
    id,
    description: "",
    hsn: "",
    mfg: "",
    qty: null as unknown as number,
    unit: "",
    batch: "",
    exp: "",
    mrp: null as unknown as number,
    disc: null as unknown as number,
    rate: null as unknown as number,
    amount: null as unknown as number,
  };
};

export const createInitialItems = (count: number = 10): ItemType[] => {
  return Array.from({ length: count }, (_, i) => createEmptyItem(i + 1));
};

