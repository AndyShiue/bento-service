"use client";

import { useState } from "react";
import { Button, NavbarItem } from "@heroui/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { BentoCard } from "@/components/BentoCard";
import { mockBentos } from "@/data/mockBentos";

export default function HomePage() {
  const [isUserLoggedIn] = useState(false);
  const router = useRouter();

  const handleFavoriteClick = (bentoId: string) => {
    // 這裡之後會連接到 AWS 後端
    console.log(`加入最愛: ${bentoId}`);
  };

  const handleAdminLogin = () => {
    // 跳轉到登入頁面
    router.push("/login");
  };

  const handleUserLogin = () => {
    // 這裡之後會連接到 AWS Cognito
    alert("使用者登入功能將由 AWS Cognito 實現，尚未開發完成");
  };

  const centerContent = (
    <h1 className="text-xl font-bold">友善時光</h1>
  );

  const rightContent = (
    <>
      <NavbarItem>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAdminLogin}
        >
          登入至後台
        </Button>
      </NavbarItem>
      <NavbarItem>
        <Button
          variant="solid"
          color="primary"
          size="sm"
          onClick={handleUserLogin}
        >
          使用者登入
        </Button>
      </NavbarItem>
    </>
  );

  return (
    <div className="min-h-screen">
      <Navbar centerContent={centerContent} rightContent={rightContent} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">今日便當</h2>
          <p className="text-default-500">新鮮製作，營養美味</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockBentos.map((bento) => (
            <BentoCard
              key={bento.id}
              bento={bento}
              isLoggedIn={isUserLoggedIn}
              onFavoriteClick={handleFavoriteClick}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
