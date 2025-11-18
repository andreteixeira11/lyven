import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { initDatabase } from "./db/init";
import { seedDatabase } from "./db/seed";
import { seedNormalUser } from "./db/seed-normal-user";
import { readFileSync } from "fs";
import { join } from "path";

console.log('🚀 Initializing backend server...');

initDatabase().then(() => {
  console.log('✅ Database initialized successfully');
}).catch((err) => {
  console.error('❌ Database initialization failed:', err);
});

const app = new Hono();

app.use("*", cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
    onError({ error, path }) {
      console.error('❌ tRPC error on', path, ':', error);
    },
  })
);

app.get("/", (c) => {
  console.log('🏠 Root endpoint accessed');
  return c.json({ status: "ok", message: "API is running", timestamp: new Date().toISOString() });
});

app.get("/api", (c) => {
  console.log('📡 /api endpoint accessed');
  return c.json({ status: "ok", message: "API endpoint is working", timestamp: new Date().toISOString() });
});

app.get("/api/health", async (c) => {
  console.log('💚 Health check accessed');
  
  let dbStatus = "unknown";
  let dbError: string | null = null;
  
  try {
    const { db, users } = await import('./db/index');
    const result = await db.select().from(users).limit(1);
    dbStatus = "connected";
    console.log('✅ Database connection successful, users found:', result.length);
  } catch (error) {
    dbStatus = "error";
    dbError = error instanceof Error ? error.message : String(error);
    console.error('❌ Database connection failed:', error);
  }
  
  const response = { 
    status: dbStatus === "connected" ? "ok" : "degraded", 
    message: dbStatus === "connected" ? "Backend is running" : "Backend is running but database has issues",
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      error: dbError
    },
    endpoints: {
      trpc: "/api/trpc",
      health: "/api/health",
      test: "/api/test-login"
    }
  };
  
  console.log('💚 Sending health response:', JSON.stringify(response));
  
  return c.json(response);
});

app.get("/health", (c) => {
  console.log('💚 Health check accessed (alt route)');
  return c.json({ 
    status: "ok", 
    message: "Backend is running",
    timestamp: new Date().toISOString() 
  });
});

app.post("/api/test-login", async (c) => {
  console.log('🧪 [TEST] Rota de teste de login chamada');
  try {
    const body = await c.req.json();
    console.log('🧪 [TEST] Body recebido:', body);
    return c.json({ 
      status: "ok", 
      message: "Test endpoint working",
      received: body 
    });
  } catch (error) {
    console.error('❌ [TEST] Erro:', error);
    return c.json({ error: 'Failed to parse body' }, 400);
  }
});

app.post("/seed", async (c) => {
  console.log('🌱 Seed endpoint accessed');
  try {
    await seedDatabase();
    console.log('✅ Database seeded successfully');
    return c.text('Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seed error:', error);
    return c.json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

app.post("/seed-normal-user", async (c) => {
  console.log('🌱 Seed normal user endpoint accessed');
  try {
    await seedNormalUser();
    console.log('✅ Normal user seeded successfully');
    return c.json({ success: true, message: 'Normal user created successfully!' });
  } catch (error) {
    console.error('❌ Seed normal user error:', error);
    return c.json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

app.get("/event/:id", async (c) => {
  console.log('🎫 Event page accessed:', c.req.param('id'));
  try {
    const eventId = c.req.param('id');
    const { db, events } = await import('./db/index');
    const { eq } = await import('drizzle-orm');
    
    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    if (!event) {
      return c.html('<h1>Evento não encontrado</h1>');
    }

    let htmlTemplate = readFileSync(join(__dirname, 'views', 'event-page.html'), 'utf-8');
    
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('pt-PT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const ticketTypes = JSON.parse(event.ticketTypes);
    const minPrice = Math.min(...ticketTypes.map((t: any) => t.price));
    const maxPrice = Math.max(...ticketTypes.map((t: any) => t.price));
    const priceRange = minPrice === maxPrice ? `${minPrice}€` : `${minPrice}€ - ${maxPrice}€`;

    htmlTemplate = htmlTemplate.replace(/{{EVENT_ID}}/g, event.id);
    htmlTemplate = htmlTemplate.replace(/{{EVENT_TITLE}}/g, event.title);
    htmlTemplate = htmlTemplate.replace(/{{EVENT_DESCRIPTION}}/g, event.description || 'Descobre este incrível evento!');
    htmlTemplate = htmlTemplate.replace(/{{EVENT_IMAGE}}/g, event.image || '');
    htmlTemplate = htmlTemplate.replace(/{{EVENT_DATE}}/g, formattedDate);
    htmlTemplate = htmlTemplate.replace(/{{EVENT_VENUE}}/g, `${event.venueName}, ${event.venueCity}`);
    htmlTemplate = htmlTemplate.replace(/{{EVENT_PRICE}}/g, priceRange);

    return c.html(htmlTemplate);
  } catch (error) {
    console.error('❌ Event page error:', error);
    return c.html('<h1>Erro ao carregar evento</h1>');
  }
});

app.onError((err, c) => {
  console.error('❌ Backend error:', err);
  console.error('❌ Stack:', err.stack);
  return c.json({ 
    error: err.message, 
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
  }, 500);
});

export default app;
