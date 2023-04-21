require('events').EventEmitter.defaultMaxListeners = Infinity; // Increase the maximum number of event listeners to Infinity
const path = require('path');
const app = require('express')(); // Express web framework
const http = require('http').Server(app); // HTTP server
const io = require('socket.io')(http, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
}); // Socket.IO for real-time communication
const port = process.env.PORT || 3000; // Port to run the server on
const fs = require('fs')
const yaml = require('js-yaml')
const dotenv = require('dotenv');

// Set up logging
const winston = require('winston');
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/debug.log', level: 'debug' })
  ],
});

// Load bot info from bot-config.yaml file
const botConfigs = yaml.load(fs.readFileSync('bot-config.yml', 'utf8')); // Load and parse bot config file
logger.info('Loaded bot-config file');

// Set up Telegram bot with Telegraf
const { Telegraf } = require('telegraf'); // Telegraf for Telegram bot integration

// Escape Markdown characters so Telegram doesn't complain
function escapeMarkdownV2(text) {
  const ESCAPE_CHARACTERS = /[_*[\]()~>#\+\-=|{}.!]/g;
  return text.replace(ESCAPE_CHARACTERS, '\\$&');
}

// Set up a global error handler
process.on('uncaughtException', (err) => {
  logger.error('Unhandled exception: ', err);
});

// Loop through each bot in the bot-config file
for (const [botName, botConfig] of Object.entries(botConfigs)) {
  const bot = new Telegraf(botConfig.bot_token); // Create a new Telegraf bot object

  // Launch the Telegram bot
  bot.launch();
  logger.info(`Started bot ${botName} with token ${botConfig.bot_token}`);

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  // Create a namespace for each chatId
  for (chatId of botConfig.chat_ids) {
    const ns = io.of(`/${chatId}`);
    logger.info(`Created namespace ${ns.name}`);

    // Handle connections to each namespace
    ns.on('connection', (socket) => {
      logger.info(`A user has connected to namespace ${ns.name}`);

      // Handle AI messages from the bot
      socket.on('ai message', async (msg, chatId) => {
        try {
          logger.info(`Received ai messages [${ns.name} namespace]: ${msg}`);
          let escapedMessage = escapeMarkdownV2(msg);
          bot.telegram.sendMessage(chatId, {text: escapedMessage, parse_mode: 'MarkdownV2'});
        } catch (err) {
          logger.error('Error handling AI message: ' + err);
          bot.telegram.sendMessage(chatId, 'Sorry, I am having trouble processing your request. Please try again later.');
        }
      });
    });
  }

  // Listen for user msgs in Telegram
  bot.on('message', async (ctx) => {
    logger.debug(JSON.stringify(ctx, null, 2));
    let chatId = ctx.message.chat.id;
    if (!botConfig.chat_ids.includes(chatId.toString())) return; // Ignore messages from other chats
    await ctx.sendChatAction('typing'); // Send a typing indicator
    try {
      if (ctx.message.new_chat_member) { // New member handler
        logger.info(`New member joined chat ${chatId}`);
        await ctx.sendChatAction('typing'); // Send a typing indicator
        let chatName = ctx.message.chat.title;
        let newMemberName = ctx.message.new_chat_member.first_name;
        bot.telegram.sendMessage(chatId, `Hi ${newMemberName}. ${botConfig.greeting_msg}`); // Send new user greeting msg to Telegram chat
      } else if (ctx.message.text) { // Message handler
        await ctx.sendChatAction('typing'); // Send a typing indicator
        if (ctx.message.chat.titleName == null) // If private chat, set chat name to "Private Chat"
          var chatName = "Private Chat";
        else
          var chatName = ctx.message.chat.titleName;
        let user = ctx.message.from.first_name; // Sender info from Telegram
        let msg = ctx.message.text; 
        logger.info(`Received user message from ${user} on [${chatId} chat]: ${msg}`);
        // Send the message to all connected clients in the namespace
        io.of(`/${chatId}`).emit('user message', msg, chatId, chatName, user); 
      }
    } catch (err) {
      logger.error('Error handling message from Telegram: ' + err);
      ctx.reply('Sorry, I am having trouble processing your request. Please try again later.');
    }
  });
};

// Serve local OpenCharacters page
const indexPath = path.join(__dirname, '..', '..', 'index.html');
const utilsPath = path.join(__dirname, '..', '..', 'utils.js');

app.get('/', (req, res) => {
  res.sendFile(indexPath);
});

app.get('/utils.js', (req, res) => {
  res.sendFile(utilsPath);
});

// Start the server
try {
  http.listen(port, () => {
    logger.info(`Telegram bot integration server running at http://127.0.0.1:${port}/`);
  });
} catch (err) {
  logger.error('Error with Express server: ' + err);
}