const Discord = require("discord.js");

class ReactionRole {
  constructor(client, guildId, channelId, messageId, reactionRoles) {
    this._client = client;
    this._guildId = guildId;
    this._channelId = channelId;
    this._messageId = messageId;
    this._reactionRole = reactionRoles;
    this.reactToMessage();
  }

  async reactToMessage() {
    let guild = this._client.guilds.resolve(this._guildId);
    let channel = guild.channels.resolve(this._channelId);
    let message = await channel.messages.fetch(this._messageId);
    message.react(this._reactionRole.reaction);
  }
}

module.exports = ReactionRole;
