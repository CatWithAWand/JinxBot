const fs = require(`fs`);
const uuid4 = require(`uuid4`);
const { AudioConfig } = require(`microsoft-cognitiveservices-speech-sdk`);
const sdk = require(`microsoft-cognitiveservices-speech-sdk`);
const speechConfig = sdk.SpeechConfig.fromSubscription(`842b3f8bbec6454aa752414950c3d000`, `westeurope`);
const importFresh = require(`import-fresh`);

/*
async function xmlToString(filePath) {
	const xml = await fs.readFileSync(filePath, `utf8`);
	return xml;
}
*/

async function updateJson(num) {
	const data = JSON.parse(fs.readFileSync(`config.json`));
	data.speech_quota_usage += num;
	fs.writeFileSync(`config.json`, JSON.stringify(data, null, 4));
}

function synthesize(text) {
	return new Promise(function(resolve, reject) {
		const config = importFresh(`../config.json`);
		if ((config.speech_quota_usage + text.length) >= 450000) {
			return reject(new Error(`reached_quota_limit`));
		}

		speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Ogg16Khz16BitMonoOpus;
		const id = uuid4();
		const audioConfig = AudioConfig.fromAudioFileOutput(`speech/synthesis_audios/${id}.ogg`);
		const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

		/*
		const ssml = xmlToString(`speech/ssml_template.xml`);
		xml.replace(`%text%`, text);
		xml.replace(`%rate`, config.speech_rate);
		xml.replace(`%pitch`, config.speech_pitch);
		*/

		const ssml = `<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="${config.speech_lang}"><voice name="Microsoft Server Speech Text to Speech Voice (${config.speech_lang}, ${config.speech_voice})"><prosody rate="${config.speech_rate}%" pitch="${config.speech_pitch}%">${text}</prosody></voice></speak>`;

		synthesizer.speakSsmlAsync(
			ssml,
			result => {
				synthesizer.close();
				if (result) {
					updateJson(text.length);
					return resolve(`speech/synthesis_audios/${id}.ogg`);
				}
			},
			error => {
				console.error(error);
				synthesizer.close();
				return reject(error);
			});
	});
}
module.exports = {
	name: `speechSynthesis`,
	description: ``,
	execute: (text) => {
		const audio = synthesize(text).catch((error) => {
			if (error.message === `reached_quota_limit`) {
				return `speech/synthesis_audios/error_quota_limit.ogg`;
			}
			console.error(error);
			return `speech/synthesis_audios/error_speech_synthesis.ogg`;
		});
		return audio;
	},
};