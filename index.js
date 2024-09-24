require('dotenv').config();
const axios = require('axios');
const { Telegraf } = require('telegraf');
const schedule = require('node-schedule');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Função para pegar a previsão do tempo
async function getWeather() {
  try {
    const apiKey = process.env.ACCUWEATHER_API_KEY;
    const cityKey = process.env.CITY_KEY;
    
    const response = await axios.get(`http://dataservice.accuweather.com/forecasts/v1/daily/1day/${cityKey}`, {
      params: {
        apikey: apiKey,
        language: 'pt-br',
        metric: true
      }
    });

    const forecast = response.data.DailyForecasts[0];
    const { Minimum, Maximum } = forecast.Temperature;

    return `Previsão do tempo para Chapecó-SC:\nTemperatura mínima: ${Minimum.Value}°C\nTemperatura máxima: ${Maximum.Value}°C\nCondição: ${forecast.Day.IconPhrase}`;
  } catch (error) {
    console.error('Erro ao obter a previsão do tempo:', error);
    return 'Não foi possível obter a previsão do tempo no momento.';
  }
}

// Enviar previsão para o Telegram
async function sendWeatherToTelegram() {
  const chatId = process.env.CHAT_ID;
  const message = await getWeather();
  bot.telegram.sendMessage(chatId, message);
}

// Comando no Telegram para ativar manualmente
bot.command('previsao', async (ctx) => {
  const message = await getWeather();
  ctx.reply(message);
});

// Agendar para enviar todos os dias às 07:00
schedule.scheduleJob('0 7 * * *', () => {
  sendWeatherToTelegram();
});

bot.launch();

console.log('Bot rodando...');
