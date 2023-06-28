const fs = require("fs");
const ytdl = require("ytdl-core");
require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {
	const chatId = msg.chat.id;

	const re = /^(https?:\/\/)?(www.youtube.com|youtu.be)\/.+$/;
	url = msg.text;
	let video_data = {};

	if (re.test(url)) {
		try {
			let res = await ytdl.getInfo(url);
			video_data.photo_url = res.videoDetails.thumbnails.pop().url;
			let formats = res.formats;
			let list = [];
			for (let i = 0; i < formats.length; i++) {
				if (formats[i].hasAudio && formats[i].hasVideo) {
					list.push(formats[i].url);
					// console.log(formats[i]);
				}
			}
			video_data.video_url = list.pop();
			await bot.sendChatAction(chatId, "upload_video");
			await bot.sendVideo(chatId, video_data.video_url);
		} catch (error) {
			await bot.sendPhoto(chatId, video_data.photo_url, {
				caption: "This video size exceeds our limit!",
			});
		}
	} else {
		bot.sendMessage(chatId, "Invalid Youtube URL");
	}

	return;
});
