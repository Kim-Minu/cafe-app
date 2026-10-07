#!/usr/bin/env bash
set -e

PROJECT_ID="iceu-songpa05"
REGION="asia-northeast3" # 서울 리전
SERVICE_NAME="cafe-app"

echo "☕ ========================================="
echo "☕ [CAFE CORE] Google Cloud Run 배포 스크립트"
echo "☕ ========================================="
echo "▶ 프로젝트 ID: $PROJECT_ID"
echo "▶ 배포 리전  : $REGION"
echo "▶ 서비스 이름: $SERVICE_NAME"
echo ""

# 1. gcloud 프로젝트 설정
echo "▶ [1/3] gcloud 프로젝트 활성화..."
gcloud config set project "$PROJECT_ID"

# 2. Cloud Build & Cloud Run API 활성화 확인
echo "▶ [2/3] Cloud Run 및 Cloud Build 활성화 확인..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com --project "$PROJECT_ID"

# 3. Cloud Run 배포 (Dockerfile 기반 소스 배포)
echo "▶ [3/3] Cloud Run 배포 시작 (빌드 및 컨테이너 기동)..."
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --set-env-vars "NEXT_PUBLIC_FIREBASE_PROJECT_ID=iceu-songpa05,NEXT_PUBLIC_FIREBASE_DATABASE_ID=cafe-app,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=iceu-songpa05.firebaseapp.com,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=iceu-songpa05.firebasestorage.app,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=307601624742,NEXT_PUBLIC_FIREBASE_APP_ID=1:307601624742:web:f1a4a61a02026f77b5ee67,NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCx6Yi5bu5WTzf7AuvZgTLiQ1FdXqT4MmA"

echo ""
echo "🎉 ========================================="
echo "🎉 [CAFE CORE] Cloud Run 배포 완료!"
echo "🎉 위 출력된 Service URL로 스마트폰에서 접속하실 수 있습니다."
echo "🎉 ========================================="
