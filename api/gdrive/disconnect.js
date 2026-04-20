import { verifyAuth } from '../_lib/auth.js';
import { revokeAndDelete } from '../_lib/google.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = await verifyAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await revokeAndDelete(userId);
  } catch (err) {
    console.error('GDrive disconnect failed:', err);
    return res.status(500).json({ error: 'Failed to disconnect Google Drive' });
  }

  return res.status(200).json({ ok: true });
}
