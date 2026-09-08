require('dotenv').config();

const bcrypt = require('bcryptjs');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');

const [email, newPassword] = process.argv.slice(2);

if (!email || !newPassword || newPassword.length < 8) {
  console.error('Usage: node src/scripts/resetAdminPassword.js <email> <new-password>');
  console.error('The new password must be at least 8 characters long.');
  process.exit(1);
}

(async () => {
  await connectDB();

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    console.error(`No user found with email "${email}".`);
    await disconnectDB();
    process.exit(1);
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  // Optionally promote: useful on a fresh deployment where the seed admin should own the shop
  if (user.role !== 'admin') {
    await User.updateOne({ _id: user._id }, { role: 'admin' });
    console.log(`Promoted ${email} to admin.`);
  }

  console.log(`Password updated for ${email}.`);
  await disconnectDB();
  process.exit(0);
})().catch(async (err) => {
  console.error('Reset failed:', err.message);
  await disconnectDB().catch(() => {});
  process.exit(1);
});