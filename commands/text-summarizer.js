const { SlashCommandBuilder } = require('discord.js')
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('summarizer')
    .setDescription('Summarize your long text')
    .addStringOption(option => option.setName('text').setDescription('The text you want to summarize').setRequired(true)),
    async execute(interaction){

        await interaction.reply({ content: `***Main gitar di jalan raya. Tunggu bentar yaa...***`});

        const { options } = interaction;
        const text = options.getString('text');

        const input = {
            method : 'POST',
            url: 'https://gpt-summarization.p.rapidapi.com/summarize',
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Key': process.env['API_KEY'],
                'X-RapidAPI-Host': 'gpt-summarization.p.rapidapi.com'
            },
            data: {
                text: text,
                num_sentence: 3
            }
        };

        try {
            const output = await axios.request(input);
            await interaction.editReply(output.data.summary);
        } catch (e) {
            console.log(e);
            await interaction.editReply({ content: `Lagi error nih, dah lah.`});
        }

    }
}