const { Client, GatewayIntentBits } = require("discord.js");

// Creating a Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Array for storing messages
let messageBank = [];

// Object for storing Markov chains
let markovChains = {};

// Bot token
const TOKEN = "YOUR_TOKEN";

// ID of the channel to which the bot will send messages
const channelId = "/"; // Replace with your channel ID

// Когда бот готов
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Обработка новых сообщений
client.on("messageCreate", (message) => {
  if (message.author.bot) return; // Ignore the bots

  // Сохраняем сообщение в массив
  messageBank.push(message.content);
  learnMessage(message.content); // Training the Markov model on a new message

  // Limit the number of saved messages to 6000
  if (messageBank.length > 6000) {
    messageBank.shift(); // Deleting old messages
  }

  // If there is enough data in a Markov chain
  if (Object.keys(markovChains).length > 0) {
    // There's a 1 in 5 chance that the bot will respond.
    const randomChance = Math.random() < 0.4;

    if (randomChance) {
      const randomMessage = generateMarkovMessage();
      const channel = client.channels.cache.get(channelId);
      if (channel) {
        // Let's make sure that the generated message is different from the existing ones
        if (!messageBank.includes(randomMessage)) {
          channel.send(randomMessage);
        }
      }
    }
  }
});

// Function for learning from new messages
function learnMessage(text) {
  const words = text.split(" ");

  for (let i = 0; i < words.length - 2; i++) {
    const key = words
      .slice(i, i + 2)
      .join(" ")
      .toLowerCase(); // Two words in a row as a key
    const nextWord = words[i + 2].toLowerCase();

    if (!markovChains[key]) {
      markovChains[key] = [];
    }

    markovChains[key].push(nextWord);
  }
}

// Function for message generation based on Markov chain
function generateMarkovMessage() {
  if (Object.keys(markovChains).length === 0) {
    return "Still haven't figured out what's going on, write more!";
  }

  let keys = Object.keys(markovChains);
  let currentKey = keys[Math.floor(Math.random() * keys.length)]; // Two words to start with
  const message = currentKey.split(" ");

  // Determine the number of words for the new message (between 5 and 20)
  const wordLimit = Math.floor(Math.random() * 15) + 5;

  for (let i = 0; i < wordLimit; i++) {
    const nextWords = markovChains[currentKey];
    if (!nextWords || nextWords.length === 0) break;

    const nextWord = nextWords[Math.floor(Math.random() * nextWords.length)];
    message.push(nextWord);

    // Update the key for the next word
    currentKey = message.slice(-2).join(" "); // The last two words are like a new key
  }

  // Combine random words into one sentence and limit repetition
  const generatedMessage = message.join(" ");

  return generatedMessage.trim();
}

// Logging in using a token
client.login(TOKEN);
