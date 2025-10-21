import { Types } from "mongoose";
import { EnfrentamientoDocConEquipos } from "../enfrentamiento/enfrentamiento.model";
import { LigaDocConEquipos } from "./liga.repository";
import { EstadoEquipoEnLiga } from "recreativos-air-core/liga";

export const LigaClasificacionHelper = {
  calcular(
    liga: LigaDocConEquipos,
    enfrentamientos: EnfrentamientoDocConEquipos[]
  ) {

    const equiposConfirmados = liga.equipos.filter(
      (e) => e.estado === EstadoEquipoEnLiga.Aprobado
    );

    type TableRows = {
      equipoId: string;
      nombre: string;
      jj: number;
      pp: number;
      gf: number;
      gc: number;
      pts: number;
    };

    const tabla = new Map<string, TableRows>();

    for (const e of equiposConfirmados) {
      const equipo = e.equipo;
      const equipoId =
        equipo instanceof Types.ObjectId
          ? equipo.toString()
          : (equipo as any)._id.toString();

      tabla.set(equipoId, {
        equipoId,
        nombre: (equipo as any).nombre ?? "",
        jj: 0,
        pp: 0,
        gf: 0,
        gc: 0,
        pts: 0,
      });
    }

    for (const enf of enfrentamientos) {
      const equipoAId =
        enf.equipoA instanceof Types.ObjectId
          ? enf.equipoA.toString()
          : (enf.equipoA as any)._id.toString();

      const equipoBId =
        enf.equipoB instanceof Types.ObjectId
          ? enf.equipoB.toString()
          : (enf.equipoB as any)._id.toString();

      const eqA = tabla.get(equipoAId);
      const eqB = tabla.get(equipoBId);
      if (!eqA || !eqB) continue;

      eqA.jj += 1;
      eqB.jj += 1;

      let puntosA = 0;
      let puntosB = 0;
      let gfA = 0;
      let gfB = 0;
      let gcA = 0;
      let gcB = 0;

      let index = 0
      for (const p of enf.partidos ?? []) {
        index++
        console.log('Recorriendo partido: ', index)
        console.log(p)
        
        if (p.golesA > p.golesB) {
          console.log(index+ 'Punto para A')
          puntosA += 1;
        }
        else if (p.golesB > p.golesA) {
          console.log(index+ 'Punto para B')
          puntosB += 1;
        }

        gfA += p.golesA;
        gfB += p.golesB;
        gcA += p.golesB;
        gcB += p.golesA;
      }

      eqA.gf += gfA;
      eqA.gc += gcA;
      eqB.gf += gfB;
      eqB.gc += gcB;

      eqA.pts += puntosA;
      eqB.pts += puntosB;

      eqA.pp += puntosB;
      eqB.pp += puntosA;
    }

    return Array.from(tabla.values())
      .sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        const diffA = a.gf - a.gc;
        const diffB = b.gf - b.gc;
        if (diffB !== diffA) return diffB - diffA;
        return a.nombre.localeCompare(b.nombre);
      })
      .map((e, i) => ({ pos: i + 1, ...e }));
  },
};
