import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export function convertTextToColor(text: string) {
  switch (text) {
    case 'black':
      return 'bg-black'
    case 'gray':
      return 'bg-gray-500'
    case 'brown':
      return 'bg-amber-900'
  }
}
