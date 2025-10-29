import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { db, tickets } from '@/backend/db';
import { eq } from 'drizzle-orm';

export const validateTicketProcedure = publicProcedure
  .input(z.object({ qrCode: z.string() }))
  .mutation(async ({ input }) => {
    const ticket = await db.query.tickets.findFirst({
      where: eq(tickets.qrCode, input.qrCode),
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    if (ticket.isUsed) {
      throw new Error('Ticket already used');
    }

    const validUntil = new Date(ticket.validUntil);
    if (validUntil < new Date()) {
      throw new Error('Ticket expired');
    }

    await db.update(tickets)
      .set({ isUsed: true })
      .where(eq(tickets.id, ticket.id));

    return { success: true, ticket };
  });
