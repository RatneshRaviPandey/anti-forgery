const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function seed() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:Infometa2026!@localhost:5433/infometa'
  });

  const hash = bcrypt.hashSync('Admin@Infometa2026', 12);
  console.log('Password hash generated');

  // Super Admin
  await pool.query(
    `INSERT INTO brand_users (id, brand_id, email, name, password_hash, role, is_active, email_verified, is_super_admin, password_changed_at)
     VALUES ($1,$2,$3,$4,$5,$6,true,true,true,NOW())
     ON CONFLICT (email) DO NOTHING`,
    ['d0000000-0000-4000-a000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'admin@infometa.in', 'Super Admin', hash, 'owner']
  );
  console.log('Created: admin@infometa.in (Super Admin)');

  // Amul brand owner
  await pool.query(
    `INSERT INTO brand_users (id, brand_id, email, name, password_hash, role, is_active, email_verified, is_super_admin, password_changed_at)
     VALUES ($1,$2,$3,$4,$5,$6,true,true,false,NOW())
     ON CONFLICT (email) DO NOTHING`,
    ['d0000000-0000-4000-a000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'admin@amul.coop', 'Amul Admin', hash, 'owner']
  );
  console.log('Created: admin@amul.coop (Brand Owner)');

  const res = await pool.query('SELECT email, name, role, is_super_admin FROM brand_users');
  console.table(res.rows);

  await pool.end();
}

seed().catch(err => { console.error(err); process.exit(1); });
