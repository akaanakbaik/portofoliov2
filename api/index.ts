export default function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ ok: true, env: !!process.env.ADMIN_PASSWORD, time: new Date().toISOString() }));
}
