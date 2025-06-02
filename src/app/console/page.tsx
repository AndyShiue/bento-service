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
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Bento } from "@/components/BentoCard";

interface StoreInfo {
  name: string;
  address: string;
  phone: string;
}

const mockBentos: Bento[] = [
  {
    id: "1",
    name: "經典排骨便當",
    description: "香嫩排骨配白飯和三樣配菜",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop",
    available: true,
  },
  {
    id: "2", 
    name: "雞腿便當",
    description: "烤雞腿配時蔬和滷蛋",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=200&fit=crop",
    available: true,
  },
];

export default function ConsolePage() {
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: "友善時光便當店",
    address: "台北市大安區信義路四段123號",
    phone: "02-2345-6789",
  });
  
  const [bentos, setBentos] = useState<Bento[]>(mockBentos);
  const [selectedBento, setSelectedBento] = useState<Bento | null>(null);
  const [editingBento, setEditingBento] = useState<Bento | null>(null);
  const router = useRouter();

  const handleStoreInfoSave = () => {
    alert("店家資訊已更新！");
  };

  const handleBentoSelect = (bento: Bento) => {
    setSelectedBento(bento);
    setEditingBento({ ...bento });
  };

  const handleBentoSave = () => {
    if (!editingBento) return;
    
    setBentos(bentos.map(bento => 
      bento.id === editingBento.id ? editingBento : bento
    ));
    setSelectedBento(editingBento);
    alert("便當資訊已更新！");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editingBento) {
      // 模擬圖片上傳
      const imageUrl = URL.createObjectURL(file);
      setEditingBento({ ...editingBento, image: imageUrl });
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Input
                label="店名"
                value={storeInfo.name}
                onChange={(e) => setStoreInfo({ ...storeInfo, name: e.target.value })}
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
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {bentos.map((bento) => (
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
                ))}
              </div>
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
                  <p>請從左側選擇一個便當進行編輯</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="mt-8 p-4 bg-warning/10 border border-warning/20 rounded-lg">
          <p className="text-warning text-sm">
            注意：此為模擬後台，實際功能將連接至 AWS 雲端服務。所有資料變更僅在本次會話中有效。
          </p>
        </div>
      </main>
    </div>
  );
} 