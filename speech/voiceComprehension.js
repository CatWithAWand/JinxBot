// const Discord = require(`discord.js`);
const Prism = require(`prism-media`);
const Porcupine = require(`@picovoice/porcupine-node`);
// const fs = require(`fs`);
const axios = require(`axios`);
// const FormData = require(`form-data`);
const config = require(`../config.json`);
const { interactionReply } = require(`../helper.js`);

const userHandlers = {};
const userStreams = {};
const userDecoders = {};
const listeningToUsers = {};
const userFrameAccumulators = {};
const userDetection = {};
const guildsServicing = {};
let timeout = null;

function postToWitAi(connection, audioData) {
	const { Bot } = require(`../server.js`);
	// const formData = new FormData();
	// formData.append(`file`, audioData, { knownLength: audioData.length });
	const axios_witaispeech = {
		headers: {
			'Content-Type': `audio/raw;encoding=signed-integer;bits=16;rate=16000;endian=little`,
			'Transfer-encoding': `chunked`,
			'Connection': `keep-alive`,
			'Authorization': `Bearer ${config.witai_token}`,
		},
		// ...formData.getHeaders(),
	};
	axios.post(`https://api.wit.ai/speech`, audioData, axios_witaispeech)
		.then((response) => {
			console.log(response.data);
			const command = Bot.commands.find(cmd => cmd.intentID === response.data.intents[0].id);

			if(!command) return;

			command.execute(connection, response.data);
		})
		.catch((error) => {
			console.error(error);
		});
}

async function silenceDetection(connection, audioData, sum, user) {
	// Counter to execute timeout only 8 times = 2000ms
	userDetection[user].counter = 0;
	userDetection[user].buffer = Buffer.concat([userDetection[user].buffer, audioData]);
	console.log(userDetection[user].buffer.length);
	if (userDetection[user].buffer.length >= 192000) {
		postToWitAi(userDetection[user].buffer, user);
		userDetection[user].buffer = Buffer.alloc(0);
	}
	clearInterval(timeout);
	timeout = setInterval(async function() {
		if (sum <= 1000) {
			userDetection[user].counter++;
		}
		if (userDetection[user].counter === 8) {
			clearInterval(timeout);
			interactionReply(connection, { audio: `resources/sound-effects/activation.ogg` });
			console.log(`Posting user: ${user.username}`);
			await postToWitAi(connection, userDetection[user].buffer);
			userDetection[user].detected = false;
			guildsServicing[userDetection[user].guild] = false;
			userDetection[user].buffer = Buffer.alloc(0);
		}
	}, 250);
}

function chunkArray(array, size) {
	return Array.from({ length: Math.ceil(array.length / size) }, (v, index) =>
		array.slice(index * size, index * size + size),
	);
}

function initiate(connection, user, guildID) {
	const { Bot } = require(`../server.js`);

	// If user is the Bot then return
	if (user.id === Bot.user.id) return;

	let receiver = connection.receiver;
	if (!receiver) {
		receiver = connection.receiver;
	}

	// TODO: Add a check in case of multiple user join initiations and wake interactions!!!!!!!!!!!
	// TODO: Update Handlers for newly joined members
	userDetection[user] = { detected: false, buffer: Buffer.alloc(0), counter: 0, guild: guildID };
	userHandlers[user] = new Porcupine([`speech/wake_word/hey_jinx_linux_2021-04-13-utc_v1_9_0.ppn`], [0.5]);
	const frameLength = userHandlers[user].frameLength;
	userStreams[user] = receiver.createStream(user, { mode: `opus`, end: `manual` });
	userDecoders[user] = new Prism.opus.Decoder({ frameSize: 640, channels: 1, rate: 16000 });
	userStreams[user].pipe(userDecoders[user]);
	guildsServicing[userDetection[user].guild] = false;

	Bot.connUsers.set(user.id, user);

	listeningToUsers[user] = true;
	userFrameAccumulators[user] = [];
	try {
		userDecoders[user].on(`data`, (data) => {
			// Two bytes per Int16 from the data buffer
			const newFrames16 = new Array(data.length / 2);
			for (let i = 0; i < data.length; i += 2) {
				newFrames16[i / 2] = data.readInt16LE(i);
			}

			if (userDetection[user].detected) {
				// If user is detected try to detect silence
				const sum = newFrames16.reduce(function(acc, val) { return acc + val; }, 0);
				return silenceDetection(connection, data, sum, user);
			}
			else if (guildsServicing[userDetection[user].guild]) {
				// If servicing a guild already and that user is not detected then return
				return;
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

			for (const frame of frames) {
				const index = userHandlers[user].process(frame);
				if (index !== -1) {
					// Wake word detected
					interactionReply(connection, { audio: `resources/sound-effects/wakeword_detected.ogg` });
					userDetection[user].detected = true;
					guildsServicing[userDetection[user].guild] = true;
				}
			}
		});
	}
	catch (err) {
		console.error(err);
		return err;
	}
}

function destroy(user) {
	const { Bot } = require(`../server.js`);

	// If user is the Bot then return
	if (user.id === Bot.user.id) return;

	try {
		userDecoders[user].destroy();
		userStreams[user].destroy();
		userHandlers[user].release();
		guildsServicing[userDetection[user].guild] = false;
		userDetection[user] = {};
		userFrameAccumulators[user] = [];

		Bot.connUsers.delete(user.id);
	}
	catch (err) {
		console.error(err);
		return err;
	}
}


module.exports = {
	name: `voiceComprehension`,
	description: ``,
	initiate,
	destroy,
};