const importFresh = require(`import-fresh`);
const Perspective = require(`perspective-api-client`);
const perspective = new Perspective({ apiKey: `AIzaSyCxsKnezwpbKLw8kPQNT7tJTpZsA7rsogg` });

module.exports = {
  checkToxicity: async (text) => {
    const { Bot: { config } } = require(`../server`);
    return new Promise(function(resolve) {
      perspective.analyze(text)
        .then(({ attributeScores: { TOXICITY: { summaryScore } } }) => {
          console.log(summaryScore.value);
          if (summaryScore.value > 0.90) return resolve(config.toxicity.extreme[Math.floor(Math.random() * config.toxicity.extreme.length)].toString());
          if (summaryScore.value > 0.80) return resolve(config.toxicity.veryhigh[Math.floor(Math.random() * config.toxicity.veryhigh.length)].toString());
          if (summaryScore.value > 0.70) return resolve(config.toxicity.high[Math.floor(Math.random() * config.toxicity.high.length)].toString());
          if (summaryScore.value > 0.60) return resolve(config.toxicity.great[Math.floor(Math.random() * config.toxicity.great.length)].toString());
          return resolve(null);
        })
        .catch(console.error);
    });
  },
  reloadCfg: (callback) => {
    const { Bot } = require(`../server`);
    try {
      Bot.config = importFresh(`../config.json`);
      return callback(0);
    }
    catch(err) {
      return callback(err);
    }
  },
};