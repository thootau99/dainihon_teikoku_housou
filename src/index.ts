import { Client, GatewayIntentBits } from "discord.js";
import { getVoiceConnection } from "@discordjs/voice";
import { SoundCloudPlugin } from "@distube/soundcloud";
import { config } from "dotenv";
import fs from "fs";
import DisTube, { Events } from "distube";
import { completionsToOpenAI } from "./text-response";
import { Database } from "sqlite3";
import { download } from "./tiktok";
config();

function randomPick(songs: Array<string>) {
  if (!songs || songs.length === 0) {
    return "https://soundcloud.com/hugh-mcguire-2/japanese-national-anthem-kimi-ga-yo";
  }
  const randomIndex = Math.floor(Math.random() * songs.length);
  return songs[randomIndex];
}

const TOKEN = process.env.TOKEN!;
const GUILD_ID = process.env.GUILD_ID!;
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID!;
const GUNKA_URL_PATH: string = process.env.GUNKA_PATH || "";
const DATABASE_PATH: string = process.env.DATABASE_PATH || "./jlpt-bot.db";
const KIMI_GA_YO_URL =
  "https://soundcloud.com/hugh-mcguire-2/japanese-national-anthem-kimi-ga-yo";
const TEXT_CHANNEL_ID = process.env.TEXT_CHANNEL_ID || "";
const GRAMMAR_CHANNEL_WEBHOOK = process.env.GRAMMAR_CHANNEL_WEBHOOK || "";
const AUDIO_GENERATE_CHANNEL_ID = process.env.AUDIO_GENERATE_CHANNEL_ID || "";
let tiktok_cache = process.env.TIKTOK_CACHE || "";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const distube = new DisTube(client, {
  plugins: [new SoundCloudPlugin()], // SoundCloudプラグインを追加
});

let gunkaUrls: Array<string> = [];

client.once("ready", async () => {
  console.log(`${client.user?.tag} 出撃準備完了！`);
  const guild = client.guilds.cache.get(GUILD_ID);
  const channel = guild?.channels.cache.get(VOICE_CHANNEL_ID);

  // if (channel?.isVoiceBased()) {
  //   // 既存のボイス接続があれば切断
  //   const connection = getVoiceConnection(GUILD_ID); // getVoiceConnection を使って接続を取得
  //   if (connection) {
  //     connection.disconnect(); // 既存の接続を切断
  //   }

  //   distube.voices.join(channel);

  //   // ランダムにURLを選んで再生
  //   const playGunka = async () => {
  //     if (gunkaUrls.length === 0) {
  //       gunkaUrls = JSON.parse(fs.readFileSync(GUNKA_URL_PATH, "utf-8")).urls;
  //     }
  //     const selectedUrl = randomPick(gunkaUrls);
  //     console.log(`再生中: ${selectedUrl}`);
  //     const queue = distube.getQueue(channel)
  //       ? distube.getQueue(channel)
  //       : await distube.queues.create(channel);
  //     if (queue) {
  //       queue.remove();
  //     }
  //     await distube.play(channel, selectedUrl);
  //   };

  //   const playKiminoYo = async () => {
  //     console.log("君が代を再生中...");
  //     const queue = distube.getQueue(channel)
  //       ? distube.getQueue(channel)
  //       : await distube.queues.create(channel);
  //     if (queue) {
  //       queue.remove();
  //     }
  //     await distube.play(channel, KIMI_GA_YO_URL);
  //   };
  //   distube.on(Events.FINISH, async (queue) => {
  //     if (!queue) return;
  //     console.log("軍歌終了、次の軍歌を流します");
  //     playGunka();
  //   });
  //   // 君が代を毎正時（毎時00分）に流す
  //   const scheduleKimigaYo = () => {
  //     const now = new Date();
  //     const nextTimePlay = new Date(now.setHours(now.getHours() + 1, 0, 0, 0)); // 次の正時（00分）
  //     const delay = nextTimePlay.getTime() - Date.now(); // 次の正時までの時間差

  //     setTimeout(() => {
  //       playKiminoYo(); // 正時に君が代を流す
  //       setInterval(playKiminoYo, 60 * 60 * 1000); // その後は毎正時に繰り返す
  //     }, delay);
  //   };
  //   scheduleKimigaYo();
  //   playGunka();
  // } else {
  //   console.error("VCが見つからない！");
  // }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) {
    return;
  }

  console.log(
    message.content.split("|"),
    message.channelId,
    AUDIO_GENERATE_CHANNEL_ID,
    message.channelId === AUDIO_GENERATE_CHANNEL_ID
  );
  if (message.channel.id === TEXT_CHANNEL_ID) {
    try {
      const response = await completionsToOpenAI(message.content);
      const responseJson = await response.json();

      message.channel.send(responseJson.choices[0].message.content);
    } catch (error) {
      console.log(error);
    }
  } else if (message.channelId === AUDIO_GENERATE_CHANNEL_ID) {
    console.log(message.channel.id === TEXT_CHANNEL_ID);

    try {
      const [instruction, content] = message.content.split("|");

      switch (instruction) {
        case "generate":
          const [speaker, text, tiktokSessionId] = content.split(",");
          const request = {
            speaker,
            text,
            tiktokSessionId,
          };
          const successPromise = await new Promise(async (resolve, reject) => {
            await download(request, resolve);
          }).then(async (outputFile: any) => {
            // let isFileCreated = false;
            // while (!isFileCreated) {
            //   isFileCreated = fs.existsSync(outputFile);
            //   console.log(isFileCreated, outputFile);
            // }
            await message.channel.send({
              files: [outputFile],
            });
          });
          break;
        case "set-session":
          tiktok_cache = content;
          await message.channel.send("セット完了");
          break;
        case "list-ppl":
          await message.channel.send(
            "jp_001\njp_003\njp_005\njp_006\njp_female_fujicochan\njp_female_hasegawariona\njp_male_keiichinakano\njp_female_oomaeaika\njp_male_yujinchigusa\njp_female_shirou\njp_male_tamawakazuki\njp_female_kaorishoji\njp_female_yagishaki\njp_male_hikakin\njp_female_rei\njp_male_shuichiro\njp_male_matsudake\njp_female_machikoriiita\njp_male_matsuo\njp_male_osada"
          );
          break;
      }
    } catch (e) {
      console.log(e);
    }
  }
});

client.login(TOKEN);
