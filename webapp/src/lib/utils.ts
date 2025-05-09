import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const validatePassword = (password: string) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
}


export const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};


export const extractTextFromTipTap = (node: any): string => {
  // Handle array of nodes
  if (Array.isArray(node)) {
    return node.map((n: any): string => extractTextFromTipTap(n)).join('\n');
  }

  // Handle single node
  if (typeof node !== 'object' || node === null) {
    return '';
  }

  // Extract text from current node
  let text = '';

  // Handle direct text content
  if (node.type === 'text' && node.text) {
    text += node.text;
  }

  // Recursively process child content
  if (Array.isArray(node.content)) {
    text += node.content.map((child: any): string => extractTextFromTipTap(child)).join('');
  }

  // Add newline after headings
  if (node.type === 'heading') {
    text += '\n';
  }

  // Add newline after paragraphs
  if (node.type === 'paragraph') {
    text += '\n';
  }

  return text;
}



export interface TimeCode { hours: number; minutes: number; seconds: number };
export const secondsToTime = (seconds: number): TimeCode => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return { hours: h, minutes: m, seconds: s };
};

export const timeToSeconds = (h: number, m: number, s: number) => {
  return h * 3600 + m * 60 + s;
};