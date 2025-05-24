'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

interface TokenPayload {
  sub?: string;
  type?: string;
  email?: string;
}

function InnerCallback() {
  const params = useSearchParams();
  const router = useRouter();
  const code   = params.get('code');

  useEffect(() => {
    if (!code) {
        console.error('No code provided in the URL.');
        return;
    }
    (async () => {
      try {
        const body = new URLSearchParams({
          grant_type:  'authorization_code',
          client_id:   process.env.NEXT_PUBLIC_STORE_COGNITO_APP_CLIENT_ID!,
          code,
          redirect_uri: process.env.NEXT_PUBLIC_STORE_COGNITO_REDIRECT_URI!,
        });
        const resp = await axios.post(
          `${process.env.NEXT_PUBLIC_STORE_COGNITO_DOMAIN}/oauth2/token`,
          body.toString(),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        localStorage.setItem('id_token', resp.data.id_token);
        localStorage.setItem('access_token', resp.data.access_token);
        localStorage.setItem('refresh_token', resp.data.refresh_token);
        const decodedToken = jwtDecode<TokenPayload>(resp.data.id_token);
        decodedToken.type = "store";
        localStorage.setItem('user', JSON.stringify(decodedToken));
        router.replace('/');
      } catch (err) {
        console.error(err);
      }
    })();
  }, [code, router]);

  return <p>正在登入中，請稍候…</p>;
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<p>載入中…</p>}>
      <InnerCallback/>
    </Suspense>
  );
}