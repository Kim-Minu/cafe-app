'use server';

import { z } from 'zod';
import {
  findUserByEmail,
  registerNewUser,
  getTodayUsers,
  getAllUsers,
  ADMIN_CREDENTIALS,
  recordUserPassword,
  checkUserPassword,
} from '@/lib/db/store';
import { UserProfile } from '@/types/auth';
import { cookies } from 'next/headers';

const LoginSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해 주세요.'),
  password: z.string().min(4, '비밀번호는 최소 4자 이상이어야 합니다.'),
});

const SignUpSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해 주세요.'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
  displayName: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.'),
  phoneNumber: z.string().optional(),
});

export type AuthActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function loginAction(
  emailInput: string,
  passwordInput: string
): Promise<AuthActionResult<UserProfile>> {
  try {
    const validated = LoginSchema.safeParse({ email: emailInput, password: passwordInput });
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || '입력값이 올바르지 않습니다.' };
    }

    const { email, password } = validated.data;
    const lowerEmail = email.toLowerCase().trim();

    // 1. Check Administrator credentials
    if (lowerEmail === ADMIN_CREDENTIALS.email.toLowerCase()) {
      if (password !== ADMIN_CREDENTIALS.password) {
        return { success: false, error: '관리자 비밀번호가 일치하지 않습니다.' };
      }

      const adminUser = findUserByEmail(lowerEmail) || {
        uid: 'admin-core-01',
        email: ADMIN_CREDENTIALS.email,
        displayName: '카페 코어 송파점 총괄 관리자',
        role: 'ADMIN',
        phoneNumber: '010-1234-5678',
        isVerified: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      const cookieStore = await cookies();
      cookieStore.set('cafe_auth_user', JSON.stringify(adminUser), {
        path: '/',
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
      });

      return { success: true, data: adminUser };
    }

    // 2. Check General Registered User
    let user = findUserByEmail(lowerEmail);

    if (user) {
      // 가입된 일반 회원 비밀번호 검증
      const isPasswordValid = checkUserPassword(lowerEmail, password);
      if (!isPasswordValid) {
        return { success: false, error: '비밀번호가 일치하지 않습니다.' };
      }
      user.lastLoginAt = new Date().toISOString();
    } else {
      // 미가입 유저 자동 등록
      user = registerNewUser({
        uid: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        email: lowerEmail,
        displayName: lowerEmail.split('@')[0],
        role: 'USER',
        isVerified: true, // Auto-verified as requested
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });
      recordUserPassword(lowerEmail, password);
    }

    const cookieStore = await cookies();
    cookieStore.set('cafe_auth_user', JSON.stringify(user), {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true, data: user };
  } catch (err: any) {
    return { success: false, error: err.message || '로그인 처리에 실패했습니다.' };
  }
}

export async function signupAction(
  emailInput: string,
  passwordInput: string,
  displayNameInput: string,
  phoneNumberInput?: string
): Promise<AuthActionResult<UserProfile>> {
  try {
    const validated = SignUpSchema.safeParse({
      email: emailInput,
      password: passwordInput,
      displayName: displayNameInput,
      phoneNumber: phoneNumberInput,
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || '입력값이 올바르지 않습니다.' };
    }

    const { email, password, displayName, phoneNumber } = validated.data;
    const lowerEmail = email.toLowerCase().trim();

    // Prevent overwriting admin
    if (lowerEmail === ADMIN_CREDENTIALS.email.toLowerCase()) {
      return { success: false, error: '관리자 이메일로는 일반 회원가입이 불가능합니다.' };
    }

    // Check existing
    const existing = findUserByEmail(lowerEmail);
    if (existing) {
      return { success: false, error: '이미 가입된 이메일 주소입니다. 로그인해 주세요.' };
    }

    // Auto-verified regular user creation
    const newUser: UserProfile = {
      uid: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email: lowerEmail,
      displayName,
      phoneNumber: phoneNumber || '010-0000-0000',
      role: 'USER',
      isVerified: true, // Auto-verified upon sign up (자동인증)
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    registerNewUser(newUser);
    recordUserPassword(lowerEmail, password);

    const cookieStore = await cookies();
    cookieStore.set('cafe_auth_user', JSON.stringify(newUser), {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true, data: newUser };
  } catch (err: any) {
    return { success: false, error: err.message || '회원가입 처리에 실패했습니다.' };
  }
}

export async function logoutAction(): Promise<AuthActionResult<boolean>> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('cafe_auth_user');
    return { success: true, data: true };
  } catch (err: any) {
    return { success: false, error: err.message || '로그아웃에 실패했습니다.' };
  }
}

export async function getTodayRegisteredUsersAction(): Promise<AuthActionResult<UserProfile[]>> {
  try {
    const todayUsers = getTodayUsers();
    return { success: true, data: todayUsers };
  } catch (err: any) {
    return { success: false, error: err.message || '신규 회원 목록 조회 실패' };
  }
}

export async function getAllRegisteredUsersAction(): Promise<AuthActionResult<UserProfile[]>> {
  try {
    const users = getAllUsers();
    return { success: true, data: users };
  } catch (err: any) {
    return { success: false, error: err.message || '전체 회원 목록 조회 실패' };
  }
}
