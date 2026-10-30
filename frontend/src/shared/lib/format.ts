/** 25 -> «25 мин», 90 -> «1 ч 30 мин», 120 -> «2 ч». */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} мин`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours} ч` : `${hours} ч ${rest} мин`
}
