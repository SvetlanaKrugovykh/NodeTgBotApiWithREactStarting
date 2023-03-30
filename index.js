const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = 'https://' + process.env.WEB_APP_URL;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {

	const chatId = msg.chat.id;
	const text = msg.text;

	if (text === '/start') {
		await bot.sendMessage(chatId, 'Нижче з`явиться кнопка, заповніть форму', {
			reply_markup: {
				keyboard: [
					[{ text: 'Заповнити форму', web_app: { url: webAppUrl + '/form' } }]
				]
			}
		})

		await bot.sendMessage(chatId, 'Заходи в наш интернет магазин по кнопке ниже', {
			reply_markup: {
				inline_keyboard: [
					[{ text: 'Сделать заказ', web_app: { url: webAppUrl } }]
				]
			}
		})
	}

	if (msg?.web_app_data?.data) {
		try {
			const data = JSON.parse(msg?.web_app_data?.data)
			console.log(data)
			await bot.sendMessage(chatId, 'Дякуємо за зворотній зв`язок!')
			await bot.sendMessage(chatId, 'Ваш emal: ' + data?.email);
			await bot.sendMessage(chatId, 'Ваш договір: ' + data?.contract);

			setTimeout(async () => {
				await bot.sendMessage(chatId, 'Всю необхідну інформацію Ви можете отримувати в цьому чаті');
			}, 3000)
		} catch (e) {
			console.log(e);
		}
	}
});

app.post('/web-data', async (req, res) => {
	const { queryId, products = [], totalPrice } = req.body;
	try {
		await bot.answerWebAppQuery(queryId, {
			type: 'article',
			id: queryId,
			title: 'Успешная покупка',
			input_message_content: {
				message_text: ` Сплачена послуга на суму ${totalPrice}, ${products.map(item => item.title).join(', ')}`
			}
		})
		return res.status(200).json({});
	} catch (e) {
		return res.status(500).json({})
	}
})

const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))
