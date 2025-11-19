import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { PrismaClient, Prisma } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// servir frontend
app.use('/', express.static(path.join(__dirname, '..', 'public')));

// healthcheck (antes de listen)
app.get('/health', (_req, res) => res.status(200).send('ok'));

/** GET /api/items -> lista todos */
app.get('/api/items', async (_req: Request, res: Response) => {
    const items = await prisma.item.findMany({ orderBy: { id: 'asc' } });
    res.json(items);
});

/** GET /api/items/:id -> consulta individual */
app.get('/api/items/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) return res.status(404).json({ ok: false, msg: 'No encontrado' });
    res.json(item);
});

/** POST /api/items -> agregar */
app.post('/api/items', async (req: Request, res: Response) => {
    const { name, price, stock, mediaUrl } = req.body;

    const item = await prisma.item.create({
        data: { name, price, stock, mediaUrl }
    });

    res.json(item);
});

/** PUT /api/items/:id -> editar */
app.put('/api/items/:id', async (req: Request, res: Response) => {
    const { name, price, stock, mediaUrl } = req.body;
    const id = Number(req.params.id);

    const item = await prisma.item.update({
        where: { id },
        data: { name, price, stock, mediaUrl }
    });

    res.json(item);
});

/** DELETE /api/items/:id -> eliminar */
app.delete('/api/items/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
        await prisma.item.delete({ where: { id } });
        res.json({ ok: true });
    } catch {
        res.status(404).json({ ok: false, msg: 'No encontrado' });
    }
});

// arranque (una sola vez, con 0.0.0.0)
const port = Number(process.env.PORT || 3000);
app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor listo en puerto ${port}`);
});

// opcional: cierre ordenado de Prisma
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
