const { SlashCommandBuilder } = require('discord.js');
require('dotenv').config()
const axios = require('axios');

const CHANNEL_ID = process.env['CHANNEL_ID'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bard')
    .setDescription('Ask Bard a question')
    .addStringOption(option => option.setName('prompt').setDescription('The prompt for the Bard').setRequired(true)),

    async execute(interaction) {

        await interaction.reply({ content: `Please wait a minute...`});

        const { options } = interaction;
        const prompt = options.getString('prompt');

        // Making the bot only accessible in the specific channel.
        if (interaction.channel.id !== CHANNEL_ID) {
            return interaction.editReply('Command hanya dapat digunakan di channel #ai-space.');
        }

        let conversationLog = [
            { role: 'system', content: 'You are a friendly chatbot.' },
        ];

        try {
            // Make the bot read previous message in the channel up to the limit.
            const prevMessages = await interaction.channel.messages.fetch({ limit: 15 });

            prevMessages.forEach((msg) => {
                if (msg.author.id !== interaction.user.id && interaction.user.bot) return;
                if (msg.author.id === interaction.user.id) {
                    conversationLog.push({
                        role: "assistant",
                        content: msg.content,
                        name: msg.author.username
                        .replace(/\s+/g, "_")
                        .replace(/[^\w\s]/gi, ""),
                    });
                }

                if (msg.author.id === interaction.user.id) {
                    conversationLog.push({
                        role: "user",
                        content: msg.content,
                        name: interaction.user.username
                        .replace(/\s+/g, "_")
                        .replace(/[^\w\s]/gi, ""),
                    });
                }
            });

            // Cleaning the text from emoji.
            const sanitizedMessage = prompt.replace(/[\uD800-\uDFFF]./g, '');

            // Handling the AI response.
            const input = {
                method: "GET",
                url: "https://google-bard1.p.rapidapi.com/",
                headers: {
                text: sanitizedMessage,
                lang: "en",
                psid: process.env['PSID'],
                "X-RapidAPI-Key": process.env['API_KEY'],
                "X-RapidAPI-Host": "google-bard1.p.rapidapi.com",
                },
            };

            try {
                const output = await axios.request(input);
                const responseData = output.data.response;
                const maxLength = 2000; // Discord has 2000 chars limit in a bubble.

                const responseChunks = [];
                for (let i = 0; i < responseData.length; i += maxLength) {
                    const chunk = responseData.substring(i, i + maxLength);
                    responseChunks.push(chunk);
                }

                if (responseChunks.length > 0) {
                    await interaction.editReply(responseChunks[0]);
                }

                for (let i = 1; i < responseChunks.length; i++) {
                    await interaction.followUp(responseChunks[i]);
                }
            } catch (e) {
                console.error('Error:', e);
                return interaction.followUp({
                    content: 'There was an error. Please try again later.',
                });
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }
}
