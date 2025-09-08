import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { addDays, isBefore } from 'date-fns';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const prisma = new PrismaClient();

app.use(cors({ origin: (process.env.CORS_ORIGIN?.split(',') ?? '*') as any }));
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));

app.get('/raw', async (_req: Request, res: Response) => {
  const filePath = path.join('/app', 'data', 'fire_inspection.json');
  const json = await fs.readFile(filePath, 'utf-8');
  res.type('application/json').send(json);
});

app.get('/api/v1/stats', async (_req: Request, res: Response) => {
  const now = new Date();
  const total = await prisma.activity.count();
  const pendentes = await prisma.activity.count({ where: { status: 'pendente' } });
  const atrasadas = await prisma.activity.count({ where: { nextInspection: { lt: now } } });
  const proximas7d = await prisma.activity.count({
    where: { nextInspection: { gte: now, lte: addDays(now, 7) } }
  });
  const comAlerta = await prisma.activity.count({ where: { alert: { not: null } } });

  res.json({ total, pendentes, atrasadas, proximas7d, comAlerta });
});

app.get('/api/v1/inspections', async (req: Request, res: Response) => {
  const q = req.query.q as string | undefined;
  const status = req.query.status as string | undefined;
  const due = req.query.due as string | undefined;
  const client = req.query.client as string | undefined;
  const area = req.query.area as string | undefined;
  const type = req.query.type as string | undefined;

  const now = new Date();
  const where: any = {
    ...(status ? { status } : {}),
    ...(type ? { equipment: { type } } : {}),
    ...(client ? { equipment: { area: { client: { name: { contains: client, mode: 'insensitive' } } } } } : {}),
    ...(area ?   { equipment: { area:  { name: { contains: area,  mode: 'insensitive' } } } } : {}),
    ...(q ?      { OR: [
                    { description: { contains: q, mode: 'insensitive' } },
                    { alert:       { contains: q, mode: 'insensitive' } },
                    { equipment: {
                        OR: [
                          { name: { contains: q, mode: 'insensitive' } },
                          { type: { contains: q, mode: 'insensitive' } }
                        ]
                      } }
                  ] } : {})
  };

  if (due === 'overdue') where.nextInspection = { lt: now };
  if (due === 'next7d')  where.nextInspection = { gte: now, lte: addDays(now, 7) };

  const rows = await prisma.activity.findMany({
    where,
    include: { equipment: { include: { area: { include: { client: true } } } } },
    orderBy: [{ nextInspection: 'asc' }]
  });

  res.json(rows.map((r: { id: any; status: any; alert: any; nextInspection: any; equipment: { name: any; type: any; area: { name: any; latitude: any; longitude: any; client: { name: any; address: any; }; }; }; }) => ({
    id: r.id,
    status: r.status,
    alert: r.alert,
    nextInspection: r.nextInspection,
    equipment: { name: r.equipment.name, type: r.equipment.type },
    area: { name: r.equipment.area.name, latitude: r.equipment.area.latitude, longitude: r.equipment.area.longitude },
    client: { name: r.equipment.area.client.name, address: r.equipment.area.client.address },
    urgency:
      r.alert ? 'critical'
      : (r.nextInspection && isBefore(r.nextInspection, now)) ? 'overdue'
      : (r.nextInspection && isBefore(r.nextInspection, addDays(now,7))) ? 'soon'
      : 'normal'
  })));
});

app.get('/api/v1/clients', async (_req: Request, res: Response) => {
  const clients = await prisma.client.findMany({
    include: { areas: { include: { equipments: { include: { activity: true } } } } }
  });
  res.json(clients);
});

const port = process.env.API_PORT || 3000;
app.listen(port, () => console.log(`API on :${port}`));
