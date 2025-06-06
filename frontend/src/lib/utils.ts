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
    case 'white':
      return 'bg-white'
    case 'red':
      return 'bg-red-500'
    case 'blue':
      return 'bg-blue-500'
    case 'green':
      return 'bg-green-500'
    case 'yellow':
      return 'bg-yellow-500'
    case 'pink':
      return 'bg-pink-500'
    case 'purple':
      return 'bg-purple-500'
    case 'orange':
      return 'bg-orange-500'
    case 'navy':
      return 'bg-blue-900'
    case 'beige':
      return 'bg-amber-100'
  }
}
