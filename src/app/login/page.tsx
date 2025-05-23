"use client";

import { Card, CardBody, CardHeader, Button, Input } from "@heroui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    // 這裡之後會連接到 AWS Cognito
    alert("AWS Cognito 登入功能尚未實現");
    // 模擬登入成功，跳轉到後台
    router.push("/console");
  };

  const centerContent = (
    <h1 className="text-xl font-bold">友善時光 - 後台登入</h1>
  );

  return (
    <div className="min-h-screen">
      <Navbar centerContent={centerContent} />
      
      <main className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-80px)]">
        <Card className="w-full max-w-md">
          <CardHeader className="pb-0 pt-6 px-6">
            <h2 className="text-2xl font-bold">後台登入</h2>
          </CardHeader>
          <CardBody className="p-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              className="space-y-4"
            >
              <Input
                type="email"
                label="電子郵件"
                placeholder="請輸入您的電子郵件"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                label="密碼"
                placeholder="請輸入您的密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="submit"
                color="primary"
                className="w-full"
                size="lg"
              >
                登入
              </Button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-sm text-default-500">
                此頁面將由 AWS Cognito 實現
              </p>
            </div>
          </CardBody>
        </Card>
      </main>
    </div>
  );
} 