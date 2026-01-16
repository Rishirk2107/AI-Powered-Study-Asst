const cron = require('node-cron');
const Schedule = require('./models/Calendar');

// Runs every day at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    const now = new Date();
    // Find all schedule entries that are overdue and not completed
    const overdue = await Schedule.find({
      completed: false,
      date: { $lt: now },
      delayed: false
    });
    if (overdue.length > 0) {
      const ids = overdue.map(e => e._id);
      await Schedule.updateMany(
        { _id: { $in: ids } },
        { $set: { delayed: true } }
      );
      console.log(`Marked ${ids.length} schedule entries as delayed.`);
    }
  } catch (err) {
    console.error('Cron job error:', err);
  }
});

module.exports = cron;
