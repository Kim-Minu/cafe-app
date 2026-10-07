'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import Link from 'next/link';
import { Coffee, Lock, Mail, User, Phone, CheckCircle2, ArrowRight } from 'lucide-react';

function SignUpFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/order';

  const { signup, isLoading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== passwordConfirm) {
      setErrorMsg('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setIsSubmitting(true);
    const res = await signup(email, password, displayName, phoneNumber);
    setIsSubmitting(false);

    if (res.success) {
      alert(`🎉 ${displayName}님 환영합니다!\n가입 신청이 완료되었으며, 계정이 자동 인증되었습니다.`);
      router.push(redirectUrl);
    } else {
      setErrorMsg(res.error || '회원가입에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f0] flex flex-col justify-center items-center p-6 font-sans select-none text-[#191c1b]">
      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-3 mb-6 group">
        <div className="w-12 h-12 rounded-full bg-[#1e4033] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
          <Coffee className="w-6 h-6" />
        </div>
        <div>
          <span className="font-extrabold text-2xl tracking-tight text-[#191c1b]">
            CAFE CORE
          </span>
          <p className="text-xs text-stone-500 font-medium">카페 코어 송파점</p>
        </div>
      </Link>

      {/* Card Container */}
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#e8ece7] shadow-sm">
        <div className="mb-5 text-center">
          <h1 className="text-2xl font-black text-[#191c1b] tracking-tight">회원가입</h1>
          <p className="text-xs text-stone-500 mt-1 font-medium">
            카페 코어 스마트오더 회원이 되어 빠른 주문을 경험하세요.
          </p>
        </div>

        {/* Auto verification info badge */}
        <div className="mb-5 p-3.5 bg-[#f5f8f5] rounded-2xl border border-[#dce5dd] flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="font-black text-[#1e4033]">신규 회원 즉시 자동인증</span>
            <p className="text-stone-500 text-[11px] mt-0.5">
              가입 신청 시 별도 승인 절차 없이 즉시 자동 인증되어 바로 주문 가능합니다.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              이름 (닉네임)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="홍길동"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#1e4033] text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              이메일 주소 (아이디)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#1e4033] text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              연락처 (휴대폰 번호)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="010-1234-5678"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#1e4033] text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              비밀번호 (6자 이상)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#1e4033] text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              비밀번호 확인
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="password"
                required
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호 다시 입력"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#1e4033] text-sm font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full py-3 rounded-xl bg-[#1e4033] hover:bg-[#274f3e] text-white font-bold text-sm shadow-xs transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            <span>{isSubmitting ? '회원가입 처리 중...' : '회원가입 및 자동 인증'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#f2f4f1] text-center text-xs text-stone-600">
          <span>이미 계정이 있으신가요? </span>
          <Link
            href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
            className="font-bold text-[#1e4033] hover:underline"
          >
            로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f6f0] flex items-center justify-center text-stone-400 font-bold">로딩 중...</div>}>
      <SignUpFormContent />
    </Suspense>
  );
}
