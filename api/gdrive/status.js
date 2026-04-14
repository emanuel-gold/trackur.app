import { verifyAuth } from '../_lib/auth.js';
import { hasConnection } from '../_lib/google.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = await verifyAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const connected = await hasConnection(userId);
  return res.status(200).json({ connected });
}
