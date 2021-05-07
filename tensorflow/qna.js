const fs = require(`fs`);
const nodeFetch = require(`node-fetch`);
global.fetch = nodeFetch;
const importFresh = require(`import-fresh`);
require(`@tensorflow/tfjs-node`);
const qna = require(`@tensorflow-models/qna`);
let config = require(`../config.json`);

let model = null;
let context = ``;

async function setContext(contextFileName) {
  config = importFresh(`../config.json`);
  console.log(`tensorflow/context/${(contextFileName) ? contextFileName : config.context}.txt`);
  await fs.readFile(`tensorflow/context/${(contextFileName) ? contextFileName : config.context}.txt`, `utf8`, function(err, data) {
    if (err) throw err;
    console.log(data.length);
    return context = data;
  });
}

async function load() {
  console.log(`Loading QnA model...`);
  try {
    model = await qna.load();
    setContext();
  }
  catch (err) {
    console.error(err);
    return load();
  }
  console.log(`QnA model was loaded successfully!`);
}

async function process(question, message) {
  const answers = await model.findAnswers(question, context);
  const longest = answers.reduce(
    function(a, b) {
      return a.text.length > b.text.length ? a : b;
    },
  );
  const reply = longest.text.charAt(0).toUpperCase() + longest.text.slice(1);
  return message.reply(reply);
}

module.exports = {
  name: `qna`,
  description: ``,
  load,
  execute: (question, message) => {
    const answer = process(question, message);
    return answer;
  },
};