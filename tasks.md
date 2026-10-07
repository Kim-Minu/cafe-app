# Cafe Flow 개발 작업 계획서 (`tasks.md`)

본 문서는 실시간 카페 운영, 스마트 키오스크 & 모바일 스마트오더 PWA 시스템의 개발 작업을 Phase별로 세분화한 실행 계획서입니다.
작업이 완료될 때마다 체크(`[x]`)하고 다음 작업을 순차적으로 진행합니다.

---

## 📌 Phase 1: 기반 환경 구축 & 데이터 모델링
- [x] **Task 1.1: Next.js 프로젝트 초기화 및 환경 설정**
  - Next.js 16+ (App Router, TypeScript, Tailwind CSS, ESLint, `src/` 구조) 프로젝트 셋업
  - 절대경로 별칭 (`@/*`) 확인
- [x] **Task 1.2: 필수 라이브러리 및 디자인 토큰 셋업**
  - `lucide-react`, `clsx`, `tailwind-merge`, `zustand`, `zod` 설치
  - Tailwind CSS v4 `@theme` 기반 카페 브랜드 컬러 및 타이포그래피 토큰 정의
  - 기본 UI 유틸리티(`cn()`, `formatPrice`) 구현
- [x] **Task 1.3: 도메인 타입 정의 및 인메모리/로컬 DB 스토어 구축**
  - `Order`, `MenuItem`, `Category`, `OptionGroup`, `OptionItem` 타입 정의
  - 초기 시드 데이터 구축 (에스프레소, 아메리카노, 바닐라 라떼, 에이드, 크루아상 등)
  - 싱글톤 주문 및 메뉴 저장소(`src/lib/db/store.ts`) 구축

---

## 📌 Phase 2: 실시간 동기화 계층 (Realtime Sync & Audio)
- [x] **Task 2.1: 실시간 이벤트 브로드캐스터 (SSE) 구현**
  - `/api/sse/orders`: 클라이언트 구독용 Server-Sent Events Route Handler 구현
  - 주문 생성(`ORDER_CREATED`), 상태 변경(`ORDER_STATUS_CHANGED`), 품절 변경 이벤트 발행 모듈 구현
- [x] **Task 2.2: 주문 생성 및 상태 변경 Server Actions 구현**
  - `createOrder`: Zod 검증, 주문 번호 자동 채번, 주문 생성 및 SSE 브로드캐스트
  - `updateOrderStatus`: 주방 상태 변경 및 고객 화면 전파
  - `toggleMenuItemSoldOut`: 메뉴 품절 원클릭 토글 액션
- [x] **Task 2.3: KDS 주문 알림 오디오 합성/재생 유틸리티**
  - Web Audio API를 활용한 무음 차단 대응 및 딩동 비프음 발생기(`src/lib/audio.ts`) 구현

---

## 📌 Phase 3: 고객 스마트폰 스마트오더 (`/order`, `/table/[tableNo]`)
- [x] **Task 3.1: 모바일 스마트오더 레이아웃 및 카테고리 뷰**
  - 스마트폰 세로형 모바일 반응형 뷰, 카테고리 가로 스크롤 네비게이션
  - 품절 메뉴 시각적 비활성화 처리
- [x] **Task 3.2: 모바일 옵션 선택 바텀시트 & 장바구니 스토어**
  - 온도(HOT/ICE), 컵 선택, 샷 추가 등 터치 친화적 바텀시트 모달
  - Zustand 기반 모바일 장바구니(`src/features/mobile-order/store/`)
  - 하단 고정 주문 바(Sticky Bottom Bar)
- [x] **Task 3.3: 테이블 QR 주문 연동 및 간편 결제**
  - `/table/[tableNo]` 접근 시 테이블 번호 자동 바인딩
  - 간이 결제 모달 및 주문 요청 Server Action 연동
- [x] **Task 3.4: 고객 실시간 주문 상태 추적 페이지 (`/status/[orderId]`)**
  - 단계별 진행 상태 타임라인 (`접수 대기` ➔ `제조 중` ➔ `제조 완료/픽업`)
  - 실시간 SSE 구독으로 즉각 상태 갱신
  - 제조 완료 시 모바일 진동(Navigator Vibration) 및 알림 표시

---

## 📌 Phase 4: 매장 비치 태블릿 키오스크 (`/kiosk`)
- [x] **Task 4.1: 대형 터치스크린 최적화 키오스크 UI**
  - 대형 카드 그리드 레이아웃, 대형 옵션 모달
  - 포장 / 매장 이용 선택 플로우
- [x] **Task 4.2: 키오스크 장바구니 및 현장 결제 시뮬레이션**
  - 키오스크 전용 장바구니 사이드/바텀 패널
  - 카드 결제 시뮬레이션 화면
- [x] **Task 4.3: 키오스크 주문 완료 화면**
  - 대형 주문 번호 발급 안내 (#101, #102 등)
  - 스마트폰으로 상태를 볼 수 있는 QR 코드 안내 컴포넌트

---

## 📌 Phase 5: 주방 디스플레이 시스템 (KDS - `/kds`)
- [x] **Task 5.1: KDS 주문 카드 그리드 & 칸반 뷰**
  - 접수 대기, 제조 중, 완료 상태별 또는 시간순 카드 배치
  - 주문 번호, 주문 경과 시간 실시간 타이머 (초/분 단위)
- [x] **Task 5.2: 주문 출처 뱃지 및 옵션 하이라이트**
  - 🔵 `[키오스크 - 매장]` vs 🟢 `[스마트폰 - 테이블 #]` vs 🟠 `[스마트폰 - 포장]`
  - 샷 추가, 얼음 등 옵션 강조 디자인
- [x] **Task 5.3: 원클릭 상태 전환 & 오디오 알림**
  - 버튼 클릭으로 즉각 상태 변경 (`접수` ➔ `제조 시작` ➔ `호출` ➔ `픽업`)
  - 신규 주문 도착 시 딩동 알림음 자동 재생 (브라우저 정책 해제 버튼 포함)

---

## 📌 Phase 6: 매장 호출 전광판 (`/pickup-board`) & 점주 대시보드 (`/admin`)
- [x] **Task 6.1: 매장 픽업 호출 전광판 (`/pickup-board`)**
  - [제조 중인 번호] vs [준비 완료 픽업 번호 (대형 깜빡임 효과)] 2분할 전광판
  - 호출 시 사운드 차임벨
- [x] **Task 6.2: 점주 메뉴 관리 대시보드**
  - 메뉴 목록 조회, 메뉴 추가/수정/삭제
  - 원클릭 품절(Sold-Out) 토글 (키오스크/스마트폰 즉시 반영)
- [x] **Task 6.3: 실시간 주문 모니터링 & 매출 통계**
  - 당일 전체 주문 목록 및 주문 강제 취소
  - 채널별(키오스크 vs 스마트폰) 총 매출 및 인기 메뉴 통계

---

## 📌 Phase 8: 카페 코어 디자인 시안 및 실사 이미지 완벽 구현 (`카페코어 화면 이미지 모음.html` 반영)
- [x] **Task 8.1: Next.js + Tailwind CSS v4 스타일 파이프라인 수리 및 토큰 정립**
  - `@tailwindcss/postcss` 설치 및 `postcss.config.mjs` 구성
  - `globals.css` 내 Cafe Core 브랜드 컬러(`bg: #f7f6f0`, `primary: #1e4033`, `sage: #e8ece7`, `accent: #274f3e`, `text: #191c1b`) 토큰 정의
- [x] **Task 8.2: 레퍼런스 실사 음료 및 배너 이미지 추출 및 리소스화**
  - 아메리카노, 카페 라떼, 바닐라 라떼, 콜드브루, 말차 라떼, 얼그레이 티, 레몬 에이드, 자몽 에이드 8종 음료 추출 (`public/images/*.png`)
- [x] **Task 8.3: 화면 1 - 스마트폰 주문 (`/order`, `/table/[tableNo]`) 디자인 일치화**
  - PWA 설치 배너, "오늘의 한 잔, 기다림은 가볍게." 히어로 배너, 카테고리 알약 버튼, 2열 카드 그리드(추천 뱃지, + 버튼), 하단 플로팅 장바구니 바 구현
- [x] **Task 8.4: 화면 2 - 매장 키오스크 (`/kiosk`) 디자인 일치화**
  - 직원 호출 버튼, 2열 와이드 메뉴 카드(`+ 담기`), 하단 고정 장바구니 패널(음료 썸네일, `[ICE/HOT]` 뱃지, 수량 카운터, 결제하기 버튼) 구현
- [x] **Task 8.5: 화면 3 - 주방 KDS (`/kds`) 디자인 일치화**
  - 공통 상단 네비게이션 헤더, `KITCHEN 좋은 한 잔을 만드는 공간`, 주문 번호별 카드 그리드(#103, #104 등), 품목별 체크박스, 제조 시작/픽업 준비 완료 액션 구현
- [x] **Task 8.6: 화면 4 - 주문 현황판 (`/pickup-board`) 디자인 일치화**
  - 상단 디지털 시계(`14:32`), 좌측 제조 중 패널(소프트 세이지 `#e8ece7`), 우측 픽업 가능 패널(딥 포레스트 그린 `#274f3e`, `방금 완료` 뱃지 및 깜빡임 효과), 하단 안내 바 구현
- [x] **Task 8.7: 화면 5 - 우리 매장의 오늘 매출 대시보드 (`/admin`) 디자인 일치화**
  - 4개 주요 지표 카드(결제 금액, 순매출, 환불 금액, 주문/판매 잔 수), 음료별 순매출 가로 막대 그래프, 시간대별 결제 금액 세로 막대 그래프, 채널별 주문 비중(스마트폰 62% vs 키오스크 38%) 및 실시간 품절 관리 구현
- [x] **Task 8.8: TypeScript 컴파일 및 Next.js 빌드 무결성 검증 완료**

---

## 📌 Phase 9: Firebase 인증, 관리자 접근 제어 및 오늘 신규 회원 목록
- [x] **Task 9.1: Firebase Client SDK & Auth 연동 환경 구축**
  - `firebase` 패키지 설치 및 `src/lib/firebase/config.ts` 연동
  - `src/features/auth/AuthContext.tsx` 및 Server Actions (`loginAction`, `signupAction`, `logoutAction`) 구축
- [x] **Task 9.2: 관리자 고정 계정 지정 및 권한 부여**
  - 관리자 계정 `admin@gmail.com` / `password1234` 지정 및 `ADMIN` 권한 부여
  - 원클릭 빠른 로그인 테스트 편의 버튼 제공
- [x] **Task 9.3: 일반 회원가입 신청 및 즉시 자동 인증(Auto-Verified)**
  - `/signup`: 이름, 이메일, 연락처, 비밀번호 입력 후 가입 시 즉시 자동 인증 (`isVerified: true`)
  - 모바일 주문 화면(`MobileOrderView`)과 헤더에 회원 닉네임 및 로그인/로그아웃 연동
- [x] **Task 9.4: 오늘 신규 가입 회원 목록 관리자 페이지 (`/admin/members`)**
  - 오늘 신규 가입 회원 수, 자동 인증 완료율(100%), 전체 회원 수 요약 카드
  - 가입 일시, 닉네임, 이메일, 연락처, 회원 구분, 인증 상태 테이블 뷰 제공
  - `/admin?tab=members` 및 `/admin/members` 전용 라우트 동시 지원
- [x] **Task 9.5: 매장 관리 페이지 관리자 전용 접근 제어 (Admin Guard)**
  - 비관리자 접근 시 잠금 화면 및 관리자 로그인 유도 폼 렌더링
  - `CafeTopNavbar` 내 `매장 관리`, `매출`, `신규 회원` 메뉴는 관리자(`admin@gmail.com`)에게만 선택적 노출
- [x] **Task 9.6: TypeScript 검사 및 프로덕션 빌드 무결성 검증 완료**

