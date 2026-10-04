/** Stored ZIP entries: no external upload, compression service, or runtime dependency. */
export async function createBundle(
  entries: { name: string; data: Blob }[],
  signal: AbortSignal,
): Promise<Blob> {
  const encoder = new TextEncoder();
  const parts: BlobPart[] = [];
  const directory: BlobPart[] = [];
  let offset = 0;
  let directorySize = 0;
  const table = Array.from({ length: 256 }, (_, index) => {
    let crc = index;
    for (let bit = 0; bit < 8; bit++)
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    return crc >>> 0;
  });
  for (const entry of entries) {
    signal.throwIfAborted();
    if (!/^[a-zA-Z0-9._-]+$/.test(entry.name))
      throw new Error("Invalid bundle filename.");
    const name = encoder.encode(entry.name);
    const bytes = new Uint8Array(await entry.data.arrayBuffer());
    let crc = 0xffffffff;
    for (let index = 0; index < bytes.length; index++) {
      crc = table[(crc ^ bytes[index]) & 0xff] ^ (crc >>> 8);
      if (index && index % 1_048_576 === 0) {
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        signal.throwIfAborted();
      }
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    const local = new Uint8Array(30);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true);
    lv.setUint16(12, 0x0021, true); // January 1, 1980: valid DOS date.
    lv.setUint32(14, crc, true);
    lv.setUint32(18, bytes.length, true);
    lv.setUint32(22, bytes.length, true);
    lv.setUint16(26, name.length, true);
    parts.push(local, name, bytes);
    const central = new Uint8Array(46);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(14, 0x0021, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, bytes.length, true);
    cv.setUint32(24, bytes.length, true);
    cv.setUint16(28, name.length, true);
    cv.setUint32(42, offset, true);
    directory.push(central, name);
    directorySize += central.length + name.length;
    offset += local.length + name.length + bytes.length;
  }
  signal.throwIfAborted();
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, directorySize, true);
  ev.setUint32(16, offset, true);
  return new Blob([...parts, ...directory, end], { type: "application/zip" });
}
