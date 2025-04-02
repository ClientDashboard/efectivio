import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(amount: number | string, currency = "USD") {
  const formatter = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  });
  
  return formatter.format(typeof amount === "string" ? parseFloat(amount) : amount);
}

// Format date
export function formatDate(date: Date | string, includeTime = false) {
  if (!date) return "";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (includeTime) {
    return dateObj.toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  }
  
  return dateObj.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// Check if an object is empty
export function isEmpty(obj: object) {
  return Object.keys(obj).length === 0;
}

// Generate a random ID
export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

// Truncate text
export function truncateText(text: string, maxLength: number) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// Calculate the sum of an array of numbers
export function sumArray(arr: number[]) {
  return arr.reduce((sum, num) => sum + num, 0);
}

// Create debounce function
export function debounce<T extends (...args: any[]) => any>(func: T, timeout = 300) {
  let timer: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  };
}
