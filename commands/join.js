const { interactionReply, successEmbed } = require(`../helper.js`);
const config = require(`../config.json`);
const voiceComprehension = require(`../speech/voiceComprehension.js`);


module.exports = {
	name: `join`,
	description: `Invite the bot to join your voice channel.`,
	options: [
	],
	usage: `/join`,
	intentID: `146847057319884`,
	async execute(interaction) {
		const { Bot } = require(`../server.js`);
		const successEmbed1 = successEmbed();
		let member = {};
		switch (interaction.constructor.name) {
		case `Object`:
			await Bot.guilds.cache.get(interaction.guild_id).members.fetch(interaction.member.user.id)
				.then((mbr) => {
					member = mbr;
				})
				.catch((error) => console.error(error));
			break;
		case `Message`:
			member = interaction.member;
			break;
		default:
			return;
		}
		if (member.voice.channel) {
			if (Bot.voice.connections.find(connection => connection.channel.members.has(member.id))) {
				return interactionReply(interaction, { type: 4, content: `I am already connected to your channel`, flags: 1 << 6 });
			}
			try {
				const voiceConnection = await member.voice.channel.join();
				voiceConnection.channel.members.forEach((mbr) => {
					voiceComprehension.initiate(voiceConnection, mbr.user, mbr.guild.id);
				});
				if (config.interaction_source) {
					successEmbed1.setDescription(`Connected to **${voiceConnection.channel.name}** successfully.`);
					return interactionReply(interaction, { type: 4, embeds: successEmbed1 });
				}
				else {
					return interactionReply(interaction, { type: 4, content: null, embeds: null });
				}
			}
			catch (err) {
				console.error(err);
				return interactionReply(interaction, { type: 4, content: `There was an error while trying to connect!`, embeds: null, flasgs: 1 << 6 });
			}
		}
		else {
			return interactionReply(interaction, { type: 4, content: `Please connect to a voice channel first.`, embeds: null, flgas: 1 << 6 });
		}
	},
};