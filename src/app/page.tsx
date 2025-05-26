"use client";

import { useEffect, useState } from "react";
import { Button, NavbarItem } from "@heroui/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { BentoCard } from "@/components/BentoCard";
import { mockBentos } from "@/data/mockBentos";

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(false);
  const [userType, setUserType] = useState("");
  const [userName, setUserName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setIsLogin(true);
        const userObj = JSON.parse(userStr);
        console.log('Existing user type:', userObj.type);
        console.log('Existing user sub:', userObj.sub);
        console.log('Existing user email:', userObj.email);
        console.log('Existing user storeName:', userObj['cognito:username']);
        setUserName(userObj['cognito:username']);
        setUserType(userObj.type);
        return;
      } catch (e) {
        console.error('Error decoding exist IdToken:', e);
        localStorage.clear();
      }
    }
  }, []);

  const handleFavoriteClick = (bentoId: string) => {
    // 這裡之後會連接到 AWS 後端
    console.log(`加入最愛: ${bentoId}`);
  };

  const handleAdminLogin = () => {
    console.log("店家登入")
    const domain = process.env.NEXT_PUBLIC_STORE_COGNITO_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_STORE_COGNITO_APP_CLIENT_ID;
    const redirect = process.env.NEXT_PUBLIC_STORE_COGNITO_REDIRECT_URI;

    console.log("domain",domain)
    console.log("clientId",clientId)
    console.log("redirect",redirect)
    if (!domain || !clientId || !redirect) {
      console.error('環境變數未配置，請檢查');
      alert('登入設定錯誤，請聯繫管理員。');
      return;
    }

    const loginUrl = `${domain}/oauth2/authorize?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirect}&` +
      `scope=openid%20email`;
    router.push(loginUrl);
  };

  const handleUserLogin = () => {
    console.log("消費者登入")
    const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID;
    const redirect = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI;

    if (!domain || !clientId || !redirect) {
      console.error('環境變數未配置，請檢查');
      alert('登入設定錯誤，請聯繫管理員。');
      return;
    }

    const loginUrl = `${domain}/oauth2/authorize?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirect}&` +
      `scope=openid%20email`;
    router.push(loginUrl);
  };

  const handleUserLogout = () => {
    console.log("登出")
    localStorage.clear();
    setIsLogin(false);
    setUserName("");

    const logout = process.env.NEXT_PUBLIC_COGNITO_LOGOUT_URI;
    const domain = (userType == "store")? process.env.NEXT_PUBLIC_STORE_COGNITO_DOMAIN : process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const clientId = (userType == "store")? process.env.NEXT_PUBLIC_STORE_COGNITO_APP_CLIENT_ID : process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID;

    if (!logout || !domain || !clientId) {
      console.error('登出所需環境變數未配置，請檢查');
      alert('登出設定錯誤，請聯繫管理員。');
      router.push('/');
      return;
    }
    const logoutUrl = `${domain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logout)}`;
    router.push(logoutUrl);
  };

  const centerContent = (
    <h1 className="text-xl font-bold">友善時光</h1>
  );

  const rightContent = (
    <>
    {!isLogin?(
      <>
      <NavbarItem>
        <Button variant="ghost" size="sm" onClick={handleAdminLogin}>
          店家登入
        </Button>
      </NavbarItem>
      <NavbarItem>
        <Button variant="solid" color="primary" size="sm" onClick={handleUserLogin}>
          使用者登入
        </Button>
      </NavbarItem>
      </>
    ):(
      <>
      <span style={{ whiteSpace: 'nowrap' }}>{`帳號：${userName}`}</span>
      <Button variant="solid" color="primary" size="sm" onClick={handleUserLogout}>
        登出
      </Button>
      </>
    )}
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
              isLoggedIn={isLogin}
              onFavoriteClick={handleFavoriteClick}
            />
          ))}
        </div>
      </main>
    </div>
  );
}