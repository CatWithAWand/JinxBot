const { interactionReply } = require(`../helper.js`);
const speechSynthesis = require(`../speech/speechSynthesis.js`);

module.exports = {
	name: `hows_things`,
	intentID: `260695135557041`,
	async execute(interaction) {
		const { Bot: { config } } = require(`../server.js`);
		let audio = ``;
		const response = config.intent_response.hows_things[Math.floor(Math.random() * config.intent_response.hows_things.length)].toString();
		if (interaction.constructor.name === `VoiceConnection`) {
			audio = await speechSynthesis.execute(response);
		}
		interactionReply(interaction, { content: response, audio: audio });
	},
};