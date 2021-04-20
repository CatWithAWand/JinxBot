const fs = require(`fs`);
const path = require(`path`);
const request = require(`request`);
const Discord = require(`discord.js`);
const { interactionReply, successEmbed, errorEmbed, infoEmbed, warningEmbed, reloadCfg } = require(`../helper.js`);

async function processPPN(fileName, fileUrl) {
	await new Promise((resolve, reject) => {
		fs.readdir(`./speech/wake_word`, function(err, files) {
			if (err) {
				console.error(err);
				reject(err);
			}
			const ppnFile = files.filter(file => path.extname(file) === `.ppn`);
			resolve(ppnFile[0]);
		});
	})
	.then((file) => {
		console.log(`in then`);
		console.log(file);
		fs.unlink(`./speech/wake_word/${file}`, function(err) {
			if (err) {
				return console.error(err);
			}
		});
	})
	.catch(console.error);

	const file = fs.createWriteStream(`./speech/wake_word/${fileName}`);
	return await new Promise((resolve, reject) => {
		const stream = request({
			uri: fileUrl,
			headers: {
				'Accept': `*`,
				'Accept-Encoding': `gzip, deflate, br`,
				'Accept-Language': `en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3`,
				'Cache-Control': `max-age=0`,
				'Connection': `keep-alive`,
				'Upgrade-Insecure-Requests': `1`,
			},
			gzip: true,
		})
			.pipe(file)
			.on(`finish`, () => {
				console.log(`The file is finished downloading.`);
				resolve();
			})
			.on(`error`, (err) => {
				reject(err);
			});
	})
	.then(() => {
		const data = JSON.parse(fs.readFileSync(`./config.json`));
		data.wake_word = fileName;
		fs.writeFileSync(`./config.json`, JSON.stringify(data, null, 4));
		
		reloadCfg();
		return 0;
	})
	.catch((err) => {
		console.log(`Something happened: ${err}`);
		return err;
	});
}

module.exports = {
	name: `wakeword`,
	description: `Check or update the bot's wake word.`,
	options: [
		{
			type: 1,
			name: `check`,
			description: `Check when the wake word expires.`,
			options: [],
		},
		{
			type: 1,
			name: `update`,
			description: `Initiate the wake word update process.`,
			options: [],
		},
	],
	usage: `/wakeword check`,
	async execute(interaction) {
		const { Bot, Bot: { config } } = require(`../server.js`);
		let embed = infoEmbed();

		if (!config.moderators.includes(`${interaction.member.user.id}`)) {
			return interactionReply(interaction, { type: 4, content: `You cannot execute this command! It's only for my moderators.`, flags: 1 << 6 });
		}
		if (interaction.data.options[0].name === `check`) {
			fs.readdir(`./speech/wake_word`, function(err, files) {
				if (err) {
					console.error(err);
					return interactionReply(interaction, { type: 4, content: `There was an error while trying to find wake word directory.`, flags: 1 << 6 });
				}
				const ppnFile = files.filter(file => path.extname(file) === `.ppn`);
				const args = ppnFile[0].split(`_`);
				let wakeword = ``;
				let platform = ``;
				let expiryDate = ``;
				let daysLeft = ``;
				args.forEach((arg) => {
					if (expiryDate !== ``) return;
					if (/(\d{4}([.\-/ ])\d{2}\2\d{2}|\d{2}([.\-/ ])\d{2}\3\d{4})/.test(arg)) {
						expiryDate = arg.match(/(\d{4}([.\-/ ])\d{2}\2\d{2}|\d{2}([.\-/ ])\d{2}\3\d{4})/);
						daysLeft = Math.floor((Date.parse(expiryDate[0]) - Date.now()) / 8.64e7);
					}
					else if (arg !== `linux` && arg !== `macos` && arg !== `windows`) {
						wakeword += `${arg} `;
					}
					else {
						platform = arg;
					}
				});
				if (parseInt(daysLeft, 10) < 0) {
					embed =  warningEmbed();
					embed.setDescription(`Wake word has expired! \nPlease use \`/wakeword update\` to upload a new wake word license.`);

				}
				else if (parseInt(daysLeft, 10) <= 5) {
					embed.setDescription(`Wake word expires in **${daysLeft} days**.\nPlease use \`/wakeword update\` to upload a new wake word license.`);
				}
				else {
					embed.setDescription(`Wake word expires in **${daysLeft} days**.`);
				}
				embed.addField(`Wake word`, wakeword);
				embed.addField(`Platform`, platform);
				embed.addField(`Expiry Date`, expiryDate[0]);
				return interactionReply(interaction, { type: 4, embeds: embed });
			});
		}
		else {
			embed = successEmbed();

			// "Handle" the interaction
			interactionReply(interaction, { type: 4, content: `I answered your command as a private message.`, flags: 1 << 6 });

			await Bot.users.fetch(interaction.member.user.id)
			.then((user) => {
				user.send(`Please reply with the wake word .ppn file attached. (Interaction will time out in 2 minutes)`)
					.then((message) => {
						const collector = new Discord.MessageCollector(message.channel, m => m.author.id === user.id, { time: 120000 });
						collector.on(`collect`, async (msg) => {
							console.log(`collected message`);
							if (msg.content.toLowerCase() === `cancel`) {
								msg.reply(`Wake word update process cancelled by user!`)
									.catch(console.error)
									.finally(() => {
										collector.removeAllListeners();
										return collector.stop();
									});
							}
							else {
								if (msg.attachments.size < 1) return msg.reply(`You did not attach any file!`);
								console.log(msg.attachments);
								const ppnFiles = msg.attachments.filter(file => file.name.match(/(\d{4}([.\-/ ])\d{2}\2\d{2}|\d{2}([.\-/ ])\d{2}\3\d{4}).*\.ppn/));
								console.log(ppnFiles.size);
								if (ppnFiles.size > 1) {
									msg.reply(`Multiple wake word .ppn files detected, please upload the latest one only!`);
								}
								else if (ppnFiles.size === 0) {
									msg.reply(`You did not supply a valid wake word .ppn file!`);
								}
								else {
									const ppnFile = ppnFiles.first();
									const expiryDate = ppnFile.name.match(/(\d{4}([.\-/ ])\d{2}\2\d{2}|\d{2}([.\-/ ])\d{2}\3\d{4})/);
									const daysLeft = Math.floor((Date.parse(expiryDate[0]) - Date.now()) / 8.64e7);
									console.log(daysLeft);
									if (daysLeft < 0) {
										msg.reply(`The wake word you uploaded has expired already or expires today!`);
									}
									else {
										const process = await processPPN(ppnFile.name, ppnFile.url);
										console.log(process);
										if (process === 0) {
											collector.stop();
											embed.setDescription(`Successfully updated wake word!`);
											return msg.reply(embed); 
										}
										embed = errorEmbed();
										embed.setDescription(`Encountered an error while trying to download the new wake word file!\nPlease try again.`);
										return msg.reply(embed);

									}
								}
							}
						});
						collector.on(`end`, msg, reason => {
							message.reply(`Wake word update process timed out!`)
								.catch(console.error)
								.finally(() => {
									collector.removeAllListeners();
									return collector.stop();
								});
						});
					})
					.catch(console.error);
			})
			.catch(console.error);
		}
	},
};