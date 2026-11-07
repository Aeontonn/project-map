// Uploaded images are stored inside the board's save data as "data URLs"
// (the image written out as text). localStorage only holds ~5 MB in total,
// so every image is shrunk and compressed first, usually to 50–100 KB.

const MAX_SIDE = 800 // px: big enough for a large card, small enough to store
const QUALITY = 0.8 // 0–1: lower = smaller file, blurrier image

// Shrinks an image file and returns it as a data URL you can put in <img src>.
export async function shrinkImage(file: Blob): Promise<string> {
  const bitmap = await createImageBitmap(file) // decodes PNG/JPEG/WebP/GIF
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height)) // never enlarge
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  // WebP is the smallest; browsers that can't make WebP silently return PNG instead,
  // so in that case fall back to JPEG
  const webp = canvas.toDataURL('image/webp', QUALITY)
  return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', QUALITY)
}

// Finds the first image among dropped or pasted files (or null if there's none)
export function firstImage(files: FileList | null | undefined): File | null {
  return Array.from(files ?? []).find((f) => f.type.startsWith('image/')) ?? null
}
