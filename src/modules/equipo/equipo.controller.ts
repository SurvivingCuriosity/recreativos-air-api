import { EquipoAdapter } from './equipo.adapters';
import { ValidatedRequest } from "@/types/types";
import { ok } from "../../utils/ApiResponse";
import { EquipoService } from "./equipo.service";
import { CrearEquipoBody, GetEquiposDeUsuarioParams, InvitacionEquipoBody } from "recreativos-air-core/equipos";

export const EquipoController = {

  getAllEquipos: async () => {
    const equipos = await EquipoService.getAllEquipos();
    return ok(EquipoAdapter.toDTOList(equipos), "Equipos obtenidos");
  },

  crearEquipo: async (req: ValidatedRequest<any, CrearEquipoBody>) => {
    const idCreador = req.user!.id;
    const equipo = await EquipoService.crearEquipo({
      ...req.validated,
      creadorId: idCreador,
    });
    return ok(EquipoAdapter.toDTO(equipo), "Equipo creado");
  },

  obtenerEquiposUsuario: async (
    req: ValidatedRequest<GetEquiposDeUsuarioParams>
  ) => {
    const equipos = await EquipoService.obtenerEquiposUsuario(req.params.id);
    return ok(EquipoAdapter.toDTOList(equipos), "Equipos del usuario");
  },

  aceptarInvitacion: async (req: ValidatedRequest<InvitacionEquipoBody>) => {
    const { equipoId, aceptar } = req.validated;
    const idUser = req.user!.id;
    const result = await EquipoService.responderInvitacion(
      equipoId,
      idUser,
      aceptar
    );
    return ok(result, "Invitación actualizada");
  },

  obtenerEquipo: async (req: ValidatedRequest<GetEquiposDeUsuarioParams>) => {
    const equipo = await EquipoService.obtenerEquipoPorId(req.params.id);
    return ok(EquipoAdapter.toDTO(equipo), "Equipo obtenido");
  },
};
