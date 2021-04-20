const { interactionReply, successEmbed, errorEmbed } = require(`../helper.js`);
const speechSynthesis = require(`../speech/speechSynthesis.js`);

module.exports = {
	name: `say`,
	description: `Make the bot say something on the voice channel you are currently on.`,
	options: [
		{
			type: 3,
			name: `text`,
			description: `Text to synthesize into speech and say it aloud.`,
			default: false,
			required: true,
		},
	],
	usage: `/say text: Hi this is a test.`,
	intentID: `837951680088531`,
	async execute(interaction, data) {
		const { Bot } = require(`../server.js`);
		const errorEmbed1 = errorEmbed();
		const successEmbed1 = successEmbed();
		let member = null;
		let voiceConnection = null;
		let text = ``;
		switch (interaction.constructor.name) {
		case `Object`:
			await Bot.guilds.cache.get(interaction.guild_id).members.fetch(interaction.member.user.id)
				.then((mbr) => {
					member = mbr;
				})
				.catch(console.error);
			voiceConnection = Bot.voice.connections.find(connection => connection.channel.guild.id === interaction.guild_id);
			text = interaction.data.options[0].value;
			break;
		case `Message`:
			member = interaction.member;
			voiceConnection = Bot.voice.connections.find(connection => connection.channel.guild.id === interaction.guild.id);
			text = data.entities[`text:text`][0].value;
			break;
		case `VoiceConnection`:
			member = interaction.voice.member;
			voiceConnection = interaction;
			text = data.entities[`text:text`][0].value;
			break;
		default:
			return;
		}

		// Check if bot is connected to a voice channel for that server
		if (voiceConnection == null) {
			return interactionReply(interaction, { type: 4, content: `I'm not connected to any channel. Please connect to a voice channel and use **/join** to invite me.`, flags: 1 << 6 });
		}
		if (member.voice.channel && (member.voice.channel.id == voiceConnection.channel.id)) {
			if (text > 200) {
				errorEmbed1.setDescription(`Text max character limit is 200, your text had **${text.length}**.`);
				interactionReply(interaction, { type: 4, embeds: errorEmbed1 });
				text = `Text max character limit is 200, your text had ${text.length}`;
			}
			else {
				successEmbed1.setDescription(`Now saying **${text}**`);
				interactionReply(interaction, { type: 4, embeds: successEmbed1 });
			}
			const audio = await speechSynthesis.execute(text);
			interactionReply(voiceConnection, { audio: audio });
		}
		else {
			return interactionReply(interaction, { type: 4, content: `Please connect to my voice channel in order to use that command.\n(Note: You cannot use this command from a different voice channel!)`, flags: 1 << 6 });
		}
	},
};