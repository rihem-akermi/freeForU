import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'password',
  database: 'freeforu',
});

async function hashExistingPasswords() {
    // pour users 
  const usersResult = await pool.query('SELECT id, password FROM users');
  
  for (const user of usersResult.rows) {
    const hashed = await bcrypt.hash(user.password, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, user.id]);
  }

  //pour agents 
  const agentsResult = await pool.query('SELECT id, password FROM agents');

  for (const agent of agentsResult.rows) {
    const hashed = await bcrypt.hash(agent.password, 10);
    await pool.query('UPDATE agents SET password = $1 WHERE id = $2', [hashed, agent.id]);
  }

  await pool.end();
}

hashExistingPasswords();

// on le lance une seule fois juste car les previous passwords ne sont pas hashé 
// npx ts-node scripts/hash-existing-passwords.ts