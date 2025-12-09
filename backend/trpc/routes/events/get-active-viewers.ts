import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '@/backend/db';
import { eventViews } from '@/backend/db/schema';
import { eq, and, gt, count } from 'drizzle-orm';

export const getActiveViewers = publicProcedure
  .input(
    z.object({
      eventId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const result = await db
      .select({ count: count() })
      .from(eventViews)
      .where(
        and(
          eq(eventViews.eventId, input.eventId),
          gt(eventViews.lastActiveAt, fiveMinutesAgo)
        )
      )
      .get();

    return {
      eventId: input.eventId,
      activeViewers: result?.count || 0,
    };
  });
