export function calculateCRC16(payload: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
    }
  }
  crc &= 0xFFFF; // Mask to 16-bit
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function generateDynamicQRIS(staticPayload: string, amount: number): string {
  if (!staticPayload || amount <= 0) return staticPayload;

  let payload = staticPayload.trim();

  // Remove Tag 63 (CRC) which is always the last 8 characters (6304 + 4 hex chars)
  const tag63Index = payload.lastIndexOf("6304");
  if (tag63Index !== -1 && tag63Index >= payload.length - 8) {
    payload = payload.substring(0, tag63Index);
  }

  // Change from Static (010211) to Dynamic (010212)
  payload = payload.replace("010211", "010212");

  // Construct Tag 54 (Transaction Amount)
  const amountStr = amount.toString();
  const lengthStr = amountStr.length.toString().padStart(2, "0");
  const tag54 = `54${lengthStr}${amountStr}`;

  // Insert Tag 54 before Tag 58 (Country Code) or Tag 59 (Merchant Name) to be safe
  const insertBeforeTags = ["5802", "590", "600", "610"];
  let inserted = false;
  
  for (const tag of insertBeforeTags) {
    const index = payload.indexOf(tag);
    if (index !== -1) {
      payload = payload.substring(0, index) + tag54 + payload.substring(index);
      inserted = true;
      break;
    }
  }

  if (!inserted) {
    payload += tag54;
  }

  // Append Tag 63 header
  payload += "6304";

  // Calculate new CRC and append
  const crc = calculateCRC16(payload);
  return payload + crc;
}
