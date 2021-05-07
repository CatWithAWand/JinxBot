const { reply } = require(`../utils/reply`);
const speechSynthesis = require(`../speech/speechSynthesis`);

module.exports = {
  name: `alacrity_bad`,
  intentID: `1174092659709739`,
  async execute(interaction) {
    const { Bot: { config } } = require(`../server`);
    let audio = ``;
    const response = config.intent_response.alacrity_bad[Math.floor(Math.random() * config.intent_response.alacrity_bad.length)].toString();
    if (interaction.constructor.name === `VoiceConnection`) {
      audio = await speechSynthesis.execute(response);
    }
    reply(interaction, { content: response, audio: audio });
  },
};