const { voiceReply } = require(`../utils/reply`);
const speechSynthesis = require(`../speech/speechSynthesis`);

module.exports = {
  name: `drop_from_team`,
  intentID: `243426257493177`,
  async execute(interaction) {
    const { Bot: { config } } = require(`../server`);
    if (interaction.constructor.name === `VoiceConnection`) {
      const audio = await speechSynthesis.execute(response);
      return voiceReply(interaction, audio);
    }
    const response = config.intent_response.drop_from_team[Math.floor(Math.random() * config.intent_response.drop_from_team.length)].toString();
    return interaction.reply(response);
  },
};