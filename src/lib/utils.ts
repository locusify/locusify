import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge class values */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Check if a file is a video by MIME type or extension */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/') || /\.(mov|mp4|m4v)$/i.test(file.name)
}

/** Shared glass-morphism panel style used across map UI components */
export const glassPanel = 'bg-material-thick border-fill-tertiary rounded-2xl border shadow-2xl backdrop-blur-[120px]'
