import { z } from 'zod'

import { ThemeMode } from '@/enums/theme-mode'
import { Gender } from '@/types'

export const idSchema = z.string().trim().min(1, 'Id is required')
export const emailSchema = z.string().trim().email('Email chưa đúng định dạng')
export const passwordSchema = z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
export const nameSchema = z.string().trim().min(1, 'Name is required')

export const genderSchema = z.nativeEnum(Gender)
export const themeModeSchema = z.nativeEnum(ThemeMode)
