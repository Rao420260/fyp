import pool from '../config/db.js'

const [managers] = await pool.query(
  "SELECT id FROM users WHERE email = 'manager@postflow.com'"
)
if (managers.length === 0) {
  console.log('Pehle ye chalao: node src/scripts/seedUsers.js')
  await pool.end()
  process.exit(1)
}
const ownerId = managers[0].id

// Demo accounts (asli connection B8 me banega)
const demoAccounts = [
  { platform: 'facebook', name: "Fatima's Business Page", externalId: 'demo-facebook-1' },
  { platform: 'instagram', name: 'fatima.business', externalId: 'demo-instagram-1' },
  { platform: 'linkedin', name: 'Shanza Imran', externalId: 'demo-linkedin-1' },
]

for (const a of demoAccounts) {
  const [result] = await pool.query(
    'INSERT IGNORE INTO social_accounts (user_id, platform, account_name, external_account_id) VALUES (?, ?, ?, ?)',
    [ownerId, a.platform, a.name, a.externalId]
  )
  console.log(result.affectedRows ? `Created: ${a.platform}` : `Already exists: ${a.platform}`)
}

await pool.end()