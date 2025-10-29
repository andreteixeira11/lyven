import { db } from './index';
import { promoters, events, users, promoterAuth, promoterProfiles } from './schema';
import { mockEvents } from '@/mocks/events';

export async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  const adminUser = {
    id: 'user-admin-1',
    name: 'Administrador',
    email: 'admin',
    userType: 'admin' as const,
    interests: JSON.stringify([]),
    locationLatitude: null,
    locationLongitude: null,
    locationCity: null,
    locationRegion: null,
    preferencesNotifications: true,
    preferencesLanguage: 'pt' as const,
    preferencesPriceMin: 0,
    preferencesPriceMax: 1000,
    preferencesEventTypes: JSON.stringify([]),
    isOnboardingComplete: true,
  };

  try {
    await db.insert(users).values(adminUser).onConflictDoUpdate({
      target: users.email,
      set: adminUser,
    });
    console.log('✅ Admin user created/updated:', adminUser.email);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }

  try {
    const authResult = await db.insert(promoterAuth).values({
      id: 'auth-admin-1',
      email: 'admin',
      password: 'Lyven12345678',
      userId: adminUser.id,
    }).onConflictDoUpdate({
      target: promoterAuth.email,
      set: {
        password: 'Lyven12345678',
        userId: adminUser.id,
      },
    });
    console.log('✅ Admin auth created/updated - Username: admin, Password: Lyven12345678');
    console.log('📋 Auth result:', authResult);
  } catch (error) {
    console.error('❌ Error creating admin auth:', error);
    console.error('❌ Error details:', error);
  }

  const testPromoterUser = {
    id: 'user-promoter-teste',
    name: 'Promotor Teste',
    email: 'teste',
    userType: 'promoter' as const,
    interests: JSON.stringify(['music', 'festivals']),
    locationLatitude: 38.7223,
    locationLongitude: -9.1393,
    locationCity: 'Lisboa',
    locationRegion: 'Lisboa',
    preferencesNotifications: true,
    preferencesLanguage: 'pt' as const,
    preferencesPriceMin: 0,
    preferencesPriceMax: 1000,
    preferencesEventTypes: JSON.stringify(['music', 'festivals']),
    isOnboardingComplete: true,
  };

  try {
    await db.insert(users).values(testPromoterUser).onConflictDoUpdate({
      target: users.email,
      set: testPromoterUser,
    });
    console.log('✅ Test promoter user created/updated:', testPromoterUser.email);
  } catch (error) {
    console.error('❌ Error creating test promoter user:', error);
  }

  try {
    await db.insert(promoterAuth).values({
      id: 'auth-promoter-teste',
      email: 'teste',
      password: 'teste',
      userId: testPromoterUser.id,
    }).onConflictDoUpdate({
      target: promoterAuth.email,
      set: {
        password: 'teste',
        userId: testPromoterUser.id,
      },
    });
    console.log('✅ Test promoter auth created/updated - Email: teste, Password: teste');
  } catch (error) {
    console.error('❌ Error creating test promoter auth:', error);
  }

  try {
    await db.insert(promoterProfiles).values({
      id: 'profile-promoter-teste',
      userId: testPromoterUser.id,
      companyName: 'Teste Events',
      description: 'Promotora de eventos teste',
      website: 'https://teste.com',
      isApproved: true,
      approvalDate: new Date().toISOString(),
    }).onConflictDoUpdate({
      target: promoterProfiles.userId,
      set: {
        companyName: 'Teste Events',
        description: 'Promotora de eventos teste',
        website: 'https://teste.com',
        isApproved: true,
        approvalDate: new Date().toISOString(),
      },
    });
    console.log('✅ Test promoter profile created/updated');
  } catch (error) {
    console.error('❌ Error creating test promoter profile:', error);
  }

  const promoterData = [
    {
      id: 'p1',
      name: 'Live Nation Portugal',
      image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400',
      description: 'Promotora líder mundial em entretenimento ao vivo',
      verified: true,
      followersCount: 125000
    },
    {
      id: 'p2',
      name: 'Everything is New',
      image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400',
      description: 'Festivais e concertos únicos',
      verified: true,
      followersCount: 85000
    },
    {
      id: 'p3',
      name: 'Teatro Nacional',
      image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400',
      description: 'Espetáculos de teatro e dança',
      verified: true,
      followersCount: 45000
    },
    {
      id: 'p4',
      name: 'Comedy Club Lisboa',
      image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400',
      description: 'O melhor da comédia portuguesa',
      verified: false,
      followersCount: 12000
    }
  ];

  for (const promoter of promoterData) {
    await db.insert(promoters).values(promoter).onConflictDoNothing();
  }
  console.log('✅ Promoters seeded');

  for (const event of mockEvents) {
    await db.insert(events).values({
      id: event.id,
      title: event.title,
      artists: JSON.stringify(event.artists),
      venueName: event.venue.name,
      venueAddress: event.venue.address,
      venueCity: event.venue.city,
      venueCapacity: event.venue.capacity,
      date: event.date.toISOString(),
      endDate: event.endDate?.toISOString(),
      image: event.image,
      description: event.description,
      category: event.category,
      ticketTypes: JSON.stringify(event.ticketTypes),
      isSoldOut: event.isSoldOut,
      isFeatured: event.isFeatured,
      duration: event.duration,
      promoterId: event.promoter.id,
      tags: JSON.stringify(event.tags),
      instagramLink: event.socialLinks?.instagram,
      facebookLink: event.socialLinks?.facebook,
      twitterLink: event.socialLinks?.twitter,
      websiteLink: event.socialLinks?.website,
      latitude: event.coordinates?.latitude,
      longitude: event.coordinates?.longitude,
      status: 'published',
    }).onConflictDoNothing();
  }
  console.log('✅ Events seeded');

  const demoEvents = [
    {
      id: 'demo-1',
      title: 'Arctic Monkeys',
      artists: JSON.stringify([{ id: 'artist-1', name: 'Arctic Monkeys', genre: 'Rock', image: 'https://via.placeholder.com/100' }]),
      venueName: 'Coliseu dos Recreios',
      venueAddress: 'R. Portas de Santo Antão, 1150-268 Lisboa',
      venueCity: 'Lisboa',
      venueCapacity: 1500,
      date: new Date('2025-11-15T21:00:00').toISOString(),
      endDate: null,
      image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
      description: 'Show da banda britânica Arctic Monkeys em Lisboa',
      category: 'music' as const,
      ticketTypes: JSON.stringify([{ id: '1', name: 'Geral', price: 39, available: 250, maxPerPerson: 4 }]),
      isSoldOut: false,
      isFeatured: false,
      duration: 180,
      promoterId: 'p1',
      tags: JSON.stringify(['música', 'rock']),
      instagramLink: null,
      facebookLink: null,
      twitterLink: null,
      websiteLink: null,
      latitude: 38.7223,
      longitude: -9.1393,
      status: 'published' as const,
    },
    {
      id: 'demo-2',
      title: 'Festival NOS Alive 2025',
      artists: JSON.stringify([]),
      venueName: 'Passeio Marítimo de Algés',
      venueAddress: 'Passeio Marítimo de Algés, 1495-165 Algés',
      venueCity: 'Algés',
      venueCapacity: 55000,
      date: new Date('2025-12-10T16:00:00').toISOString(),
      endDate: null,
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
      description: 'O maior festival de música do verão',
      category: 'festival' as const,
      ticketTypes: JSON.stringify([{ id: '1', name: 'Geral', price: 90, available: 40000, maxPerPerson: 6 }]),
      isSoldOut: false,
      isFeatured: false,
      duration: 720,
      promoterId: 'p1',
      tags: JSON.stringify(['festival', 'música', 'verão']),
      instagramLink: null,
      facebookLink: null,
      twitterLink: null,
      websiteLink: null,
      latitude: 38.6931,
      longitude: -9.2369,
      status: 'published' as const,
    },
    {
      id: 'demo-3',
      title: 'Concerto na MEO Arena',
      artists: JSON.stringify([]),
      venueName: 'MEO Arena',
      venueAddress: 'Rossio dos Olivais, 1990-231 Lisboa',
      venueCity: 'Lisboa',
      venueCapacity: 12000,
      date: new Date('2026-01-20T20:00:00').toISOString(),
      endDate: null,
      image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800',
      description: 'Grande evento musical na MEO Arena',
      category: 'music' as const,
      ticketTypes: JSON.stringify([{ id: '1', name: 'Geral', price: 45, available: 12000, maxPerPerson: 4 }]),
      isSoldOut: false,
      isFeatured: false,
      duration: 150,
      promoterId: 'p1',
      tags: JSON.stringify(['música', 'concerto']),
      instagramLink: null,
      facebookLink: null,
      twitterLink: null,
      websiteLink: null,
      latitude: 38.7684,
      longitude: -9.0937,
      status: 'published' as const,
    },
  ];

  for (const event of demoEvents) {
    await db.insert(events).values(event).onConflictDoNothing();
  }
  console.log('✅ Demo events seeded');

  console.log('🎉 Database seeding completed!');
}
