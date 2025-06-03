// 前端顯示用的便當介面
export interface Bento {
  id: string;
  name: string;
  description: string;
  image: string;
  available: boolean;
}

// 後端 API 回傳的便當資料介面
export interface StoreBento {
  id?: string;
  itemId?: string;
  name: string;
  description?: string;
  image?: string;
  filename?: string;
  available?: boolean;
}

// 店家資料介面
export interface StoreData {
  storeId: string;
  name: string;
  address?: string;
  phone?: string;
  description?: string;
} 