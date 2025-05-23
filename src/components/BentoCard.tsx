"use client";

import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import { Heart } from "lucide-react";
import { useState } from "react";

export interface Bento {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
}

interface BentoCardProps {
  bento: Bento;
  isLoggedIn: boolean;
  onFavoriteClick: (bentoId: string) => void;
}

export function BentoCard({ bento, isLoggedIn, onFavoriteClick }: BentoCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavoriteClick = () => {
    if (!isLoggedIn) {
      alert("請先登入才能加入我的最愛！");
      return;
    }
    setIsFavorited(!isFavorited);
    onFavoriteClick(bento.id);
  };

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
        >
          <Heart
            className={`w-4 h-4 ${
              isFavorited ? "fill-red-500 text-red-500" : ""
            }`}
          />
        </Button>
      </CardHeader>
      <CardBody className="p-4">
        <h3 className="text-lg font-semibold mb-2">{bento.name}</h3>
        <p className="text-sm text-default-500 mb-3">{bento.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-primary">NT$ {bento.price}</span>
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