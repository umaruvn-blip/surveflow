import type { ButtonHTMLAttributes } from 'react'

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

type ButtonVariant = 'primary' | 'secondary' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

const variantClassMap: Record<ButtonVariant, string> = {
  primary: 'bg-black text-white hover:opacity-90',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  danger: 'bg-red-600 text-white hover:bg-red-700'
}

const sizeClassMap: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base'
}

export function Button({
  children,
  className,
  disabled,
  isLoading = false,
  size = 'md',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center rounded font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
          variantClassMap[variant],
          sizeClassMap[size],
          className
        )
      )}
      disabled={disabled || isLoading}
      type={type}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  )
}
