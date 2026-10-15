import { ImageItem } from './image-types';

class ObjectUrlManager {
  private activeUrls = new Set<string>();

  create(blobOrFile: Blob | File): string {
    const url = URL.createObjectURL(blobOrFile);
    this.activeUrls.add(url);
    return url;
  }

  revoke(url: string | null | undefined): void {
    if (url && this.activeUrls.has(url)) {
      URL.revokeObjectURL(url);
      this.activeUrls.delete(url);
    }
  }

  revokeItem(item: ImageItem): void {
    this.revoke(item.previewUrl);
    this.revoke(item.resultUrl);
  }

  revokeAll(): void {
    for (const url of this.activeUrls) {
      URL.revokeObjectURL(url);
    }
    this.activeUrls.clear();
  }
}

export const objectUrls = new ObjectUrlManager();
