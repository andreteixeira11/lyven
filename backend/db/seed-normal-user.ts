import { db } from './index';
import { users, promoterAuth } from './schema';

export async function seedNormalUser() {
  console.log('🌱 Creating normal test user...');

  const normalUser = {
    id: 'user-normal-test',
    name: 'Utilizador Teste',
    email: 'user',
    userType: 'normal' as const,
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
    await db.insert(users).values(normalUser).onConflictDoUpdate({
      target: users.email,
      set: normalUser,
    });
    console.log('✅ Normal user created/updated:', normalUser.email);
  } catch (error) {
    console.error('❌ Error creating normal user:', error);
  }

  try {
    await db.insert(promoterAuth).values({
      id: 'auth-normal-test',
      email: 'user',
      password: 'user',
      userId: normalUser.id,
    }).onConflictDoUpdate({
      target: promoterAuth.email,
      set: {
        password: 'user',
        userId: normalUser.id,
      },
    });
    console.log('✅ Normal user auth created/updated - Email: user, Password: user');
  } catch (error) {
    console.error('❌ Error creating normal user auth:', error);
  }

  console.log('🎉 Normal user seeding completed!');
  console.log('\n📝 Credentials:');
  console.log('Email: user');
  console.log('Password: user');
}

if (require.main === module) {
  seedNormalUser()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
