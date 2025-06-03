// 前端顯示用的便當介面
export interface Bento {
  id: string;
  name: string;
  description: string;
  image: string;
  quantity?: number;
}

// 後端 API 回傳的便當資料介面
export interface StoreBento {
  id?: string;
  itemId?: string;
  name: string;
  description?: string;
  image?: string;
  filename?: string;
  quantity?: number;
}

// 店家資料介面
export interface StoreData {
  storeId: string;
  name: string;
  address?: string;
  phone?: string;
  description?: string;
} 