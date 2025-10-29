import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { db, events, promoters, users } from '@/backend/db';
import { eq } from 'drizzle-orm';
import { sendNotification } from '@/backend/lib/send-notification';

export const approveEventProcedure = publicProcedure
  .input(
    z.object({
      eventId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log('✅ Aprovando evento:', input.eventId);

    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, input.eventId))
      .limit(1);

    if (!event || event.length === 0) {
      throw new Error('Evento não encontrado');
    }

    const result = await db
      .update(events)
      .set({ status: 'published' })
      .where(eq(events.id, input.eventId))
      .returning();

    const promoter = await db
      .select()
      .from(promoters)
      .where(eq(promoters.id, event[0].promoterId))
      .limit(1);

    if (promoter && promoter.length > 0) {
      const promoterUser = await db
        .select()
        .from(users)
        .where(eq(users.userType, 'promoter'))
        .limit(1);

      if (promoterUser.length > 0) {
        await sendNotification({
          userId: promoterUser[0].id,
          type: 'event_approved',
          title: 'Evento Aprovado! 🎉',
          message: `O seu evento "${event[0].title}" foi aprovado e está agora publicado.`,
          data: {
            eventId: input.eventId,
            eventTitle: event[0].title,
          },
        });
        console.log('🔔 Notificação de aprovação enviada');
      }
    }

    return result[0];
  });
