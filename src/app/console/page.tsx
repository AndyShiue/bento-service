"use client";

import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  NavbarItem,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Bento, StoreBento } from "@/types/bento";

interface StoreInfo {
  name: string;
  address: string;
  phone: string;
  description: string;
}

export default function ConsolePage() {
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: "友善時光便當店",
    address: "台北市大安區信義路四段123號",
    phone: "02-2345-6789",
    description: "提供新鮮美味的便當，注重健康與營養均衡",
  });
  
  const [bentos, setBentos] = useState<Bento[]>([]);
  const [selectedBento, setSelectedBento] = useState<Bento | null>(null);
  const [editingBento, setEditingBento] = useState<Bento | null>(null);
  const [loadingBentos, setLoadingBentos] = useState(false);
  const router = useRouter();

  const parseJwt = (token: string) => {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  };

  // 轉換後端便當資料為 BentoCard 組件期望的格式
  const convertToBento = (storeBento: StoreBento): Bento => {
    return {
      id: storeBento.id || storeBento.itemId || '',
      name: storeBento.name,
      description: storeBento.description || '',
      image: storeBento.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
      available: storeBento.available !== false
    };
  };

  // 獲取圖片 URL
  const fetchImageUrl = async (filename: string): Promise<string> => {
    try {
      const token = localStorage.getItem("id_token");
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${parseJwt(token).sub}`;
      }
      
      const response = await fetch(`https://ybdrax2oo0.execute-api.ap-southeast-2.amazonaws.com/dev/getItemImg`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          filename: filename
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.statusCode === 200 && data.body) {
          const imageData = JSON.parse(data.body);
          return imageData.url || '';
        }
      }
    } catch (error) {
      console.error('Error fetching image URL:', error);
    }
    
    return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop';
  };

  // 獲取便當列表
  const fetchBentos = async () => {
    try {
      setLoadingBentos(true);
      const token = localStorage.getItem("id_token");
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${parseJwt(token).sub}`;
      }
      
      const response = await fetch(`https://ybdrax2oo0.execute-api.ap-southeast-2.amazonaws.com/dev/getItemData`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          storeId: parseJwt(token!).sub,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.statusCode === 200 && data.body) {
          const bentoArray = JSON.parse(data.body);
          
          if (bentoArray && Array.isArray(bentoArray) && bentoArray.length > 0) {
            const bentosWithImages = await Promise.all(
              bentoArray.map(async (bento: StoreBento) => {
                if (bento.filename) {
                  const imageUrl = await fetchImageUrl(bento.filename);
                  return { ...bento, image: imageUrl };
                }
                return { 
                  ...bento, 
                  image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop' 
                };
              })
            );
            
            const convertedBentos = bentosWithImages.map(convertToBento);
            setBentos(convertedBentos);
          } else {
            setBentos([]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching bentos:', error);
      setBentos([]);
    } finally {
      setLoadingBentos(false);
    }
  };

  useEffect(() => {
    fetchBentos();
  }, []);

  const handleStoreInfoSave = async () => {
    try {
      const token = localStorage.getItem("id_token");
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // 只有在有 token 時才添加 Authorization header
      if (token) {
        headers['Authorization'] = `Bearer ${parseJwt(token).sub}`;
      }

      const storeData = {
        storeId: parseJwt(token!).sub,
        name: storeInfo.name,
        address: storeInfo.address,
        phone: storeInfo.phone,
        description: storeInfo.description,
      };

      // 首先嘗試 updateStoreData
      const updateResponse = await fetch(`https://ybdrax2oo0.execute-api.ap-southeast-2.amazonaws.com/dev/updateStoreData`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(storeData),
      });

      if (updateResponse.ok) {
        alert("店家資訊已更新！");
        return;
      }

      // 如果 updateStoreData 失敗，嘗試 setStoreData
      console.log('updateStoreData failed, trying setStoreData...');
      const setResponse = await fetch(`https://ybdrax2oo0.execute-api.ap-southeast-2.amazonaws.com/dev/setStoreData`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(storeData),
      });

      if (setResponse.ok) {
        alert("店家資訊已更新！");
      } else {
        alert("更新失敗，請稍後再試。");
      }
    } catch (error) {
      console.error('Error updating store info:', error);
      alert("網路錯誤，請稍後再試。");
    }
  };

  const handleBentoSelect = (bento: Bento) => {
    setSelectedBento(bento);
    setEditingBento({ ...bento });
  };

  const handleBentoSave = async () => {
    if (!editingBento) return;
    
    try {
      const token = localStorage.getItem("id_token");
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${parseJwt(token).sub}`;
      }

      const bentoData = {
        storeId: parseJwt(token!).sub,
        itemId: editingBento.id,
        name: editingBento.name,
        image_base64: "",
        content_type: "image/jpeg",
        // TODO: 處理圖片上傳
      };

      const response = await fetch(`https://ybdrax2oo0.execute-api.ap-southeast-2.amazonaws.com/dev/updateItemData`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(bentoData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.statusCode === 200) {
          // 更新本地狀態
          fetchBentos();
          setSelectedBento(editingBento);
          alert("便當資訊已更新！");
        } else {
          alert("更新便當失敗，請稍後再試。");
        }
      } else {
        alert("更新便當失敗，請稍後再試。");
      }
    } catch (error) {
      console.error('Error updating bento:', error);
      alert("網路錯誤，請稍後再試。");
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editingBento) {
      // 模擬圖片上傳
      const imageUrl = URL.createObjectURL(file);
      setEditingBento({ ...editingBento, image: imageUrl });
    }
  };

  const handleNewBento = async () => {
    try {
      const token = localStorage.getItem("id_token");
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${parseJwt(token).sub}`;
      }

      // 建立新便當的預設資料
      const newBentoData = {
        storeId: parseJwt(token!).sub,
        name: "新便當",
        description: "請編輯便當描述",
        image_base64: "",
        content_type: "image/jpeg",
        // TODO: Handle the image properly.
        // 可以添加其他必要欄位
      };

      const response = await fetch(`https://ybdrax2oo0.execute-api.ap-southeast-2.amazonaws.com/dev/setItemData`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(newBentoData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.statusCode === 200) {
          alert("新便當已建立！");
          // 重新獲取便當列表以顯示新增的便當
          await fetchBentos();
        } else {
          alert("建立便當失敗，請稍後再試。");
        }
      } else {
        alert("建立便當失敗，請稍後再試。");
      }
    } catch (error) {
      console.error('Error creating new bento:', error);
      alert("網路錯誤，請稍後再試。");
    }
  };

  const leftContent = (
    <NavbarItem>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/")}
      >
        回到便當列表
      </Button>
    </NavbarItem>
  );

  const centerContent = (
    <h1 className="text-xl font-bold">後台管理</h1>
  );

  return (
    <div className="min-h-screen">
      <Navbar 
        leftContent={leftContent} 
        centerContent={centerContent} 
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* 店家資訊編輯區域 */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-bold">店家資訊</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                label="店名"
                value={storeInfo.name}
                onChange={(e) => setStoreInfo({ ...storeInfo, name: e.target.value })}
              />
              
              <Input
                label="店家描述"
                value={storeInfo.description}
                onChange={(e) => setStoreInfo({ ...storeInfo, description: e.target.value })}
              />

              <Input
                label="地址"
                value={storeInfo.address}
                onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })}
              />
              
              <Input
                label="電話"
                value={storeInfo.phone}
                onChange={(e) => setStoreInfo({ ...storeInfo, phone: e.target.value })}
              />

            </div>
            
            <div className="flex justify-end">
              <Button
                color="primary"
                onClick={handleStoreInfoSave}
              >
                設定
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* 便當管理區域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側：便當列表 */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">便當列表</h2>
            </CardHeader>
            <CardBody>
              {loadingBentos ? (
                <div className="p-8 text-center">
                  <p>載入便當資料中...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                    {bentos.length > 0 ? (
                      bentos.map((bento) => (
                        <div
                          key={bento.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedBento?.id === bento.id
                              ? "border-primary bg-primary/10"
                              : "border-default-200 hover:border-default-300"
                          }`}
                          onClick={() => handleBentoSelect(bento)}
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={bento.image}
                              alt={bento.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold">{bento.name}</h3>
                              <p className="text-sm text-default-500 line-clamp-2">
                                {bento.description}
                              </p>
                              <span
                                className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${
                                  bento.available
                                    ? "bg-success/20 text-success"
                                    : "bg-danger/20 text-danger"
                                }`}
                              >
                                {bento.available ? "有貨" : "售完"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-default-500">
                        <p>目前沒有便當商品</p>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    color="primary"
                    variant="bordered"
                    onClick={handleNewBento}
                    className="w-full"
                  >
                    新便當
                  </Button>
                </>
              )}
            </CardBody>
          </Card>

          {/* 右側：便當編輯 */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">
                {selectedBento ? "編輯便當" : "選擇便當進行編輯"}
              </h2>
            </CardHeader>
            <CardBody>
              {selectedBento && editingBento ? (
                <div className="space-y-4">
                  {/* 便當圖片 */}
                  <div className="text-center">
                    <img
                      src={editingBento.image}
                      alt={editingBento.name}
                      className="w-32 h-32 object-cover rounded-lg mx-auto mb-4"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      aria-label="上傳便當圖片"
                    />
                    <Button
                      color="secondary"
                      size="sm"
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      上傳新圖片
                    </Button>
                  </div>

                  {/* 便當名稱 */}
                  <Input
                    label="便當名稱"
                    value={editingBento.name}
                    onChange={(e) => setEditingBento({ ...editingBento, name: e.target.value })}
                  />

                  {/* 便當描述 */}
                  <Textarea
                    label="便當描述"
                    value={editingBento.description}
                    onChange={(e) => setEditingBento({ ...editingBento, description: e.target.value })}
                    rows={4}
                  />

                  {/* 儲存按鈕 */}
                  <Button
                    color="primary"
                    onClick={handleBentoSave}
                    className="w-full"
                  >
                    儲存變更
                  </Button>
                </div>
              ) : (
                <div className="text-center text-default-500 py-8">
                  <p>請選擇一個便當進行編輯</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

      </main>
    </div>
  );
} 