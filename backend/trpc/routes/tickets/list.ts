import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { db, tickets } from '@/backend/db';
import { eq } from 'drizzle-orm';

export const listTicketsProcedure = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    const userTickets = await db.query.tickets.findMany({
      where: eq(tickets.userId, input.userId),
    });

    return userTickets.map((ticket) => ({
      id: ticket.id,
      eventId: ticket.eventId,
      ticketTypeId: ticket.ticketTypeId,
      quantity: ticket.quantity,
      purchaseDate: new Date(ticket.purchaseDate),
      qrCode: ticket.qrCode,
      addedToCalendar: ticket.addedToCalendar,
      reminderSet: ticket.reminderSet,
    }));
  });
