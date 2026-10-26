import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- API Endpoints ---

// 1. Get the closest churches (Mock location services for now)
app.get('/api/churches/closest', async (req: Request, res: Response) => {
  try {
    const lat = req.query.lat as string;
    const lng = req.query.lng as string;

    // In a real application, you would use a geospatial query here (e.g., PostGIS or the Haversine formula)
    // For this prototype, we'll just return active churches
    const churches = await prisma.church.findMany({
      where: {
        isActive: true,
      },
    });

    res.json(churches);
  } catch (error) {
    console.error('Error fetching closest churches:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Get a church by ID
app.get('/api/churches/:id', async (req: Request, res: Response) => {
  try {
    const churchId = parseInt(req.params.id as string);
    const church = await prisma.church.findUnique({
      where: { id: churchId },
    });

    if (!church) {
      return res.status(404).json({ error: 'Church not found' });
    }

    res.json(church);
  } catch (error) {
    console.error('Error fetching church:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Get the latest active service for a church (For the QR Code landing page)
app.get('/api/churches/:id/services/latest', async (req: Request, res: Response) => {
  try {
    const churchId = parseInt(req.params.id as string);

    const latestService = await prisma.service.findFirst({
      where: {
        churchId: churchId,
        isActive: true
      },
      orderBy: {
        date: 'desc'
      },
      include: {
        items: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!latestService) {
      return res.status(404).json({ error: 'No active service found for this church' });
    }

    res.json(latestService);
  } catch (error) {
    console.error('Error fetching latest service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Basic health check endpoint
app.get('/', (req, res) => {
  res.send('Church Platform Backend is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
