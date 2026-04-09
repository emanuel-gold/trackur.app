import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { verifyAuth } from '../_lib/auth.js';
import { r2, BUCKET } from '../_lib/r2.js';

const PATH_PATTERN = /^[a-f0-9-]+\/[a-f0-9-]+\.(pdf|docx)$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = await verifyAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { storagePath } = req.body ?? {};
  if (
    !storagePath ||
    !storagePath.startsWith(`${userId}/`) ||
    !PATH_PATTERN.test(storagePath)
  ) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  await r2.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: storagePath,
    }),
  );

  return res.status(200).json({ ok: true });
}
