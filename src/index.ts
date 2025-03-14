import { Client, GatewayIntentBits } from "discord.js";
import { joinVoiceChannel, getVoiceConnection } from "@discordjs/voice";
import { SoundCloudPlugin } from "@distube/soundcloud";
import { config } from "dotenv";
import fs from "fs";
import DisTube from "distube";

config();

const TOKEN = process.env.TOKEN!;
const GUILD_ID = process.env.GUILD_ID!;
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID!;

// JSONから音源URLを読み込み
const gunkaUrls = JSON.parse(fs.readFileSync("gunka_urls.json", "utf-8")).urls;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});
const distube = new DisTube(client, {
  plugins: [new SoundCloudPlugin()], // SoundCloudプラグインを追加
});

client.once("ready", async () => {
  console.log(`${client.user?.tag} 出撃準備完了！`);
  const guild = client.guilds.cache.get(GUILD_ID);
  const channel = guild?.channels.cache.get(VOICE_CHANNEL_ID);

  if (channel?.isVoiceBased()) {
    // 既存のボイス接続があれば切断
    const connection = getVoiceConnection(GUILD_ID); // getVoiceConnection を使って接続を取得
    if (connection) {
      connection.disconnect(); // 既存の接続を切断
    }

    distube.voices.join(channel);

    // ランダムにURLを選んで再生
    const playStream = async () => {
      const randomIndex = Math.floor(Math.random() * gunkaUrls.length); // ランダムにURLを選ぶ
      const selectedUrl = gunkaUrls[randomIndex];
      console.log(`再生中: ${selectedUrl}`);

      // Distubeで音楽を再生
      await distube.play(channel, selectedUrl);
    };

    playStream();
  } else {
    console.error("VCが見つからない！");
  }
});

client.login(TOKEN);
