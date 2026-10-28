export function buildEmailHtml(name: string, email: string, message: string): string {
  const date = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0f0f14;font-family:system-ui,sans-serif;">
<table width="100%" style="background:#0f0f14;padding:32px 16px;"><tr><td align="center">
<table width="560" style="max-width:560px;width:100%;">
<tr><td style="background:linear-gradient(135deg,#1e3a5f,#1a2744);border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
<h1 style="margin:0;font-size:18px;font-weight:700;color:#fff;">📩 Pesan Baru dari Portfolio</h1>
<p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.5);">${date}</p>
</td></tr>
<tr><td style="background:#141820;padding:28px 32px;border:1px solid rgba(255,255,255,0.06);border-top:none;">
<table width="100%">
<tr><td style="background:#1a1f2a;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px 18px;margin-bottom:14px;">
<p style="margin:0 0 3px;font-size:10px;font-weight:700;letter-spacing:0.08em;color:#3b82f6;text-transform:uppercase;">Pengirim</p>
<p style="margin:0;font-size:15px;font-weight:600;color:#fff;">${name}</p>
</td></tr>
<tr><td style="height:8px;"></td></tr>
<tr><td style="background:#1a1f2a;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px 18px;">
<p style="margin:0 0 3px;font-size:10px;font-weight:700;letter-spacing:0.08em;color:#60a5fa;text-transform:uppercase;">Email</p>
<p style="margin:0;font-size:14px;color:#93c5fd;">${email}</p>
</td></tr>
<tr><td style="height:8px;"></td></tr>
<tr><td style="background:#1a1f2a;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px 18px;">
<p style="margin:0 0 10px;font-size:10px;font-weight:700;letter-spacing:0.08em;color:#818cf8;text-transform:uppercase;">Pesan</p>
<p style="margin:0;font-size:14px;line-height:1.7;color:rgba(255,255,255,0.8);white-space:pre-wrap;">${message}</p>
</td></tr>
</table>
</td></tr>
<tr><td style="background:#0f1117;border-radius:0 0 16px 16px;border:1px solid rgba(255,255,255,0.06);border-top:none;padding:16px 32px;text-align:center;">
<p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);">© 2026 Aka Portfolio — Notifikasi otomatis</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

