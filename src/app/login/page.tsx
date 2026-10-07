'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import Link from 'next/link';
import { Coffee, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/order';

  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      if (email.toLowerCase().trim() === 'admin@gmail.com') {
        router.push('/admin');
      } else {
        router.push(redirectUrl);
      }
    } else {
      setErrorMsg(res.error || '로그인에 실패했습니다.');
    }
  };

  const handleFillAdmin = () => {
    setEmail('admin@gmail.com');
    setPassword('password1234');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-[#f7f6f0] flex flex-col justify-center items-center p-6 font-sans select-none text-[#191c1b]">
      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-3 mb-8 group">
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
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-black text-[#191c1b] tracking-tight">로그인</h1>
          <p className="text-xs text-stone-500 mt-1 font-medium">
            스마트오더 및 매장 관리를 위해 로그인해 주세요.
          </p>
        </div>

        {/* Quick Fill Buttons for convenience */}
        <div className="mb-6 p-3.5 bg-[#f5f8f5] rounded-2xl border border-[#dce5dd] space-y-2">
          <div className="text-[11px] font-bold text-[#1e4033] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>원클릭 계정 입력 (테스트용)</span>
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleFillAdmin}
              className="w-full px-3 py-2 bg-white rounded-xl border border-[#dce5dd] text-xs font-bold text-[#1e4033] hover:bg-[#e8ece7] transition shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>👑 관리자 계정 자동 입력 (admin@gmail.com)</span>
            </button>
          </div>
          <p className="text-[10px] text-stone-400 text-center font-medium">
            관리자: admin@gmail.com / password1234
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              이메일 주소
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#1e4033] text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              비밀번호
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#1e4033] text-sm font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full py-3 rounded-xl bg-[#1e4033] hover:bg-[#274f3e] text-white font-bold text-sm shadow-xs transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            <span>{isSubmitting ? '로그인 처리 중...' : '로그인'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#f2f4f1] text-center text-xs text-stone-600">
          <span>아직 회원이 아니신가요? </span>
          <Link
            href={`/signup?redirect=${encodeURIComponent(redirectUrl)}`}
            className="font-bold text-[#1e4033] hover:underline"
          >
            회원가입 (자동 즉시 인증)
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f6f0] flex items-center justify-center text-stone-400 font-bold">로딩 중...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
