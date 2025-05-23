"use client";

import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Switch,
  NavbarItem,
} from "@heroui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Bento } from "@/components/BentoCard";
import { mockBentos } from "@/data/mockBentos";

export default function ConsolePage() {
  const [bentos, setBentos] = useState<Bento[]>(mockBentos);
  const [newBento, setNewBento] = useState<Omit<Bento, "id">>({
    name: "",
    description: "",
    price: 0,
    image: "",
    available: true,
  });
  const router = useRouter();

  const handleAddBento = () => {
    if (!newBento.name || !newBento.description || newBento.price <= 0) {
      alert("請填寫完整的便當資訊");
      return;
    }

    const newId = (bentos.length + 1).toString();
    const bentoToAdd: Bento = {
      ...newBento,
      id: newId,
    };

    setBentos([...bentos, bentoToAdd]);
    setNewBento({
      name: "",
      description: "",
      price: 0,
      image: "",
      available: true,
    });
    
    alert("便當已新增到庫存！（實際上會上傳至 AWS 雲端）");
  };

  const handleUpdateAvailability = (id: string, available: boolean) => {
    setBentos(bentos.map(bento => 
      bento.id === id ? { ...bento, available } : bento
    ));
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
    <h1 className="text-xl font-bold">後台</h1>
  );

  return (
    <div className="min-h-screen">
      <Navbar 
        leftContent={leftContent} 
        centerContent={centerContent} 
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 新增便當表單 */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">新增便當</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="便當名稱"
                placeholder="請輸入便當名稱"
                value={newBento.name}
                onChange={(e) => setNewBento({ ...newBento, name: e.target.value })}
              />
              <Textarea
                label="便當描述"
                placeholder="請輸入便當描述"
                value={newBento.description}
                onChange={(e) => setNewBento({ ...newBento, description: e.target.value })}
              />
              <Input
                type="number"
                label="價格 (NT$)"
                placeholder="請輸入價格"
                value={newBento.price.toString()}
                onChange={(e) => setNewBento({ ...newBento, price: parseInt(e.target.value) || 0 })}
              />
              <Input
                label="圖片網址"
                placeholder="請輸入圖片網址"
                value={newBento.image}
                onChange={(e) => setNewBento({ ...newBento, image: e.target.value })}
              />
              <div className="flex items-center space-x-2">
                <Switch
                  isSelected={newBento.available}
                  onValueChange={(checked) => setNewBento({ ...newBento, available: checked })}
                />
                <span>有貨</span>
              </div>
              <Button
                color="primary"
                onClick={handleAddBento}
                className="w-full"
              >
                新增便當
              </Button>
            </CardBody>
          </Card>

          {/* 現有便當管理 */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">便當庫存管理</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {bentos.map((bento) => (
                  <div
                    key={bento.id}
                    className="flex items-center justify-between p-3 border border-default-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{bento.name}</h3>
                      <p className="text-sm text-default-500">NT$ {bento.price}</p>
                    </div>
                    <Switch
                      isSelected={bento.available}
                      onValueChange={(checked) => handleUpdateAvailability(bento.id, checked)}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
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