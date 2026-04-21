export async function compressImage(file: File, minSizeKB: number = 500, maxSizeKB: number = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Initial scale down if very large to save memory and stay within reasonable limits
        const maxDimension = 1920; 
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);

        // Base64 size is roughly 1.33 times the binary size
        const maxBase64Length = maxSizeKB * 1024 * 1.33;
        
        let quality = 0.95;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // If the image is already within or below the range, we're good
        if (dataUrl.length <= maxBase64Length) {
          resolve(dataUrl);
          return;
        }

        // Iterative compression to get under the max size
        while (dataUrl.length > maxBase64Length && quality > 0.1) {
          quality -= 0.05;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
