export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function validateImageBytes(buffer: Buffer) {
  if (buffer.length < 32) throw new Error("O arquivo é pequeno demais para ser uma imagem válida.");
  if (buffer.length > MAX_IMAGE_BYTES) throw new Error("A imagem deve ter no máximo 5 MB.");

  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return { extension: "png", contentType: "image/png" };
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { extension: "jpg", contentType: "image/jpeg" };
  }
  if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") {
    return { extension: "webp", contentType: "image/webp" };
  }
  throw new Error("Formato não suportado. Use PNG, JPEG ou WebP; SVG não é permitido.");
}
