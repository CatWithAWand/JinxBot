// const Discord = require(`discord.js`);
const Prism = require(`prism-media`);
const Porcupine = require(`@picovoice/porcupine-node`);
// const fs = require(`fs`);
const axios = require(`axios`);
// const FormData = require(`form-data`);
const config = require(`../config.json`);
const { interactionReply } = require(`../helper.js`);

module.exports = {
	name: `voiceComprehension`,
	description: ``,
	async execute(connection, member) {
		const { Bot } = require(`../server.js`);
		const userHandlers = {};
		const userStreams = {};
		const userDecoders = {};
		const listeningToUsers = {};
		const userFrameAccumulators = {};
		const userDetection = {};
		const guildServicing = {};
		let timeout = null;

		function postToWitAi(audioData) {
			console.log(`sending axios`);
			// console.log(data);
			// const formData = new FormData();
			// formData.append(`file`, audioData, { knownLength: audioData.length });
			console.log(audioData.length);
			const axios_witaispeech = {
				headers: {
					'Content-Type': `audio/raw;encoding=signed-integer;bits=16;rate=16000;endian=little`,
					'Transfer-encoding': `chunked`,
					'Connection': `keep-alive`,
					'Authorization': `Bearer ${config.witai_token}`,
				},
				// ...formData.getHeaders(),
			};
			console.log(`sending request`);
			axios.post(`https://api.wit.ai/speech`, audioData, axios_witaispeech)
				.then(function(response) {
					console.log(`response`);
					console.log(JSON.stringify(response.data));
					const command = Bot.commands.find(cmd => cmd.intentID === response.data.intents[0].id);

					if(!command) return;

					command.execute(connection, response.data);
				})
				.catch(function(error) {
					console.log(error);
				});
		}

		async function silenceDetection(audioData, sum, user, guild) {
			// Counter to execute timeout only 8 times = 2000ms
			userDetection[user].counter = 0;
			userDetection[user].buffer = Buffer.concat([userDetection[user].buffer, audioData]);
			if (userDetection[user].buffer.length >= 192000) {
				console.log(`>=192000 met, emptying...`);
				postToWitAi(userDetection[user].buffer, user);
				userDetection[user].buffer = Buffer.alloc(0);
			}
			clearInterval(timeout);
			timeout = setInterval(async function() {
				if (sum <= 1000) {
					userDetection[user].counter++;
					console.log(userDetection[user].counter);
				}
				if (userDetection[user].counter === 8) {
					console.log(`Silence detected`);
					clearInterval(timeout);
					interactionReply(connection, { audio: `resources/sound-effects/activation.ogg` });
					await postToWitAi(userDetection[user].buffer, user);
					try {
						console.log(`reseting buffer`);
						userDetection[user].detected = false;
						guildServicing[guild] = false;
						userDetection[user].buffer = Buffer.alloc(0);
						// Delete audio file
						/* fs.unlink(<audiofilegoeshere>, function(err) {
								if (err) throw err;
							});
						*/
					}
					catch(error) {
						console.error(error);
					}
				}
			}, 250);
		}

		function chunkArray(array, size) {
			return Array.from({ length: Math.ceil(array.length / size) }, (v, index) =>
				array.slice(index * size, index * size + size),
			);
		}

		let receiver = connection.receiver;
		if (!receiver) {
			receiver = connection.receiver;
		}

		// TODO: Add a check in case of multiple user join initiations and wake interactions!!!!!!!!!!!
		// TODO: Update Handlers for newly joined members
		member.voice.channel.members.forEach((mbr) => {
			const user = mbr.user;
			const guild = mbr.guild.id;
			userDetection[user] = { detected: false, buffer: Buffer.alloc(0), counter: 0, guild: guild };
			userHandlers[user] = new Porcupine([`speech/wake_word/hey_jinx_linux_2021-04-13-utc_v1_9_0.ppn`], [0.5]);
			const frameLength = userHandlers[user].frameLength;
			userStreams[user] = receiver.createStream(user, { mode: `opus`, end: `manual` });
			userDecoders[user] = new Prism.opus.Decoder({ frameSize: 640, channels: 1, rate: 16000 });
			userStreams[user].pipe(userDecoders[user]);
			guildServicing[guild] = false;

			listeningToUsers[user] = true;
			userFrameAccumulators[user] = [];

			try {
				userDecoders[user].on(`data`, (data) => {
					// Two bytes per Int16 from the data buffer
					const newFrames16 = new Array(data.length / 2);
					for (let i = 0; i < data.length; i += 2) {
						newFrames16[i / 2] = data.readInt16LE(i);
					}

					// Split the incoming PCM integer data into arrays of size Porcupine.frameLength. If there's insufficient frames, or a remainder,
					// store it in 'frameAccumulator' for the next iteration, so that we don't miss any audio data
					userFrameAccumulators[user] = userFrameAccumulators[user].concat(newFrames16);
					const frames = chunkArray(userFrameAccumulators[user], frameLength);

					if (frames[frames.length - 1].length !== frameLength) {
						// Store remainder from divisions of frameLength
						userFrameAccumulators[user] = frames.pop();
					}
					else {
						userFrameAccumulators[user] = [];
					}

					// If silent and user is detected, initiate silence detection
					if (userDetection[user].detected && guildServicing[userDetection[user].guild]) {
						console.log(`in if detected && guild servicing`);
						const sum = newFrames16.reduce(function(acc, val) { return acc + val; }, 0);
						silenceDetection(data, sum, user, userDetection[user].guild);
					}

					for (const frame of frames) {
						const index = userHandlers[user].process(frame);
						if (index !== -1) {
							// Wake word detected
							// connection.play(`resources/sound-effects/wakeword_detected.ogg`);
							interactionReply(connection, { audio: `resources/sound-effects/wakeword_detected.ogg` });
							if (!userDetection[user].detected && !guildServicing[userDetection[user].guild]) {
								console.log(`in if !detected && !guild servicing`);
								userDetection[user].detected = true;
								guildServicing[userDetection[user].guild] = true;
							}
							// console.log(`Wake word detected!`);
						}
					}
				});
			}
			catch (err) {
				console.error(err);
			}
		});
	},
};