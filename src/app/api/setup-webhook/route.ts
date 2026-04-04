import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not set' }, { status: 500 });
  }

  // Derive the public URL from the request origin
  const url = new URL(request.url);
  const webhookUrl = `${url.origin}/api/telegram-webhook`;

  const response = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`,
  );

  const data = await response.json();

  if (data.ok) {
    return NextResponse.json({
      success: true,
      message: `Webhook set to: ${webhookUrl}`,
      telegram: data,
    });
  } else {
    return NextResponse.json({ error: 'Failed to set webhook', telegram: data }, { status: 500 });
  }
}
