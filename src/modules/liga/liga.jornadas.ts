import { addDiasUTC, toFechaDate } from "@/utils/fecha";
import { Jornada } from "./liga.model";

/**
 * Jornada k (1-based): inicio = D + (k-1)*d, fin = inicio + d - 1.
 * Con D = 1 y d = 15: J1 = 1..15, J2 = 16..30.
 */
export function calcularFechasJornadas(
  numJornadas: number,
  fechaPrimeraJornada: string,
  duracionDias: number
): Jornada[] {
  const inicio = toFechaDate(fechaPrimeraJornada)!;
  return Array.from({ length: numJornadas }, (_, i) => ({
    numero: i + 1,
    fechaInicio: addDiasUTC(inicio, i * duracionDias),
    fechaFin: addDiasUTC(inicio, (i + 1) * duracionDias - 1),
  }));
}

/**
 * Añade una jornada al final continuando las fechas de la última si es posible.
 */
export function siguienteJornada(jornadas: Jornada[], duracionDias: number | null): Jornada {
  const ultima = jornadas[jornadas.length - 1];
  const numero = (ultima?.numero ?? 0) + 1;
  if (!ultima?.fechaFin || !duracionDias)
    return { numero, fechaInicio: null, fechaFin: null };

  const fechaInicio = addDiasUTC(ultima.fechaFin, 1);
  return { numero, fechaInicio, fechaFin: addDiasUTC(fechaInicio, duracionDias - 1) };
}

/**
 * Round-robin por el método del círculo. Devuelve una lista de jornadas,
 * cada una con sus parejas [local, visitante]. Con equipos impares uno descansa
 * por jornada. Con ida y vuelta la segunda mitad espeja la primera con los
 * lados invertidos.
 */
export function generarRoundRobin<T>(equipos: T[], idaYVuelta: boolean): Array<Array<[T, T]>> {
  const arr: (T | null)[] = [...equipos];
  if (arr.length % 2 === 1) arr.push(null);
  const n = arr.length;
  const mitad = n / 2;
  const ida: Array<Array<[T, T]>> = [];

  for (let r = 0; r < n - 1; r++) {
    const jornada: Array<[T, T]> = [];
    for (let i = 0; i < mitad; i++) {
      const a = arr[i];
      const b = arr[n - 1 - i];
      if (a === null || b === null) continue;
      const aLocal = i === 0 ? r % 2 === 0 : (r + i) % 2 === 0;
      jornada.push(aLocal ? [a, b] : [b, a]);
    }
    ida.push(jornada);
    arr.splice(1, 0, arr.pop()!);
  }

  if (!idaYVuelta) return ida;
  const vuelta = ida.map((j) => j.map(([a, b]) => [b, a] as [T, T]));
  return [...ida, ...vuelta];
}

export type OcupacionJornadas = Map<number, Set<string>>;

/**
 * Menor jornada >= desde en la que ninguno de los dos equipos juega.
 * Si no existe entre las jornadas conocidas, devuelve numJornadas + 1.
 */
export function primeraJornadaLibre(
  ocupacion: OcupacionJornadas,
  numJornadas: number,
  a: string,
  b: string,
  desde = 1
): number {
  for (let j = Math.max(1, desde); j <= numJornadas; j++) {
    const eq = ocupacion.get(j);
    if (!eq || (!eq.has(a) && !eq.has(b))) return j;
  }
  return numJornadas + 1;
}

export function ocupar(ocupacion: OcupacionJornadas, jornada: number, a: string, b: string) {
  if (!ocupacion.has(jornada)) ocupacion.set(jornada, new Set());
  ocupacion.get(jornada)!.add(a).add(b);
}
