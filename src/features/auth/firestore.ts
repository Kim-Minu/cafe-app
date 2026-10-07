import { collection, doc, setDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { UserProfile } from '@/types/auth';

const USERS_COLLECTION = 'users';

/**
 * Cloud Firestore 'users' 컬렉션에 회원 정보 저장
 */
export async function saveUserToFirestore(user: UserProfile): Promise<boolean> {
  try {
    const docRef = doc(db, USERS_COLLECTION, user.uid);
    await setDoc(
      docRef,
      {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber || '',
        role: user.role,
        isVerified: user.isVerified ?? true,
        createdAt: user.createdAt,
        registeredDate: user.createdAt.split('T')[0],
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn('[Firestore] 회원 저장 중 오류 (규칙 확인 필요):', error);
    return false;
  }
}

/**
 * Cloud Firestore 'users' 컬렉션에서 전체 회원 목록 조회
 */
export async function fetchUsersFromFirestore(): Promise<UserProfile[]> {
  try {
    const q = query(collection(db, USERS_COLLECTION));
    const snapshot = await getDocs(q);
    const users: UserProfile[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      users.push({
        uid: data.uid || docSnap.id,
        email: data.email || '',
        displayName: data.displayName || '회원',
        phoneNumber: data.phoneNumber || '',
        role: (data.role as 'ADMIN' | 'USER') || 'USER',
        isVerified: data.isVerified !== false,
        createdAt: data.createdAt || new Date().toISOString(),
      });
    });

    // 최신 가입순 정렬
    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return users;
  } catch (error) {
    console.warn('[Firestore] 회원 목록 조회 중 오류 (로컬 스토어 유지):', error);
    return [];
  }
}
