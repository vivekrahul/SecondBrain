/**
 * Generates a short deterministic hash from text for duplicate detection.
 * Uses Web Crypto API (available in Node 18+ and all modern browsers).
 */
export async function contentHash(text: string): Promise<string> {
  const normalized = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // strip punctuation
    .replace(/\s+/g, ' ')     // collapse whitespace
    .trim();

  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Return first 16 chars — enough for collision resistance in small user datasets
  return hashHex.slice(0, 16);
}
