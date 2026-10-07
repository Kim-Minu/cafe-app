import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CAFE CORE - 스마트 모바일 오더',
    short_name: '카페코어',
    description: '스마트폰으로 주문하고 실시간 픽업하는 스페셜티 카페 오더 앱',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f6f0',
    theme_color: '#1e4033',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
