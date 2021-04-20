const { interactionReply } = require(`../helper.js`);
const speechSynthesis = require(`../speech/speechSynthesis.js`);

module.exports = {
	name: `buy_raids`,
	intentID: `1581202865419297`,
	async execute(interaction) {
		const { Bot: { config } } = require(`../server.js`);
		let audio = ``;
		const response = config.intent_response.buy_raids[Math.floor(Math.random() * config.intent_response.buy_raids.length)].toString();
		if (interaction.constructor.name === `VoiceConnection`) {
			audio = await speechSynthesis.execute(response);
		}
		interactionReply(interaction, { content: response, audio: audio });
	},
};