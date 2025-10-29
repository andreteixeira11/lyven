import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  
  if (baseUrl) {
    console.log('🌐 TRPC Base URL (backend):', baseUrl);
    return baseUrl;
  }
  
  console.log('⚠️ EXPO_PUBLIC_RORK_API_BASE_URL não configurada');
  return '';
};

export const trpcReactClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
});

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      fetch: async (url, options) => {
        console.log('🔗 tRPC Request:', url);
        console.log('📦 Request options:', options?.method, options?.headers);
        
        try {
          const response = await fetch(url, options);
          console.log('✅ Response status:', response.status);
          
          const contentType = response.headers.get('content-type');
          console.log('📑 Content-Type:', contentType);
          
          if (!response.ok) {
            const text = await response.clone().text();
            console.error('❌ Response error body:', text.substring(0, 200));
          }
          
          return response;
        } catch (error) {
          console.error('❌ Fetch error:', error);
          throw error;
        }
      },
    }),
  ],
});
