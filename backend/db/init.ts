import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

export async function initDatabase() {
  const dbExists = existsSync('events.db');
  
  if (!dbExists) {
    console.log('🗄️  Database not found. Creating...');
    
    try {
      await execAsync('bun run backend/db/migrate.ts');
      console.log('✅ Database migrated');
      
      await execAsync('bun run backend/db/seed.ts');
      console.log('✅ Database seeded');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  } else {
    console.log('✅ Database already exists');
  }
}
