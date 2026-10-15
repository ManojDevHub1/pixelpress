export interface DecodedImage {
  bitmap: ImageBitmap;
  width: number;
  height: number;
}

export async function decodeImage(fileOrBlob: Blob): Promise<DecodedImage> {
  let bitmap: ImageBitmap | null = null;
  try {
    // Standard path with EXIF orientation preserved
    bitmap = await createImageBitmap(fileOrBlob, { imageOrientation: 'from-image' });
  } catch {
    // Fallback without options dictionary if browser rejects options
    bitmap = await createImageBitmap(fileOrBlob);
  }

  return {
    bitmap,
    width: bitmap.width,
    height: bitmap.height,
  };
}
