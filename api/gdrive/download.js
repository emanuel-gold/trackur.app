import { verifyAuth } from '../_lib/auth.js';
import { getValidTokens, DriveDisconnectedError } from '../_lib/google.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = await verifyAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { fileId } = req.body || {};
  if (!fileId || typeof fileId !== 'string') {
    return res.status(400).json({ error: 'Missing fileId' });
  }

  let accessToken;
  try {
    accessToken = await getValidTokens(userId);
  } catch (err) {
    if (err instanceof DriveDisconnectedError) {
      return res.status(401).json({ error: 'gdrive_disconnected' });
    }
    return res.status(500).json({ error: 'Failed to authenticate with Google Drive' });
  }

  try {
    // Fetch file metadata first to get the name and MIME type
    const metaRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?fields=name,mimeType,size`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!metaRes.ok) {
      const body = await metaRes.text();
      console.error('GDrive metadata fetch failed:', body);
      return res.status(metaRes.status === 404 ? 404 : 502).json({
        error: metaRes.status === 404 ? 'File not found in Google Drive' : 'Failed to fetch file info',
      });
    }
    const meta = await metaRes.json();

    // Download the file content
    const dlRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!dlRes.ok) {
      return res.status(502).json({ error: 'Failed to download file from Google Drive' });
    }

    const buffer = Buffer.from(await dlRes.arrayBuffer());

    res.setHeader('Content-Type', meta.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(meta.name)}"`);
    res.setHeader('Content-Length', buffer.length);
    return res.status(200).send(buffer);
  } catch (err) {
    console.error('GDrive download proxy failed:', err);
    return res.status(502).json({ error: 'Failed to download file from Google Drive' });
  }
}
