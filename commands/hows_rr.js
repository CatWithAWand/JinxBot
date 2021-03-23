const { interactionReply } = require(`../helper.js`);
const speechSynthesis = require(`../speech/speechSynthesis.js`);
const config = require(`../config.json`);

module.exports = {
	name: `hows_rr`,
	intentID: `900160040804913`,
	async execute(interaction) {
		let audio = ``;
		const response = config.intent_response.hows_rr[Math.floor(Math.random() * config.intent_response.hows_rr.length)].toString();
		if (interaction.constructor.name === `VoiceConnection`) {
			audio = await speechSynthesis.execute(response);
			if (audio instanceof Error) {
				console.error(audio);
			}
		}
		interactionReply(interaction, { content: response, audio: audio });
	},
};