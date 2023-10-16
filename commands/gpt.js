const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const puppeteer = require('puppeteer');

const CHANNEL_ID = process.env['CHANNEL_ID'];

module.exports = {
    data: new SlashCommandBuilder()
    .setName('chatgpt')
    .setDescription('Ask ChatGPT a question')
    .addStringOption(option => option.setName('prompt').setDescription('The prompt for the Bard').setRequired(true)),
    async execute(interaction){

        await interaction.reply({ content: `Bentar ya...`});

        const { options } = interaction;
        const prompt = options.getString('prompt');

        if (interaction.channel.id !== CHANNEL_ID) {
            return interaction.editReply('Command hanya dapat digunakan di channel #ai-space.');
        }

        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        await page.goto('https://chat-app-f2d296.zapier.app/')

        const textBoxSelector =  'textarea[aria-label="chatbot-user-prompt"]';
        await page.waitForSelector(textBoxSelector);
        await page.type(textBoxSelector, prompt);

        await page.keyboard.press('Enter');

        await page.waitForSelector('[data-testid="final-bot-response"] p');

        var value = await page.$$eval('[data-testid="final-bot-response"]', async (elements) => {
            return elements.map((element) => element.textContent);
        });

        setTimeout(async () => {
            if (value.length == 0) return await interaction.editReply('Mager ngejawab pertanyaanmu.')
        }, 30000) //30000ms = 30s maximum puppeteer will wait.

        await browser.close();

        value.shift();
        const embed = new EmbedBuilder()
        .setColor("Red")
        .setDescription(`\`\`\`${value.join(`\n\n\n\n`)}\`\`\``);

        await interaction.editReply({ content: '', embeds: [embed] })
    }
}