"use client";

import { useEffect, useState } from "react";
import { Button, NavbarItem } from "@heroui/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { BentoCard, Bento } from "@/components/BentoCard";
import { LexChat } from "@/components/LexChat";

interface StoreData {
  storeId: string;
  name: string;
  address?: string;
  phone?: string;
  description?: string;
}

// TODO: Do not have both `StoreBento` and `Bento`.

interface StoreBento {
  id?: string;
  itemId?: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  filename?: string;
  available?: boolean;
}

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(false);
  const [userType, setUserType] = useState("");
  const [userName, setUserName] = useState("");
  const [storeData, setStoreData] = useState<StoreData[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [storeBentos, setStoreBentos] = useState<StoreBento[]>([]);
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
      price: storeBento.price || NaN,
      image: storeBento.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
      available: storeBento.available !== false
    };
  };

  async function fetchStoreData() {
    try {
      const token = localStorage.getItem("id_token");
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // 只有在有 token 時才添加 Authorization header
      if (token) {
        headers['Authorization'] = `Bearer ${parseJwt(token).sub}`;
      }

      const response = await fetch(`https://ybdrax2oo0.execute-api.ap-southeast-2.amazonaws.com/dev/getStoreData`, {
        method: 'GET',
        headers: headers,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.statusCode === 200 && data.body) {
          const storeArray = JSON.parse(data.body);
          setStoreData(storeArray);
        }
      }
    } catch (error) {
      console.error('Error fetching store data:', error);
    }
  }

  // 獲取圖片 URL
  const fetchImageUrl = async (filename: string): Promise<string> => {
    try {
      const token = localStorage.getItem("id_token");
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // 只有在有 token 時才添加 Authorization header
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
    
    // 回傳預設圖片
    return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop';
  };

  async function fetchStoreBentos(storeId: string) {
    try {
      setLoadingBentos(true);
      const token = localStorage.getItem("id_token");
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // 只有在有 token 時才添加 Authorization header
      if (token) {
        headers['Authorization'] = `Bearer ${parseJwt(token).sub}`;
      }
      const response = await fetch(`https://ybdrax2oo0.execute-api.ap-southeast-2.amazonaws.com/dev/getItemData`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          storeId: storeId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.statusCode === 200 && data.body) {
          const bentoArray = JSON.parse(data.body);
          
          // 檢查是否有便當資料
          if (bentoArray && Array.isArray(bentoArray) && bentoArray.length > 0) {
            // 為每個便當獲取真實圖片 URL
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
            setStoreBentos(bentosWithImages);
          } else {
            // 沒有便當資料時設置為空數組
            setStoreBentos([]);
          }
          setSelectedStoreId(storeId);
        } else {
          // API 回應格式不正確時設置為空數組
          setStoreBentos([]);
          setSelectedStoreId(storeId);
        }
      } else {
        // API 調用失敗時設置為空數組
        setStoreBentos([]);
        setSelectedStoreId(storeId);
      }
    } catch (error) {
      console.error('Error fetching store bentos:', error);
      // 發生錯誤時也要設置為空數組
      setStoreBentos([]);
      setSelectedStoreId(storeId);
    } finally {
      setLoadingBentos(false);
    }
  }

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
      } catch (e) {
        console.error('Error decoding exist IdToken:', e);
        localStorage.clear();
      }
    }
    
    fetchStoreData();
  }, []);

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

        {storeData.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">店家資訊</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storeData.map((store) => (
                <div key={store.storeId} className="p-6 bg-content1 rounded-large border border-divider shadow-small hover:shadow-medium transition-shadow">
                  <h4 
                    className="font-bold text-lg mb-3 text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => fetchStoreBentos(store.storeId)}
                  >
                    {store.name}
                  </h4>
                  {store.address && <p className="text-sm text-default-600 mb-2">📍 {store.address}</p>}
                  {store.phone && <p className="text-sm text-default-600 mb-2">📞 {store.phone}</p>}
                  {store.description && <p className="text-sm text-default-500 mt-3 italic">{store.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 選中店家的便當列表 */}
        {selectedStoreId && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">
                {storeData.find(store => store.storeId === selectedStoreId)?.name} 的便當
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSelectedStoreId(null);
                  setStoreBentos([]);
                }}
              >
                關閉
              </Button>
            </div>
            
            {loadingBentos ? (
              <div className="p-8 text-center">
                <p>載入便當資料中...</p>
              </div>
            ) : storeBentos.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-default-500 text-lg">此店家目前沒有可用的便當商品</p>
                <p className="text-default-400 text-sm mt-2">請稍後再查看或聯繫店家了解詳情</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {storeBentos.map((bento) => (
                  <BentoCard
                    key={bento.id || bento.itemId}
                    bento={convertToBento(bento)}
                    isLoggedIn={isLogin}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      <LexChat/>
      </main>
    </div>
  );
}
