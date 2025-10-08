import { config, createAudioFromText } from "tiktok-tts";
import { randomUUID } from "crypto";
import { existsSync } from "fs";
interface TiktokTTSRequest {
  speaker: string;
  text: string;
  tiktokSessionId: string;
}

export async function download(req: TiktokTTSRequest, success: any) {
  console.log("download request:", req);

  const speaker = req.speaker || "unknown";
  const text = req.text || "";
  const session = req.tiktokSessionId || "";
  const audioUUID = randomUUID();
  config(session);
  const result = await new Promise(async (resolve, reject) => {
    try {
      await createAudioFromText(text, `./audio-output/${audioUUID}`, speaker);
      resolve(true);
    } catch (e) {
      console.log(e);
    }
  }).then((_) => {
    let isFileCreated = false;
    success(`./audio-output/${audioUUID}.mp3`);
  });
}
