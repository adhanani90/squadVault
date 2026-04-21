// tests/setup.test.js
const {resetDB} = require('./testHelper')

// 1. Delete test users/clubs/players you create
// 2. (optional) Additional cleanup
// 3. The seeded clubs/players remain untouched

module.exports = async () => {
  console.log('\n--- Global Setup: Seeding Test Database ---');
  try {
    await resetDB();
    console.log('--- Database Ready ---\n');
  } catch (err) {
    console.error('Failed to seed database:', err);
    process.exit(1); // Stop tests if DB fails
  }
};