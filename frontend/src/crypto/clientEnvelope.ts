/**
 * MVP: UTF-8 → base64 «конверт» — сервер мәтінді оқымайды.
 * Өндірісте: WebCrypto AES-GCM немесе Signal Double Ratchet.
 */
export function envelopeEncryptPlaintextForDemo(plain: string): string {
  const enc = new TextEncoder().encode(plain);
  let bin = "";
  enc.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

export function envelopeDecryptDemo(ciphertext: string): string {
  const bin = atob(ciphertext);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
