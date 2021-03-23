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
			await Bot.guilds.fetch(interaction.guild_id)
				.then((guild) => {
					guild.members.fetch(interaction.member.user.id)
						.then((mbr) => {
							member = mbr;
						});
				});
			break;
		case `Message`:
			member = interaction.member;
			break;
		default:
			return;
		}
		if (member.voice.channel) {
			try {
				const connection = await member.voice.channel.join();
				voiceComprehension.execute(connection, member);
				if (config.interaction_source) {
					successEmbed1.setDescription(`Connected to **${connection.channel.name}** successfully.`);
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