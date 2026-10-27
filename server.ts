import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { CategorizeRequestSchema, ClutterAssistantRequestSchema } from './server/schemas/aiSchemas';
import { categorizeItem, generateClutterRecommendations } from './server/services/geminiService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

// Body parsing with size limit
app.use(express.json({ limit: '1mb' }));

// Health Check
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      aiConfigured: Boolean(process.env.GEMINI_API_KEY),
      model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    },
  });
});

// AI: Categorize Item
app.post('/api/v1/ai/categorize', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = CategorizeRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid categorization payload',
          details: parseResult.error.format(),
        },
      });
      return;
    }

    const result = await categorizeItem(parseResult.data);
    res.json({
      success: true,
      data: result.data,
      meta: {
        isAiGenerated: result.isAiGenerated,
      },
    });
  } catch (err) {
    next(err);
  }
});

// AI: Clutter Assistant Recommendations
app.post('/api/v1/ai/assistant', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = ClutterAssistantRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid assistant payload',
          details: parseResult.error.format(),
        },
      });
      return;
    }

    const result = await generateClutterRecommendations(parseResult.data);
    res.json({
      success: true,
      data: result.data,
      meta: {
        isAiGenerated: result.isAiGenerated,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Centralized error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An internal server error occurred',
    },
  });
});

// Mount Vite or static assets
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ClutterBox server running at http://0.0.0.0:${PORT} [${isProduction ? 'production' : 'development'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
