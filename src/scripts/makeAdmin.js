require('dotenv').config();

const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');

// Promotes an existing account to admin.
//
// Registration always creates customers — the role is never read from the
// request body, so there is no way to self-promote through the API. That is
// deliberate, which means granting admin has to happen here.
//
// Usage:
//   node src/scripts/makeAdmin.js you@example.com
//   node src/scripts/makeAdmin.js --list          show current admins

const args = process.argv.slice(2);
const LIST = args.includes('--list');
const email = args.find((a) => !a.startsWith('--'));

async function run() {
  await connectDB();

  if (LIST) {
    const admins = await User.find({ role: 'admin' }).select('email firstName lastName');
    if (admins.length === 0) {
      console.log('No admin accounts exist yet.');
    } else {
      console.log(`${admins.length} admin account(s):`);
      admins.forEach((a) => console.log(`  ${a.email}  (${a.firstName} ${a.lastName})`));
    }
    return;
  }

  if (!email) {
    console.log('Usage: node src/scripts/makeAdmin.js <email>');
    console.log('       node src/scripts/makeAdmin.js --list');
    return;
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    console.log(`No account found for ${email}.`);
    console.log('Register through the site first, then run this again.');
    process.exitCode = 1;
    return;
  }

  if (user.role === 'admin') {
    console.log(`${user.email} is already an admin.`);
    return;
  }

  await User.updateOne({ _id: user._id }, { role: 'admin' });
  console.log(`${user.email} is now an admin.`);
  console.log('Sign out and sign back in — the role is baked into your access token.');
}

run()
  .catch((err) => {
    console.error('Failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
  });
