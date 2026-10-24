/** Downscale an image file to a JPEG data URL (max edge px) for upload. */
export async function fileToDataUrl(file: File, max = 1024): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

export const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
