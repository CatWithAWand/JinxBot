const { interactionReply } = require(`../helper.js`);
const speechSynthesis = require(`../speech/speechSynthesis.js`);
const config = require(`../config.json`);

module.exports = {
	name: `not_using_elite`,
	intentID: `884771695694863`,
	async execute(interaction) {
		let audio = ``;
		const response = config.intent_response.not_using_elite[Math.floor(Math.random() * config.intent_response.not_using_elite.length)].toString();
		if (interaction.constructor.name === `VoiceConnection`) {
			audio = await speechSynthesis.execute(response);
		}
		interactionReply(interaction, { content: response, audio: audio });
	},
};