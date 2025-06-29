const cron = require('node-cron');
const { exec } = require('child_process');

console.log('🕒 Email Scheduler is running...');

// Schedule to run every day at 9:00 AM
cron.schedule('0 9 * * *', () => {
  console.log('📨 Running emailScheduler.js at 9:00 AM...');
  exec('node emailScheduler.js', (err, stdout, stderr) => {
    if (err) {
      console.error('❌ Error running emailScheduler.js:', err.message);
      return;
    }
    console.log(stdout);
    if (stderr) console.error(stderr);
  });
});
