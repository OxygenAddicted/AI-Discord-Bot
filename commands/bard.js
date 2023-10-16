const { SlashCommandBuilder } = require('discord.js');
require('dotenv').config()
const axios = require('axios');

const CHANNEL_ID = process.env.CHANNEL_ID;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bard')
    .setDescription('Ask Bard a question')
    .addStringOption(option => option.setName('prompt').setDescription('The prompt for the Bard').setRequired(true)),

    async execute(interaction) {

        //await interaction.reply({ content: `Mager banget ngejawab pertanyaanmu...`, ephemeral: true });
        
        const { options } = interaction;
        const prompt = options.getString('prompt');
        
        if (!prompt) {
            return interaction.reply('Please provide a valid prompt.');
        }

        if (interaction.channel.id !== CHANNEL_ID) {
            return interaction.reply('This command can only be used in the designated channel.');
        }

        let conversationLog = [
            { role: 'system', content: 'You are a friendly chatbot.' },
        ];

        await interaction.deferReply();

        try {
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

            const sanitizedMessage = prompt.replace(/[\uD800-\uDFFF]./g, '');
            console.log = sanitizedMessage;

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
                maxBodyLength: 2000,
            };

            try {
                const output = await axios.request(input);
                const responseData = output.data.response;
                const maxLength = 2000;

                const responseChunks = [];
                for (let i = 0; i < responseData.length; i += maxLength) {
                responseChunks.push(responseData.slice(i, i + maxLength));
                }

                for (const chunk of responseChunks) {
                interaction.followUp(chunk);
                }

            } catch (e) {
                console.error('Error:', e);
                return interaction.followUp({
                content: 'There was an issue getting that AI response. Try again later',
                });
            }
        } catch (error) {
        console.error("Error:", error);
        }
    }
}