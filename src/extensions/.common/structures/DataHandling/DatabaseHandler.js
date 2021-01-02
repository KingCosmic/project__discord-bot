const quickDB = require("quick.db");

console.log("REQUIRED");
module.exports = class DatabaseHandler {
  constructor(guildId) {
    this.guildId = guildId;
    this.beans = new BeanHandler();
    this.reminder = new ReminderHandler();
  }
};

class BeanHandler {
  constructor() {}

  getUserDevBeans(userId) {
    return quickDB.get(`account.${userId}.devBeans`);
  }

  getUserGoldenBeans(userId) {
    return quickDB.get(`account.${userId}.goldenBeans`);
  }

  getUserForeverDevBeans(userId) {
    return quickDB.get(`account.${userId}.foreverDevBeans`);
  }

  getUserForeverGoldenBeans(userId) {
    return quickDB.get(`account.${userId}.foreverGoldenBeans`);
  }

  addUserDevBeans(userId, num) {
    quickDB.add(`account.${userId}.devBeans`, num || 1);
    this.addUserForeverDevBeans(userId, num);
  }

  addUserGoldenBeans(userId, num) {
    quickDB.add(`account.${userId}.goldenBeans`, num || 1);
    this.addUserForeverGoldenBeans(userId, num);
  }

  addUserForeverDevBeans(userId, num) {
    quickDB.add(`account.${userId}.foreverDevBeans`, num || 1);
  }

  addUserForeverGoldenBeans(userId, num) {
    quickDB.add(`account.${userId}.foreverGoldenBeans`, num || 1);
  }

  removeUserDevBeans(userId, num) {
    quickDB.remove(`account.${userId}.devBeans`, num || 1);
    this.removeUserForeverDevBeans(userId, num);
  }

  removeUserGoldenBeans(userId, num) {
    quickDB.remove(`account.${userId}.goldenBeans`, num || 1);
    this.removeUserForeverGoldenBeans(userId, num);
  }

  removeUserForeverDevBeans(userId, num) {
    quickDB.remove(`account.${userId}.foreverDevBeans`, num || 1);
  }

  removeUserForeverGoldenBeans(userId, num) {
    quickDB.remove(`account.${userId}.foreverGoldenBeans`, num || 1);
  }

  getUserLastDevBeanGiven(userId) {
    return quickDB.get(`lastDevBean.${userId}`);
  }

  setUserLastDevBeanGiven(userId) {
    quickDB.set(`lastDevBean.${userId}`, Date.now());
  }
}

class ReminderHandler {
  constructor() {}

  getReminders() {
    return quickDB.get(`reminders`);
  }

  addReminder(reminder) {
    quickDB.push(`reminders`, reminder);
  }

  removeReminder(reminder) {
    let reminders = this.getReminders();
    let filtered = reminders.filter((entry) => {
      return entry.id != reminder.id;
    });
    this.setReminders(filtered);
  }

  setReminders(reminders) {
    quickDB.set(`reminders`, reminders);
  }

  clearReminders() {
    quickDB.set(`reminders`, []);
  }
}

//module.exports = new DatabaseHandler();
