const { interactionReply, successEmbed } = require(`../helper.js`);
const speechSynthesis = require(`../speech/speechSynthesis.js`);
const config = require(`../config.json`);
const fs = require(`fs`);

module.exports = {
	name: `leave`,
	description: `Force the bot to leave from the voice channel it's connected.`,
	options: [
	],
	usage: `/leave`,
	intentID: `269279977976507`,
	async execute(interaction) {
		const { Bot } = require(`../server.js`);
		const successEmbed1 = successEmbed();
		let voiceConnection = {};
		switch (interaction.constructor.name) {
		case `Object`:
			voiceConnection = Bot.voice.connections.find(connection => connection.channel.guild.id === interaction.guild_id);
			break;
		case `Message`:
			voiceConnection = Bot.voice.connections.find(connection => connection.channel.guild.id === interaction.guild.id);
			break;
		case `VoiceConnection`:
			voiceConnection = interaction;
			break;
		default:
			return;
		}
		if (voiceConnection) {
			try {
				if (interaction.constructor.name === `VoiceConnection`) {
					const response = config.intent_response.leave[Math.floor(Math.random() * config.intent_response.leave.length)].toString();
					const audio = await speechSynthesis.execute(response);

					const dispatcher = voiceConnection.play(audio);
					dispatcher.on(`finish`, () => {
						dispatcher.destroy();
						voiceConnection.disconnect();
						fs.unlink(audio, function(err) {
							if (err) throw err;
						});
						return;
					});
					dispatcher.on(`error`, console.error);
				}
				else {
					voiceConnection.disconnect();
					if (config.interaction_source) {
						successEmbed1.setDescription(`Disconnected from **${voiceConnection.channel.name}** successfully.`);
						return interactionReply(interaction, { type: 4, embeds: successEmbed1 });
					}
					else {
						return interactionReply(interaction, { type: 4 });
					}
				}
			}
			catch (error) {
				console.log(error);
				return interactionReply(interaction, { type: 4, content: `There was an error while trying to disconnect!`, flags: 1 << 6, audio: `speech/synthesis_audios/error_disconnect.ogg` });
			}
		}
		else {
			return interactionReply(interaction, { type: 4, content: `I'm not connected to any voice channel.`, flags: 1 << 6 });
		}
	},
};