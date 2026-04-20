import { verifyAuth } from '../_lib/auth.js';
import { getValidTokens, DriveDisconnectedError } from '../_lib/google.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = await verifyAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const accessToken = await getValidTokens(userId);
    return res.status(200).json({ accessToken });
  } catch (err) {
    if (err instanceof DriveDisconnectedError) {
      return res.status(200).json({ connected: false });
    }
    console.error('GDrive picker-token failed:', err);
    return res.status(500).json({ error: 'Failed to get picker token' });
  }
}
