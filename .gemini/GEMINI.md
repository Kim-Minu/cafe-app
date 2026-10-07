# Next.js 카페 앱 개발 표준 컨벤션 & 가이드라인 (`.gemini/GEMINI.md`)

본 문서는 `cafe-app` (Cafe Flow: 실시간 스마트 키오스크, 주방 KDS 및 매장 관리 PWA 시스템)을 개발할 때 준수해야 하는 표준 아키텍처, 코딩 컨벤션 및 모범 사례를 정의합니다.

- 제품 요구사항 명세: `PRD.md` (Cafe Flow PRD)

---

## 0. 기준 버전 및 환경

Next.js 최신 App Router 및 React 19 환경을 기준으로 작성되었습니다.

| 패키지 | 권장 버전 | 비고 |
| :--- | :--- | :--- |
| `next` | 15.x / 16.x | App Router, Turbopack 기본 |
| `react` / `react-dom` | 19.x | React Server Components, Actions |
| `typescript` | ^5.x | `strict: true` 필수 |
| `tailwindcss` | v4.x | `@theme` CSS 기반 설정 (`@tailwindcss/postcss`) |
| `zustand` | ^5.x | 키오스크 장바구니 및 KDS 실시간 필터 로컬 상태 |
| `zod` | ^3.x | Server Actions 및 API 요청 데이터 검증 |
| Node.js | 20.9 이상 | LTS 권장 |

---

## 1. 프로젝트 초기화 가이드

### 1.1 생성 명령어
```bash
npx create-next-app@latest . \
  --ts --app --src-dir --tailwind --eslint \
  --import-alias "@/*"
```

### 1.2 기존 설정 파일(`PRD.md`, `.gemini/` 등) 충돌 방지
`create-next-app`은 폴더 내 기존 파일이 있을 경우 설치를 중단할 수 있으므로 임시 디렉토리를 활용하거나 수동 셋업을 진행합니다.
```bash
# 충돌 발생 시 임시 백업 후 설치 패턴
cd /Users/minwoo/Projects/ai-native-agent
mv cafe-app/.gemini /tmp/cafe-app-gemini-bak
mv cafe-app/PRD.md /tmp/cafe-app-prd-bak

npx create-next-app@latest cafe-app --ts --app --src-dir --tailwind --eslint --import-alias "@/*"

mv /tmp/cafe-app-gemini-bak cafe-app/.gemini
mv /tmp/cafe-app-prd-bak cafe-app/PRD.md
```

---

## 2. 표준 디렉토리 구조 (Feature-Driven Architecture)

라우팅 계층(`app/`)은 최대한 얇게 유지하고, 실제 비즈니스 로직과 UI 컴포넌트는 도메인 기능별(`features/`)로 모듈화합니다.

```
cafe-app/
├── src/
│   ├── app/                         # App Router 라우팅 전용 계층
│   │   ├── layout.tsx               # 루트 레이아웃 (PWA 메타태그, 폰트, 전역 스타일)
│   │   ├── page.tsx                 # 모드 선택 허브 (스마트오더 / 키오스크 / KDS / 대시보드 진입)
│   │   ├── order/                   # 고객 스마트폰 스마트오더
│   │   │   └── page.tsx
│   │   ├── table/[tableNo]/         # 테이블 QR 스캔 주문 진입점
│   │   │   └── page.tsx
│   │   ├── kiosk/                   # 매장 비치 키오스크 주문 모드
│   │   │   ├── page.tsx             # 메뉴 탐색 및 장바구니
│   │   │   └── complete/page.tsx    # 주문 번호 발급 완료 화면
│   │   ├── kds/                     # 주방 디스플레이 시스템 (KDS)
│   │   │   └── page.tsx
│   │   ├── status/[orderId]/        # 고객 주문 실시간 상태 조회 화면
│   │   │   └── page.tsx
│   │   ├── pickup-board/            # 매장 호출 전광판 화면
│   │   │   └── page.tsx
│   │   ├── admin/                   # 매장 관리자 대시보드
│   │   │   ├── page.tsx             # 주문 현황 및 통계
│   │   │   └── menus/page.tsx       # 메뉴 CRUD 및 품절 관리
│   │   ├── api/                     # Route Handlers (SSE 실시간 스트림 등)
│   │   │   └── sse/orders/route.ts
│   │   ├── globals.css              # Tailwind v4 진입점 & 디자인 시스템 토큰
│   │   ├── manifest.json            # PWA 웹 매니페스트
│   │   └── sw.ts                    # Service Worker (오프라인 캐싱)
│   │
│   ├── features/                    # 도메인별 기능 모듈
│   │   ├── mobile-order/            # 스마트폰 스마트오더 (원핸드 UX, 바텀시트, 테이블 연동)
│   │   │   ├── components/          # MobileMenuList, MobileOptionSheet, MobileCartBar
│   │   │   └── store/               # mobile-cart-store.ts
│   │   ├── kiosk/                   # 매장 키오스크 도메인 (대형 터치스크린)
│   │   │   ├── components/          # MenuList, OptionModal, CartDrawer, PaymentModal
│   │   │   ├── hooks/               # useKioskCart, useMenuCategories
│   │   │   └── store/               # kiosk-cart-store.ts (Zustand)
│   │   ├── kds/                     # 주방 디스플레이 도메인
│   │   │   ├── components/          # OrderCard, OrderTimer, AudioAlertToggle
│   │   │   ├── hooks/               # useRealtimeOrders, useOrderAlarm
│   │   │   └── actions.ts           # updateOrderStatus Server Action
│   │   ├── customer-order/          # 고객 주문 추적
│   │   │   ├── components/          # OrderStatusStep, PickupCard
│   │   │   └── hooks/               # useLiveOrderStatus
│   │   └── admin/                   # 매장 관리
│   │       ├── components/          # MenuTable, SoldOutSwitch, SalesSummaryCard
│   │       └── actions.ts           # createMenu, toggleSoldOut, cancelOrder
│   │
│   ├── components/
│   │   └── ui/                      # 도메인 독립적 공통 UI (Button, Modal, Badge, Sheet 등)
│   ├── lib/
│   │   ├── db/                      # 데이터베이스 연결 (Prisma / Drizzle)
│   │   ├── sse/                     # Server-Sent Events 브로드캐스터 유틸
│   │   ├── audio.ts                 # KDS 딩동 알림음 Web Audio 합성/재생
│   │   └── utils.ts                 # cn() (clsx + twMerge), formatPrice, formatDate
│   └── types/                       # 공용 타입 정의 (Order, MenuItem, Category, Option)
│
├── public/                          # 정적 자산 (PWA 아이콘, 사운드 파일)
├── .gemini/
│   └── GEMINI.md                    # 본 개발 규칙 문서
├── PRD.md                           # 제품 요구사항 정의서
├── next.config.ts
└── package.json
```

**의존성 규칙**:
- `app/` ➔ `features/` ➔ `components/ui`, `lib/`, `types/` 단방향 참조 원칙
- `features/*` 상호 간의 직접적인 교차 참조는 지양하고, 공통 로직은 `lib/` 또는 `components/ui/`로 승격

---

## 3. Server Component vs Client Component 원칙

1. **기본값은 Server Component (RSC)**:
   - 모든 페이지와 컴포넌트는 기본적으로 서버 컴포넌트로 작성합니다.
   - 데이터베이스 직접 조회, 초기 메뉴 데이터 페칭, 정적 레이아웃은 서버에서 처리하여 클라이언트 번들 크기를 최소화합니다.
2. **`'use client'`는 트리의 최말단 리프(Leaf) 컴포넌트에 한정**:
   - 브라우저 이벤트(`onClick`, `onChange`), React 훅(`useState`, `useEffect`, `useRef`), 브라우저 API(Web Audio, Web Storage)가 필요한 UI 블록만 별도 컴포넌트로 분리합니다.
3. **Props 직렬화 준수**:
   - Server Component에서 Client Component로 넘기는 데이터는 직렬화 가능한 객체(Plain Object, 배열, 원시값)여야 합니다. `Date` 객체나 함수는 문자열(`ISO String`)이나 ID로 변환하여 전달합니다.
4. **서버 전용 코드 보호**:
   - DB 접근, 관리자 시크릿 키 등이 포함된 모듈에는 최상단에 `import 'server-only'`를 명시하여 실수로 클라이언트 번들에 포함되는 것을 원천 방지합니다.

---

## 4. 라우팅 및 Next.js 핵심 규약

1. **비동기 `params` 및 `searchParams`**:
   - Next.js 최신 규약에 따라 `props.params` 및 `props.searchParams`는 `Promise`이므로 반드시 `await` 후 구조분해합니다.
   ```tsx
   // src/app/status/[orderId]/page.tsx
   export default async function OrderStatusPage({
     params,
   }: {
     params: Promise<{ orderId: string }>
   }) {
     const { orderId } = await params;
     return <LiveOrderStatusView orderId={orderId} />;
   }
   ```
2. **타입 안전 라우팅 (Typed Routes)**:
   - `next.config.ts`에 `experimental: { typedRoutes: true }`를 활성화하여 `<Link href="...">` 경로 오타를 정적 검사합니다.
3. **특수 파일 네이밍**:
   - `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`만 `app/` 내에 위치시키며 반드시 `export default`를 사용합니다.
   - `error.tsx`는 클라이언트 컴포넌트(`'use client'`)여야 합니다.

---

## 5. 실시간 주문 상태 동기화 및 데이터 흐름

키오스크 ➔ 주방 KDS ➔ 고객 상태 화면 간의 즉각적인 반영을 위해 실시간 동기화 패턴을 확립합니다.

1. **SSE (Server-Sent Events) 브로드캐스트 패턴**:
   - WebSocket보다 구현이 가볍고 HTTP/2 친화적인 SSE 엔드포인트(`/api/sse/orders`)를 구축하여 주문 생성 및 상태 변경 이벤트를 단방향 푸시합니다.
2. **이벤트 명세**:
   - `ORDER_CREATED`: 신규 주문 접수 (주방 KDS 화면 카드 추가 + 딩동 사운드)
   - `ORDER_STATUS_CHANGED`: 주문 상태 변경 (`PENDING` ➔ `PREPARING` ➔ `READY` ➔ `COMPLETED`)
3. **Optimistic Updates & 폴링 폴백**:
   - 주방 바리스타가 상태 변경 버튼을 클릭하면 즉시 로컬 UI를 선반영하고 백그라운드에서 Server Action을 실행합니다.
   - 네트워크 단절 및 재연결 시 30초 주기 폴링 백업을 두어 상태 일관성을 보장합니다.

---

## 6. Server Actions & 데이터 검증

1. **상태 변경은 Server Actions (`'use server'`) 활용**:
   - 주문 생성, 주문 상태 변경, 메뉴 품절 토글은 Server Actions로 구현합니다.
2. **Zod 스키마 서버 검증 필수**:
   - 모든 인입 데이터는 서버 단에서 철저하게 스키마 검증을 거칩니다.
   ```ts
   // src/features/kds/actions.ts
   'use server';

   import { z } from 'zod';
   import { db } from '@/lib/db';
   import { broadcastOrderEvent } from '@/lib/sse/broadcast';

   const UpdateStatusSchema = z.object({
     orderId: z.string().uuid(),
     nextStatus: z.enum(['PREPARING', 'READY', 'COMPLETED', 'CANCELLED']),
   });

   export async function updateOrderStatus(input: unknown) {
     const parsed = UpdateStatusSchema.safeParse(input);
     if (!parsed.success) {
       return { success: false, error: '잘못된 요청 데이터입니다.' };
     }

     const updated = await db.order.update({
       where: { id: parsed.data.orderId },
       data: { status: parsed.data.nextStatus },
     });

     broadcastOrderEvent('ORDER_STATUS_CHANGED', updated);
     return { success: true, data: updated };
   }
   ```
3. **반환 값 표준화**:
   - 예외를 던지는 대신 `{ success: true, data }` 또는 `{ success: false, error }` 형태의 판별 유니온 객체를 반환합니다.

---

## 7. 클라이언트 상태 관리 (Zustand)

1. **로컬 UI 상호작용에만 사용**:
   - 키오스크 장바구니(`cart`), 선택된 옵션 모달 상태, KDS 알림음 On/Off 토글 등 클라이언트 전용 상태에 Zustand를 사용합니다.
2. **스토어 분리 원칙**:
   - 거대한 단일 스토어 대신 `kiosk-cart-store.ts`, `kds-ui-store.ts`처럼 도메인별로 작게 쪼개어 불필요한 리렌더링을 방지합니다.

---

## 8. PWA (Progressive Web App) 및 키오스크/매장 UI 가이드

1. **터치 친화적 UI (Touch-Friendly Design)**:
   - 키오스크 및 KDS 화면의 버튼은 최소 터치 영역 **48x48px (권장 64px 이상)**을 준수합니다.
   - 더블 클릭 및 스와이프 줌 방지: `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">`
2. **KDS 오디오 알림 브라우저 정책 대응**:
   - 브라우저의 Autoplay Policy(사용자 인터랙션 전 오디오 재생 차단)를 고려하여, KDS 화면 진입 시 "화면을 터치하여 실시간 오디오 알림 활성화" 모달/토글을 제공합니다.
3. **PWA Kiosk Mode 설정**:
   - `manifest.json`에서 `"display": "standalone"` 및 `"orientation": "landscape"`(태블릿 KDS) 또는 `"portrait"`(키오스크) 맞춤 설정 지원.

---

## 9. 스타일링 및 디자인 시스템 (Tailwind CSS v4)

1. **Tailwind v4 CSS-First 설정**:
   - `tailwind.config.js` 대신 `src/app/globals.css`에서 `@import "tailwindcss";` 및 `@theme` 지시어로 매장 브랜드 컬러, 타이포그래피 토큰을 정의합니다.
2. **`cn()` 유틸리티 사용**:
   - 클래스 병합 시 항상 `cn(...inputs)` (`clsx` + `tailwind-merge`)을 사용하여 스타일 우선순위 충돌을 방지합니다.
3. **동적 클래스 합성 금지**:
   - `text-${color}-500`과 같은 런타임 템플릿 리터럴은 Tailwind 빌드 시 감지되지 않으므로 절대 사용하지 않고 정적 매핑 객체를 사용합니다.

---

## 10. TypeScript & 네이밍 컨벤션

| 대상 | 규칙 | 예시 |
| :--- | :--- | :--- |
| **컴포넌트 파일 / 컴포넌트명** | PascalCase | `OrderCard.tsx` / `OrderCard` |
| **커스텀 훅** | `use` + camelCase | `useRealtimeOrders.ts` |
| **유틸리티 / 일반 파일** | kebab-case | `format-price.ts`, `sse-broadcaster.ts` |
| **상태 스토어 파일** | kebab-case | `kiosk-cart-store.ts` |
| **타입 / 인터페이스** | PascalCase | `Order`, `MenuItem`, `OrderStatus` |
| **이벤트 핸들러 prop / 함수** | `on*` / `handle*` | `onStatusChange` / `handleStatusChange` |
| **상수** | UPPER_SNAKE_CASE | `ORDER_STATUS_LABEL`, `MAX_CART_ITEMS` |

---

## 11. 개발 및 품질 관리 워크플로우

1. **빌드 도구**: Turbopack (`next dev --turbopack`) 기본 사용
2. **코드 검사**:
   ```bash
   # 타입 체크
   npx tsc --noEmit
   # 린트 검사
   npm run lint
   # 빌드 검증
   npm run build
   ```
3. **커밋 전 체크리스트**:
   - [ ] 미사용 `console.log` 및 더미 디버그 코드 제거
   - [ ] Server/Client 컴포넌트 경계 검토 (불필요한 `'use client'` 제거)
   - [ ] 환경변수 분리 (`NEXT_PUBLIC_` 최소화, 비밀키 노출 방지)
   - [ ] 터치 인터랙션 시 반응 속도 및 로딩 피드백 확인
