export interface TelegramMessageInput {
  chatId: string;
  text: string;
}

export async function sendTelegramMessage({
  chatId,
  text,
}: TelegramMessageInput) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured.");
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Telegram request failed with status ${response.status}.`);
  }

  return response.json();
}
