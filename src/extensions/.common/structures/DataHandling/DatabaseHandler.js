const quickDB = require("quick.db");
const ReactionRole = require("../../../ReactionRoles/structures/ReactionRole.js");

class DatabaseHandler {
  constructor() {
    this.bean = new BeanHandler();
    this.reminder = new ReminderHandler();
    this.reactionRoles = new ReactionRolesHandler();
  }
}

class BeanHandler {
  constructor() {}

  getUserDevBeans(userId) {
    return quickDB.get(`account.${target.user.id}.devBeans`);
  }

  getUserGoldenBeans(userId) {
    return quickDB.get(`account.${target.user.id}.goldenBeans`);
  }

  getUserForeverDevBeans(userId) {
    return quickDB.get(`account.${target.user.id}.foreverDevBeans`);
  }

  getUserForeverGoldenBeans(userId) {
    return quickDB.get(`account.${target.user.id}.foreverGoldenBeans`);
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
      return !(
        entry.sentAt === reminder._sentAt && entry.userId === reminder._userId
      );
    });
    this.setReminders(filtered);
  }

  setReminders(reminders) {
    quickDB.set(`reminders`, reminders);
    return reminders;
  }

  getUserReminders(user) {
    return quickDB.get(`reminders`).filter((entry) => {
      return entry.userId == user.id;
    });
  }

  popUserReminder(user) {
    // Using global stack to emulate individual user stacks
    let reminders = this.getReminders();
    let reminder;
    for (let i = reminders.length - 1; i >= 0; i--) {
      if (user.id == reminders[i].userId) {
        console.log("FOUND REMINDER");
        reminder = reminders.splice(i, 1)[0];
        break;
      }
    }
    this.setReminders(reminders);
    return reminder;
  }

  clearReminders() {
    quickDB.set(`reminders`, []);
  }
}

class ReactionRolesHandler {
  constructor() {}

  getReactionRoles(guildId) {
    return quickDB.get(`reactionRoles.${guildId}`);
  }

  async addReactionRole(client, guildId, channelId, messageId, reactionRole) {
    let allReactionRoles = this.getReactionRoles(guildId);
    if (!allReactionRoles) allReactionRoles = [];

    allReactionRoles.push({
      guildId: guildId,
      channelId: channelId,
      messageId: messageId,
      reactionRoles: reactionRole,
    });
    new ReactionRole(client, guildId, channelId, messageId, reactionRole);

    quickDB.set(`reactionRoles.${guildId}`, allReactionRoles);
  }
}
module.exports = new DatabaseHandler();
