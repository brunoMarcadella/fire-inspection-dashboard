import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

type Raw = {
  clientes: Array<{
    nome: string; endereco: string; latitude: number; longitude: number;
    areas: Array<{
      nome: string; latitude: number; longitude: number;
      equipamentos: Array<{
        nome: string; tipo: string;
        atividade: {
          data: string | null;
          descricao: string | null;
          data_inicio: string | null;
          data_finalizacao: string | null;
          status: 'pendente' | 'concluida';
          data_proxima_inspecao: string | null;
          alerta: string | null;
        }
      }>
    }>
  }>
};

function toDateOrNull(v: string | null) {
  return v ? new Date(v) : null;
}

(async () => {
  try {
    const filePath = path.join('/app', 'data', 'fire_inspection.json');
    const raw = JSON.parse(await fs.readFile(filePath, 'utf-8')) as Raw;

    // idempotente: limpa e reimporta
    await prisma.activity.deleteMany();
    await prisma.equipment.deleteMany();
    await prisma.area.deleteMany();
    await prisma.client.deleteMany();

    for (const c of raw.clientes) {
      const client = await prisma.client.create({
        data: {
          name: c.nome,
          address: c.endereco,
          latitude: c.latitude,
          longitude: c.longitude
        }
      });

      for (const a of c.areas) {
        const area = await prisma.area.create({
          data: {
            name: a.nome,
            latitude: a.latitude,
            longitude: a.longitude,
            clientId: client.id
          }
        });

        for (const e of a.equipamentos) {
          const equip = await prisma.equipment.create({
            data: { name: e.nome, type: e.tipo, areaId: area.id }
          });

          const act = e.atividade;
          await prisma.activity.create({
            data: {
              equipmentId: equip.id,
              description: act.descricao ?? undefined,
              date: toDateOrNull(act.data),
              startDate: toDateOrNull(act.data_inicio),
              endDate: toDateOrNull(act.data_finalizacao),
              status: act.status as any,
              nextInspection: toDateOrNull(act.data_proxima_inspecao),
              alert: act.alerta ?? undefined
            }
          });
        }
      }
    }

    console.log('Seed OK');
  } catch (err) {
    console.error('Seed error', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
