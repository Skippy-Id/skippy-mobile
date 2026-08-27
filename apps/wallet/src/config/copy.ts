import { brand } from '../../brands'

export const copy = brand.copy

export function useAppCopy() {
  return copy
}

export function useAppIcon() {
  return brand.useAppIcon()
}
