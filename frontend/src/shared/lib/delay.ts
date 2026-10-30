/** Пауза для имитации сетевого запроса в демонстрационном API. */
export const delay = (ms: number): Promise<void> =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))
