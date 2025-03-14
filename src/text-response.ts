export const completionsToOpenAI = (prompt: string) => {
    return fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        store: true,
        messages: [
          {
            role: "developer",
            content: "第二次世界大戦戦時中の海軍上官の口調で できるように日本語で返事してくれ\n" + prompt,
          },
        ],
      }),
    });
  };
  