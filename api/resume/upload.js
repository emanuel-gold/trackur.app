import { PutObjectCommand } from '@aws-sdk/client-s3';
import { verifyAuth } from '../_lib/auth.js';
import { r2, BUCKET } from '../_lib/r2.js';

export const config = { api: { bodyParser: false } };

const MAX_SIZE = 200 * 1024; // 200 KB
const ALLOWED_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = await verifyAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const contentType = req.headers['content-type'];
  const ext = ALLOWED_TYPES[contentType];
  if (!ext) {
    return res.status(400).json({ error: 'Only PDF and DOCX files are allowed' });
  }

  const body = await readBody(req);

  if (body.length > MAX_SIZE) {
    return res.status(400).json({ error: 'File must be under 200 KB' });
  }

  const storagePath = `${userId}/${crypto.randomUUID()}.${ext}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: storagePath,
      Body: body,
      ContentType: contentType,
    }),
  );

  return res.status(200).json({ storagePath });
}
