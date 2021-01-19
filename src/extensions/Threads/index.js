module.exports = {
  name: "Threads",
  helpCategory: "Threads",
  commands: [
    require("./controllers/commands/blacklist.js"),
    require("./controllers/commands/convertPublic.js"),
    require("./controllers/commands/create.js"),
    require("./controllers/commands/description.js"),
    require("./controllers/commands/invite.js"),
    require("./controllers/commands/keepThread.js"),
    require("./controllers/commands/leave.js"),
    require("./controllers/commands/users.js"),
    require("./controllers/commands/whitelist.js"),
  ],
  events: [],
  extends: [],
  structures: [],
  permissions: [],
};
