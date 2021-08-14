const { voiceReply } = require(`../utils/reply`);
const speechSynthesis = require(`../speech/speechSynthesis`);

module.exports = {
  name: `hows_things`,
  intentID: `260695135557041`,
  async execute(interaction) {
    const { Bot: { config } } = require(`../server`);
    if (interaction.constructor.name === `VoiceConnection`) {
      const audio = await speechSynthesis.execute(response);
      return voiceReply(interaction, audio);
    }
    const response = config.intent_response.hows_things[Math.floor(Math.random() * config.intent_response.hows_things.length)].toString();
    return interaction.reply(response);
  },
};