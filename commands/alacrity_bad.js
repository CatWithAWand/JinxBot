const { voiceReply } = require(`../utils/reply`);
const speechSynthesis = require(`../speech/speechSynthesis`);

module.exports = {
  name: `alacrity_bad`,
  intentID: `1174092659709739`,
  async execute(interaction) {
    const { Bot: { config } } = require(`../server`);
    if (interaction.constructor.name === `VoiceConnection`) {
      const audio = await speechSynthesis.execute(response);
      return voiceReply(interaction, audio);
    }
    const response = config.intent_response.alacrity_bad[Math.floor(Math.random() * config.intent_response.alacrity_bad.length)].toString();
    return interaction.reply(response);
  },
};