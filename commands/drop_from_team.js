const { interactionReply } = require(`../helper.js`);
const speechSynthesis = require(`../speech/speechSynthesis.js`);
const config = require(`../config.json`);

module.exports = {
	name: `drop_from_team`,
	intentID: `243426257493177`,
	async execute(interaction) {
		let audio = ``;
		const response = config.intent_response.drop_from_team[Math.floor(Math.random() * config.intent_response.drop_from_team.length)].toString();
		if (interaction.constructor.name === `VoiceConnection`) {
			audio = await speechSynthesis.execute(response);
			if (audio instanceof Error) {
				console.error(audio);
			}
		}
		interactionReply(interaction, { content: response, audio: audio });
	},
};