import 'tiktok-tts';
interface TiktokTTSRequest {
    speaker: string
    text: string
    tiktokSessionId: string
}

async function download(req: TiktokTTSRequest) {
  console.log("download request:", req);

  const speaker = req.speaker || "unknown";
  const text = req.text || "";
  const session = req.tiktokSessionId || "";
  const audioUUID = randomUUID();
  config(session);
  await new Promise((resolve, reject) => {
    try {
        createAudioFromText(text, `/audio-output/${audioUUID}`, speaker);
        resolve()
    } catch (e) {
        console.log(e)
        reject()
    }
  })  
  
  return `/audio-output/${audioUUID}`;
}

