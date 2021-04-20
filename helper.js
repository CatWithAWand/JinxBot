const Discord = require(`discord.js`);
const fs = require(`fs`);
const importFresh = require(`import-fresh`);

module.exports = {
	// Interaction response, flags: 1 << 6 make the reply ephemeral
	interactionReply : async (interaction, reply) => {
		const { Bot } = require(`./server.js`);
		if (interaction.constructor.name === `Object`) {
			const param = (reply.content != null) ? `content` : `embeds`;
			if (reply.dm != null && reply.dm === true) {
				await Bot.users.fetch(interaction.member.user.id)
					.then((user) => user.send(reply.embeds))
					.catch(console.error);
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
					.catch(console.error);
			}
		}
		else if (interaction.constructor.name === `Message`) {
			return interaction.reply((reply.content != null) ? reply.content : [reply.embeds]);
		}
		else if (interaction.constructor.name === `VoiceConnection`) {
			if (reply.audio != null) {
				try {
					const dispatcher = interaction.play(fs.createReadStream(reply.audio, { type: `ogg/opus` }));
					dispatcher.on(`finish`, () => {
						if(/\/([0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12})\./i.test(reply.audio)) {
							fs.unlink(reply.audio, function(err) {
								if (err) {
									return console.error(err);
								}
							});
						}
						dispatcher.destroy();
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
		const color = Bot.guilds.cache.get(guildID).members.cache.get(Bot.user.id).displayHexColor ?? `#2196f3`;
		return new Discord.MessageEmbed()
			.setColor(color)
			.setThumbnail();
	},
	colorEmbed: (color) => {
		return new Discord.MessageEmbed()
			.setColor(color)
			.setThumbnail();
	},
	infoEmbed: () => {
		return new Discord.MessageEmbed()
			.setAuthor(`Information.`, `https://cdn.discordapp.com/attachments/815578278025756702/815578739026952202/information.png`)
			.setColor(`#2196f3`)
			.setThumbnail();
	},
	successEmbed: () => {
		return new Discord.MessageEmbed()
			.setAuthor(`Success!`, `https://cdn.discordapp.com/attachments/815578278025756702/815578768919101468/success.png`)
			.setColor(`#4caf50`)
			.setThumbnail();
	},
	warningEmbed: () => {
		return new Discord.MessageEmbed()
			.setAuthor(`Warning!`, `https://cdn.discordapp.com/attachments/815578278025756702/815578795653464114/warning.png`)
			.setColor(`#ff9800`)
			.setThumbnail();
	},
	errorEmbed: () => {
		return new Discord.MessageEmbed()
			.setAuthor(`Error!`, `https://cdn.discordapp.com/attachments/815578278025756702/815578828738265138/error.png`)
			.setColor(`#f44336`)
			.setThumbnail();
	},
	reloadCfg: () => {
		const { Bot } = require(`./server.js`);
		Bot.config = importFresh(`./config.json`);
	}
};