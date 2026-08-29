"use client";

/**
 * Client-side background removal via @imgly/background-removal (ONNX in browser).
 * Returns a PNG data URL with transparent background.
 */
export async function removeImageBackground(
  source: string | Blob | File | HTMLImageElement,
  onProgress?: (key: string) => void
): Promise<string> {
  const { removeBackground } = await import("@imgly/background-removal");

  const blob = await removeBackground(source, {
    progress: (key) => {
      onProgress?.(key);
    },
    output: {
      format: "image/png",
      quality: 0.92,
    },
  });

  return await blobToDataUrl(blob);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read image"));
    reader.readAsDataURL(blob);
  });
}
