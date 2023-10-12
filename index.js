const { Client, Events, IntentsBitField } = require('discord.js');
require('dotenv').config()
const axios = require('axios');

const client = new Client({
    intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.MessageContent,
    ],
});

client.login(process.env['TOKEN']); //Open "Bot" in Discord developer web, choose "Reset token".

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

const CHANNEL_ID = process.env['CHANNEL_ID'];
//Switch to developer mode first on Discord. Then, right click the channel and you'll see the "Copy channel ID".
//This means to set your bot only replying in the specific channel you want.
   
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== CHANNEL_ID) return; 
    if (message.content.startsWith("!")) return;

    let conversationLog = [
        { role: 'system', content: 'You are a friendly chatbot.' },
    ];

    await message.channel.sendTyping();

    try {
        let prevMessages = await message.channel.messages.fetch({ limit: 15 }); //The bot will retrieve the previous chat up to this limit in the channel.

        prevMessages.forEach((msg) => {
        if (msg.content.startsWith("!")) return;
        if (msg.author.id !== client.user.id && message.author.bot) return;
        if (msg.author.id === client.user.id) {
            conversationLog.push({
            role: "assistant",
            content: msg.content,
            name: msg.author.username
                .replace(/\s+/g, "_")
                .replace(/[^\w\s]/gi, ""),
            });
        }

        if (msg.author.id === message.author.id) {
            conversationLog.push({
            role: "user",
            content: msg.content,
            name: message.author.username
                .replace(/\s+/g, "_")
                .replace(/[^\w\s]/gi, ""),
            });
        }
        });

        // Now, let's handle the AI response part
        const input = {
        method: "GET",
        url: "https://google-bard1.p.rapidapi.com/",
        headers: {
            text: message.content,
            lang: "en",
            psid: process.env['PSID'],
            //Get this from Bard. Ctrl + Shift + I > application > Cookies > https://bard.google.com > __Secure-1PSID > copy the value.
            "X-RapidAPI-Key": process.env['API_KEY'], 
            //https://rapidapi.com/nishantapps55/api/google-bard1/pricing > Subscribe first > Endpoints.
            "X-RapidAPI-Host": "google-bard1.p.rapidapi.com",
        },
        };

        try {
        const output = await axios.request(input);     
        message.reply( output.data.response );
        } catch (e) {
        console.error("Error:", e);
        return await message.reply({
            content: "There was an issue getting that AI response. Try again later",
            ephemeral: true,
        });
        }
    } catch (error) {
        console.error("Error:", error);
    }
});