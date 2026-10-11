export const toFechaDate = (value?: string | null): Date | null =>
  value ? new Date(value) : null;

export const toFechaISO = (value: unknown): string | null =>
  value ? new Date(value as string | Date).toISOString().slice(0, 10) : null;

export const addDiasUTC = (fecha: Date, dias: number): Date =>
  new Date(
    Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate() + dias)
  );
