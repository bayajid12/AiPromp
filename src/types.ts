export interface ImageItem {
  id: string;
  url: string;
  prompt: string;
  tags: string[];
  author: string;
  height: number;
}

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
  count: string;
}
