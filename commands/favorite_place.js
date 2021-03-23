const { interactionReply } = require(`../helper.js`);
const speechSynthesis = require(`../speech/speechSynthesis.js`);
const config = require(`../config.json`);

module.exports = {
	name: `favorite_place`,
	intentID: `1176189709507692`,
	async execute(interaction, data) {
		const { Bot } = require(`../server.js`);

		const image = config.intent_response.favorite_place_image;
		const response = config.intent_response.favorite_place[Math.floor(Math.random() * config.intent_response.favorite_place.length)].toString();

		if (interaction.constructor.name === `VoiceConnection`) {
			const replyChannel = await Bot.channels.fetch(config.home_channel);
			const audio = await speechSynthesis.execute(response);
			if (audio instanceof Error) {
				console.error(audio);
			}
			interactionReply(interaction, { audio: audio });
			return replyChannel.send(image);
		}
		interactionReply(interaction, { content: `${response} \n ${image}`});
	},
};