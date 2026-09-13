import { TemporadaDTO } from "recreativos-air-core/temporada";

const toFecha = (value: any): string | null =>
  value ? new Date(value).toISOString().slice(0, 10) : null;

export const TemporadaAdapter = {
  toDTO(temporada: any): TemporadaDTO {
    if (!temporada)
      throw new Error("TemporadaAdapter.toDTO: temporada is null or undefined");

    return {
      id: temporada._id.toString(),
      nombre: temporada.nombre,
      fechaInicio: toFecha(temporada.fechaInicio),
      fechaFin: toFecha(temporada.fechaFin),
      actual: !!temporada.actual,
      createdAt: temporada.createdAt,
    };
  },

  toDTOList(temporadas: any[]): TemporadaDTO[] {
    return temporadas.map((t) => this.toDTO(t));
  },
};
