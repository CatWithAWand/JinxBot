const Discord = require(`discord.js`);
const fs = require(`fs`);

module.exports = {
	// Interaction response, flags: 1 << 6 make the reply ephemeral
	interactionReply : async (interaction, reply) => {
		const { Bot } = require(`./server.js`);
		if (interaction.constructor.name === `Object`) {
			const param = (reply.content != null) ? `content` : `embeds`;
			if (reply.dm != null && reply.dm === true) {
				await Bot.users.fetch(interaction.member.user.id)
					.then((user) => user.send(reply.embeds))
					.catch((err) => console.error(err));
			}
			else {
				return await Bot.api.interactions(interaction.id, interaction.token).callback.post({ data: {
					type: (reply.type) ? reply.type : 2,
					data: {
						[param]: (reply.content != null) ? reply.content : [reply.embeds],
						flags: reply.flags,
					},
				},
				})
					.catch((err) => console.error(err));
			}
		}
		else if (interaction.constructor.name === `Message`) {
			return await interaction.reply((reply.content != null) ? reply.content : [reply.embeds]);
		}
		else if (interaction.constructor.name === `VoiceConnection`) {
			if (reply.audio != null) {
				try {
					const dispatcher = interaction.play(fs.createReadStream(reply.audio, { type: `ogg/opus` }));
					dispatcher.on(`finish`, () => {
						if(/\/([0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12})\./i.test(reply.audio)) {
							console.log(`true`);
							fs.unlink(reply.audio, function(err) {
								if (err) throw err;
							});
						}
					});
				}
				catch (err) {
					console.error(err);
				}
			}
		}
	},
	rolecolorEmbed: async (guildID) => {
		const { Bot } = require(`./server.js`);
		let color = ``;
		await Bot.guilds.fetch(guildID)
			.then((guild) => {
				const role = guild.roles.highest;
				color = role.hexColor;
			})
			.catch((err) => console.error(err));
		const rolecolorEmbed = new Discord.MessageEmbed();
		rolecolorEmbed
			.setColor(color)
			.setThumbnail();
		return rolecolorEmbed;
	},
	colorEmbed: (color) => {
		const colorEmbed = new Discord.MessageEmbed();
		colorEmbed
			.setColor(color)
			.setThumbnail();
		return colorEmbed;
	},
	infoEmbed: () => {
		const infoEmbed = new Discord.MessageEmbed();
		infoEmbed
			.setAuthor(`Information.`, `https://cdn.discordapp.com/attachments/815578278025756702/815578739026952202/information.png`)
			.setColor(`#2196f3`)
			.setThumbnail();
		return infoEmbed;
	},
	successEmbed: () => {
		const successEmbed = new Discord.MessageEmbed();
		successEmbed
			.setAuthor(`Success!`, `https://cdn.discordapp.com/attachments/815578278025756702/815578768919101468/success.png`)
			.setColor(`#4caf50`)
			.setThumbnail();
		return successEmbed;
	},
	warningEmbed: () => {
		const warningEmbed = new Discord.MessageEmbed();
		warningEmbed
			.setAuthor(`Warning!`, `https://cdn.discordapp.com/attachments/815578278025756702/815578795653464114/warning.png`)
			.setColor(`#ff9800`)
			.setThumbnail();
		return warningEmbed;
	},
	errorEmbed: () => {
		const errorEmbed = new Discord.MessageEmbed();
		errorEmbed
			.setAuthor(`Error!`, `https://cdn.discordapp.com/attachments/815578278025756702/815578828738265138/error.png`)
			.setColor(`#f44336`)
			.setThumbnail();
		return errorEmbed;
	},
};