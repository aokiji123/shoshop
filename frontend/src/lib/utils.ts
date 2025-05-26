import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertTextToColor(text: string) {
  switch (text) {
    case 'black':
      return 'bg-black'
  }
}
