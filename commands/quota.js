const { reply } = require(`../utils/reply`);
const { infoEmbed } = require(`../utils/embeds`);

module.exports = {
  name: `quota`,
  description: `Displays the current Speech Services quota limit.`,
  options: [
  ],
  usage: `/quota`,
  async execute(interaction) {
    const { Bot: { config } } = require(`../server`);
    const infoEmbed1 = infoEmbed();

    infoEmbed1.setDescription(`Speech quota usage: ${config.speech_quota_usage}/450000 (characters)`);
    return reply(interaction, { type: 4, embeds: [infoEmbed1] });
  },
};