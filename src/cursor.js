
function encodeCursor(doc) {
  const payload = JSON.stringify({
    createdAt: doc.createdAt.toISOString(),
    id: doc._id.toString(),
  });
  return Buffer.from(payload, 'utf8').toString('base64');
}

function decodeCursor(cursor) {
  try {
    const payload = Buffer.from(cursor, 'base64').toString('utf8');
    const { createdAt, id } = JSON.parse(payload);
    if (!createdAt || !id) return null;
    return { createdAt: new Date(createdAt), id };
  } catch {
    return null;
  }
}

module.exports = { encodeCursor, decodeCursor };
