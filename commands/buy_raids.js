const { reply } = require(`../utils/reply`);
const speechSynthesis = require(`../speech/speechSynthesis`);

module.exports = {
  name: `buy_raids`,
  intentID: `1581202865419297`,
  async execute(interaction) {
    const { Bot: { config } } = require(`../server`);
    let audio = ``;
    const response = config.intent_response.buy_raids[Math.floor(Math.random() * config.intent_response.buy_raids.length)].toString();
    if (interaction.constructor.name === `VoiceConnection`) {
      audio = await speechSynthesis.execute(response);
    }
    reply(interaction, { content: response, audio: audio });
  },
};