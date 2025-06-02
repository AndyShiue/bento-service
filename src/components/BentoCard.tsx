"use client";

import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";

export interface Bento {
  id: string;
  name: string;
  description: string;
  image: string;
  available: boolean;
}

interface BentoCardProps {
  bento: Bento;
  isLoggedIn: boolean;
}

export function BentoCard({ bento, isLoggedIn }: BentoCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const parseJwt = (token: string) => {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  };

  useEffect(() => {
    // 獲取最愛狀態
    const fetchFavoriteStatus = async () => {
      if (!isLoggedIn || !localStorage.getItem("id_token")) {
        return;
      }

      try {
        const response = await fetch(`https://ybdrax2oo0.execute-api.ap-southeast-2.amazonaws.com/dev/getLoveItem`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${parseJwt(localStorage.getItem("id_token")!).sub}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: parseJwt(localStorage.getItem("id_token")!).sub
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.statusCode === 200 && data.body) {
            const favoriteData = JSON.parse(data.body);
            const isFavorite = Array.isArray(favoriteData) && 
              favoriteData.some((item: { itemId: string }) => item.itemId === bento.id);
            setIsFavorited(isFavorite);
          }
        }
      } catch (error) {
        console.error('Error fetching favorite status:', error);
      }
    };

    fetchFavoriteStatus();
  }, [bento.id, isLoggedIn]);

  // 設定最愛狀態
  const setFavoriteStatus = async (newStatus: boolean) => {
    if (!isLoggedIn || !localStorage.getItem("id_token")) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`https://ybdrax2oo0.execute-api.ap-southeast-2.amazonaws.com/dev/setLoveItem`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${parseJwt(localStorage.getItem("id_token")!).sub}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: parseJwt(localStorage.getItem("id_token")!).sub,
          itemId: bento.id
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(newStatus ? '加入最愛成功:' : '移除最愛成功:', data);
        setIsFavorited(newStatus);
      } else {
        console.error('設定最愛狀態失敗:', response.status);
        alert('操作失敗，請稍後再試。');
      }
    } catch (error) {
      console.error('設定最愛狀態時發生錯誤:', error);
      alert('網路錯誤，請稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteClick = () => {
    if (!isLoggedIn) {
      alert("請先登入才能加入我的最愛！");
      return;
    }
    
    if (isLoading) {
      return; // 防止重複點擊
    }

    const newStatus = !isFavorited;
    setFavoriteStatus(newStatus);
  };

  // FIXME: Fetch real images from AWS S3.

  return (
    <Card className="w-full max-w-[300px] hover:shadow-lg transition-shadow">
      <CardHeader className="relative p-0">
        <img
          src={bento.image}
          alt={bento.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          className="absolute top-2 right-2 backdrop-blur-sm"
          onClick={handleFavoriteClick}
          disabled={isLoading}
        >
          <Heart
            className={`w-4 h-4 ${
              isFavorited ? "fill-red-500 text-red-500" : ""
            } ${isLoading ? "opacity-50" : ""}`}
          />
        </Button>
      </CardHeader>
      <CardBody className="p-4">
        <h3 className="text-lg font-semibold mb-2">{bento.name}</h3>
        <p className="text-sm text-default-500 mb-3">{bento.description}</p>
        <div className="flex justify-between items-center">
          <span
            className={`text-sm px-2 py-1 rounded-full ${
              bento.available
                ? "bg-success/20 text-success"
                : "bg-danger/20 text-danger"
            }`}
          >
            {bento.available ? "有貨" : "售完"}
          </span>
        </div>
      </CardBody>
    </Card>
  );
} 