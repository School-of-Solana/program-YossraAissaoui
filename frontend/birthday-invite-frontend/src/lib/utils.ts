import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { DEVNET_EXPLORER, CLUSTER } from './constants';

export function getExplorerLink(tx: string): string {
  return `${DEVNET_EXPLORER}/tx/${tx}?cluster=${CLUSTER}`;
}

export function truncateAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 8)}...${address.slice(-8)}`;
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function convertToSeconds(date: string): number {
  return Math.floor(new Date(date).getTime() / 1000);
}

export function convertFromSeconds(seconds: number): string {
  return new Date(seconds * 1000).toISOString().split('T')[0];
}

export function validateEventName(name: string): boolean {
  return name.length > 0 && name.length <= 32;
}

export function validateDate(date: string): boolean {
  const dateObj = new Date(date);
  return dateObj > new Date();
}

export function validateComment(text: string): boolean {
  return text.trim().length > 0 && text.length <= 500;
}


export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs));
}

export function ellipsify(str = '', len = 4, delimiter = '..') {
 const strLen = str.length
 const limit = len * 2 + delimiter.length


 return strLen >= limit ? str.substring(0, len) + delimiter + str.substring(strLen - len, strLen) : str
}
