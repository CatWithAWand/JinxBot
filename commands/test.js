module.exports = {
  name: `test`,
  description: `Test slash command.`,
  options: [
  ],
  usage: `/test`,
  devOnly: true,
  async execute(interaction) {
    const { Bot } = require(`../server`);
    return Bot.api.applications(Bot.user.id).guilds(interaction.guild_id).commands.post({ data: {
      name: `register`,
      description: `Register bot slash command(s) for this server.`,
      options: [
        {
          type: 3,
          name: `command`,
          description: `Register a specific slash command.`,
          default: false,
          required: false,
        },
      ],
    } })
      .catch((err) => {
        console.error(err);
      });
  },
};