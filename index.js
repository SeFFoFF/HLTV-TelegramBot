const TelegramBot = require('node-telegram-bot-api');
const { HLTV } = require('hltv');

function formatDate(milliseconds) {
    let date = new Date(milliseconds);
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    let d = date.getDate();
    let hours = date.getHours();
    let minutes = date.getMinutes();

    m = (m < 10) ? '0' + m : m;
    d = (d < 10) ? '0' + d : d;
    minutes = (minutes === 0) ? '0' + minutes : minutes;

    return `${[y, m, d].join('-')} ${hours}:${minutes}`;
}

const TOKEN = '1520275919:AAGV1b_UjrAzrAMCPGUN6Kg4qHZyPwqpmzQ';
const bot = new TelegramBot(TOKEN, {
    polling: true
});

console.log('Bot has been started...');

bot.onText(/\/start/, msg => {
    const { id } = msg.chat;

    bot.sendMessage(id, `Hi! I'm showing live matches, upcoming matches and match results! I'm also in beta, some bugs are possible :(\nUse my commands:\n/live\n/upcoming\n/results\n/developer`);
});

bot.onText(/\/live/, msg => {
    const { id } = msg.chat;
    let isLive = false;

    HLTV.getMatches().then(res => {
        for (let match in res) {
            if (res[match].live) {
                const { team1, team2, format, event } = res[match];
                const liveMatch = `🔴${JSON.stringify(team1.name)} vs ${JSON.stringify(team2.name)} (${JSON.stringify(format)})\n🏆Event: ${JSON.stringify(event.name)}`;
                
                isLive = true;
                bot.sendMessage(id, `${liveMatch.replace(/['"]+/g, '')}`);
            }
        }
        if (!isLive)
            bot.sendMessage(id, `No live matches :(`);
    });
});

bot.onText(/\/upcoming/, msg => {
    const { id } = msg.chat;
    let counter = 0;

    bot.sendMessage(id, `10 upcoming matches:`);
    HLTV.getMatches().then(res => {
        for (let match in res) {
            if (res[match].live === false && counter < 10) {
                const { team1, team2, date, format, event } = res[match];
                const upcomingDate = formatDate(date);
                const upcomingMatch = `🔵${JSON.stringify(team1.name)} vs ${JSON.stringify(team2.name)} (${JSON.stringify(format)})\n📅Date: ${JSON.stringify(upcomingDate)}\n🏆Event: ${JSON.stringify(event.name)}`;

                counter++;
                bot.sendMessage(id, `${upcomingMatch.replace(/['"]+/g, '')}`);
            }
        }
    });
});

bot.onText(/\/results/, msg => {
    const { id } = msg.chat;
    let counter = 0;

    bot.sendMessage(id, `Last 10 results:`);
    HLTV.getResults({startPage: 0, endPage: 1}).then(res => {
        for (let match in res) {
            if (counter < 10) {
                const { team1, team2, result, date, format, event } = res[match];
                const matchResult = `🟢${JSON.stringify(result)} ${JSON.stringify(team1.name)} vs ${JSON.stringify(team2.name)} (${JSON.stringify(format)})\n🏆Event: ${JSON.stringify(event.name)}`;

                counter++;
                bot.sendMessage(id, `${matchResult.replace(/['"]+/g, '')}`);
            }
        }
    });
});

bot.onText(/\/developer/, msg => {
    const { id } = msg.chat;

    bot.sendMessage(id, `Developer:\nAnton Efimov <anton.iefimov@nure.ua>\nTelegram: @SeFFoFF\nLinkedin: https://www.linkedin.com/in/anton-efimov/`);
});