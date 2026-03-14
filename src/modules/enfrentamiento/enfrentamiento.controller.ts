import { EnfrentamientoAdapter } from './enfrentamiento.adapter';
import { ValidatedRequest } from "@/types/types";
import { ok } from "@/utils/ApiResponse";
import { EnfrentamientoService } from "./enfrentamiento.service";
import { AceptarRechazarResultadoBody, EnfrentamientoIDParam, GetLigaParam, ProponerResultadoBody } from 'recreativos-air-core/enfrentamiento';

export const EnfrentamientoController = {

  obtenerPorLiga: async (req: ValidatedRequest<GetLigaParam>) => {
    const { ligaId } = req.params;
    const enfrentamientos = await EnfrentamientoService.obtenerPorLiga(ligaId);
    return ok(EnfrentamientoAdapter.toDTOList(enfrentamientos), "Enfrentamientos obtenidos");
  },

  obtenerPendientesAdmin: async (_req: ValidatedRequest) => {
    const enfrentamientos = await EnfrentamientoService.obtenerPendientesAdmin();
    return ok(EnfrentamientoAdapter.toDTOList(enfrentamientos), "Enfrentamientos pendientes obtenidos");
  },

  getEnfrentamiento: async (req: ValidatedRequest<EnfrentamientoIDParam>) => {
    const { id:idEnfrentamiento } = req.params;
    const enfrentamiento = await EnfrentamientoService.obtenerEnfrentamiento(idEnfrentamiento);
    return ok(EnfrentamientoAdapter.toDTO(enfrentamiento), "Enfrentamiento obtenidos");
  },

  proponerResultado: async (
    req: ValidatedRequest<EnfrentamientoIDParam, ProponerResultadoBody>
  ) => {
    const { id: enfrentamientoId } = req.params;
    const { equipoId, partidos } = req.validated;

    const enf = await EnfrentamientoService.proponerResultado({
      enfrentamientoId,
      equipoId,
      partidos,
    });

    return ok(EnfrentamientoAdapter.toDTO(enf), "Resultado propuesto correctamente");
  },

  aceptarResultado: async (
    req: ValidatedRequest<EnfrentamientoIDParam, AceptarRechazarResultadoBody>
  ) => {
    const { id: enfrentamientoId } = req.validatedParams!;
    const { equipoId } = req.validated!;

    const enf = await EnfrentamientoService.aceptarResultado({
      enfrentamientoId,
      equipoId,
    });

    return ok(EnfrentamientoAdapter.toDTO(enf), "Resultado aceptado");
  },

  rechazarResultado: async (
    req: ValidatedRequest<EnfrentamientoIDParam, AceptarRechazarResultadoBody>
  ) => {
    const { id: enfrentamientoId } = req.validatedParams!;
    const { equipoId } = req.validated!;

    const enf = await EnfrentamientoService.rechazarResultado({
      enfrentamientoId,
      equipoId,
    });

    return ok(EnfrentamientoAdapter.toDTO(enf), "Resultado rechazado");
  },

  confirmarResultadoAdmin: async (
    req: ValidatedRequest<EnfrentamientoIDParam>
  ) => {
    const { id: enfrentamientoId } = req.validatedParams!;
    const enf = await EnfrentamientoService.confirmarResultadoAdmin(
      enfrentamientoId
    );
    return ok(EnfrentamientoAdapter.toDTO(enf), "Resultado confirmado por admin");
  },

  rechazarResultadoAdmin: async (
    req: ValidatedRequest<EnfrentamientoIDParam>
  ) => {
    const { id: enfrentamientoId } = req.validatedParams!;
    const enf = await EnfrentamientoService.rechazarResultadoAdmin(
      enfrentamientoId
    );
    return ok(EnfrentamientoAdapter.toDTO(enf), "Resultado confirmado por admin");
  },
};
