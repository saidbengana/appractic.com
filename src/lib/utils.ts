import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function isValidUrl(url: string) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatDateTime(date: Date | string) {
  return `${formatDate(date)} at ${formatTime(date)}`
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
}

export function bytesToSize(bytes: number) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 Byte'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i]
}
