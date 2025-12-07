/**
 * Utility to generate blur placeholder for images (LQIP - Low Quality Image Placeholder)
 * Uses sharp for server-side image processing
 */

// Default shimmer placeholder (gray background)
export const defaultBlurDataUrl = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+`;

/**
 * Generate a tiny blurred version of an image as base64 data URL
 * This creates a ~10x10 pixel version that's ~200-500 bytes
 */
export async function generateBlurDataUrl(imageUrl: string): Promise<string | null> {
  try {
    // Dynamic import sharp (only available server-side)
    const sharp = (await import('sharp')).default;
    
    // Fetch the image
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BlurGenerator/1.0)',
      },
    });
    
    if (!response.ok) {
      console.warn(`Failed to fetch image for blur: ${imageUrl}`);
      return null;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Generate tiny blurred version
    const blurredBuffer = await sharp(buffer)
      .resize(10, 10, { fit: 'inside' })
      .blur(1)
      .jpeg({ quality: 50 })
      .toBuffer();
    
    // Convert to base64 data URL
    const base64 = blurredBuffer.toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error(`Error generating blur for ${imageUrl}:`, error);
    return null;
  }
}

/**
 * Generate blur data URLs for multiple images in parallel
 * With concurrency limit to avoid overwhelming the server
 */
export async function generateBlurDataUrls(
  imageUrls: string[],
  concurrency = 5
): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>();
  
  // Process in batches
  for (let i = 0; i < imageUrls.length; i += concurrency) {
    const batch = imageUrls.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (url) => {
        const blur = await generateBlurDataUrl(url);
        return { url, blur };
      })
    );
    
    batchResults.forEach(({ url, blur }) => {
      results.set(url, blur);
    });
  }
  
  return results;
}
