# Locusify User Authentication API Design

**Document Type:** Technical Architecture Design
**Created:** January 9, 2025
**Author:** @frontend-developer
**Status:** Design Phase

---

## 📋 Overview

This document outlines the user authentication system for Locusify, built on Supabase Auth with PostgreSQL backend.

### Technology Stack
- **Backend:** Supabase (PostgreSQL + Auth)
- **Frontend:** React 19 + TypeScript
- **State Management:** Zustand
- **API Client:** Supabase JavaScript SDK

---

## 🗄️ Database Schema

### Tables

#### 1. `account` (用户主表)
Primary user account table with support for multiple authentication methods.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | 用户唯一标识 |
| `email` | VARCHAR(255) | UNIQUE, NULLABLE | 电子邮箱（OAuth用户可为空）|
| `password_hash` | VARCHAR(255) | NULLABLE | 密码哈希（仅邮箱注册用户）|
| `email_verified` | BOOLEAN | NOT NULL, DEFAULT false | 邮箱是否验证 |
| `auth_method` | VARCHAR(20) | NOT NULL, DEFAULT 'email' | 认证方式：email/google/github/apple |
| `default_locale` | VARCHAR(10) | NOT NULL, DEFAULT 'en' | 默认语言 (ISO 639-1) |
| `default_timezone` | VARCHAR(50) | NOT NULL, DEFAULT 'UTC' | 默认时区 |
| `last_login_at` | TIMESTAMPTZ | NULLABLE | 最后登录时间 |
| `logout_at` | TIMESTAMPTZ | NULLABLE | 注销时间 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 创建时间 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 更新时间 |

#### 2. `account_oauth` (OAuth 绑定表)
Stores OAuth provider bindings for user accounts.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | 主键 |
| `user_id` | UUID | NOT NULL, FK → account.id (CASCADE) | 关联用户ID |
| `provider` | VARCHAR(50) | NOT NULL | OAuth提供商 |
| `provider_id` | VARCHAR(255) | NOT NULL | 提供商账号ID |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 绑定时间 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 更新时间 |

**Constraints:**
- UNIQUE (provider, provider_id) - 防止重复绑定

#### 3. `account_localization` (多语言配置表)
Stores localized user profile information.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | 记录ID |
| `user_id` | UUID | NOT NULL, FK → account.id (CASCADE) | 关联用户ID |
| `locale` | VARCHAR(10) | NOT NULL | 语言代码 (ISO 639-1) |
| `display_name` | VARCHAR(100) | NULLABLE | 本地化显示名称 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 创建时间 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 更新时间 |

**Constraints:**
- UNIQUE (user_id, locale) - 每个用户每种语言只有一条记录

---

## 🔐 Authentication Flows

### 1. Email/Password Authentication

#### Registration Flow
```typescript
// 1. User submits registration form
interface RegisterRequest {
  email: string;
  password: string;
  locale?: string;
  timezone?: string;
}

// 2. Create account in Supabase Auth
const { data, error } = await supabase.auth.signUp({
  email: request.email,
  password: request.password,
  options: {
    data: {
      locale: request.locale || 'en',
      timezone: request.timezone || 'UTC'
    }
  }
});

// 3. Create account record in database (via trigger or API)
// 4. Send email verification
// 5. Return user session
```

#### Login Flow
```typescript
interface LoginRequest {
  email: string;
  password: string;
}

const { data, error } = await supabase.auth.signInWithPassword({
  email: request.email,
  password: request.password
});

// Update last_login_at timestamp
```

#### Email Verification
```typescript
// Verify email with token from email link
const { data, error } = await supabase.auth.verifyOtp({
  email: userEmail,
  token: verificationToken,
  type: 'email'
});
```

### 2. OAuth Authentication (Google, GitHub, Apple)

#### OAuth Login Flow
```typescript
interface OAuthProvider {
  provider: 'google' | 'github' | 'apple';
}

// 1. Initiate OAuth flow
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
});

// 2. Handle OAuth callback
const { data: { session } } = await supabase.auth.getSession();

// 3. Create/update account_oauth record
// 4. Create account record if new user
// 5. Update last_login_at
```

### 3. Session Management

#### Get Current Session
```typescript
const { data: { session } } = await supabase.auth.getSession();

if (session) {
  // User is authenticated
  const user = session.user;
}
```

#### Refresh Session
```typescript
const { data: { session }, error } = await supabase.auth.refreshSession();
```

#### Logout
```typescript
const { error } = await supabase.auth.signOut();

// Update logout_at timestamp in account table
```

---

## 📡 API Endpoints Design

### Authentication Service (TypeScript)

```typescript
// src/services/auth.service.ts

import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string | null;
  emailVerified: boolean;
  authMethod: 'email' | 'google' | 'github' | 'apple';
  defaultLocale: string;
  defaultTimezone: string;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface RegisterParams {
  email: string;
  password: string;
  locale?: string;
  timezone?: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Register new user with email/password
   */
  async register(params: RegisterParams): Promise<{ user: User | null; error: Error | null }> {
    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          locale: params.locale || 'en',
          timezone: params.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      }
    });

    if (error) return { user: null, error };

    return { user: data.user, error: null };
  }

  /**
   * Login with email/password
   */
  async login(params: LoginParams): Promise<{ session: Session | null; error: Error | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: params.email,
      password: params.password
    });

    if (error) return { session: null, error };

    // Update last_login_at
    await this.updateLastLogin(data.user.id);

    return { session: data.session, error: null };
  }

  /**
   * Login with OAuth provider
   */
  async loginWithOAuth(provider: 'google' | 'github' | 'apple'): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    return { error };
  }

  /**
   * Logout current user
   */
  async logout(): Promise<{ error: Error | null }> {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Update logout_at timestamp
      await supabase
        .from('account')
        .update({ logout_at: new Date().toISOString() })
        .eq('id', user.id);
    }

    const { error } = await supabase.auth.signOut();
    return { error };
  }

  /**
   * Get current session
   */
  async getSession(): Promise<{ session: Session | null; error: Error | null }> {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
  }

  /**
   * Get current user profile
   */
  async getUserProfile(userId: string): Promise<{ profile: AuthUser | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('account')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return { profile: null, error };

    return {
      profile: {
        id: data.id,
        email: data.email,
        emailVerified: data.email_verified,
        authMethod: data.auth_method,
        defaultLocale: data.default_locale,
        defaultTimezone: data.default_timezone,
        lastLoginAt: data.last_login_at,
        createdAt: data.created_at
      },
      error: null
    };
  }

  /**
   * Update user locale preference
   */
  async updateLocale(userId: string, locale: string, displayName?: string): Promise<{ error: Error | null }> {
    // Update default_locale in account table
    const { error: updateError } = await supabase
      .from('account')
      .update({
        default_locale: locale,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) return { error: updateError };

    // Upsert localization record
    if (displayName) {
      const { error: localeError } = await supabase
        .from('account_localization')
        .upsert({
          user_id: userId,
          locale,
          display_name: displayName,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,locale'
        });

      if (localeError) return { error: localeError };
    }

    return { error: null };
  }

  /**
   * Private: Update last login timestamp
   */
  private async updateLastLogin(userId: string): Promise<void> {
    await supabase
      .from('account')
      .update({
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
  }
}

export const authService = new AuthService();
```

---

## 🎯 Zustand Store Integration

```typescript
// src/stores/auth.store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Session } from '@supabase/supabase-js';
import { authService, type AuthUser } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  profile: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: AuthUser | null) => void;
  setSession: (session: Session | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, locale?: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUserProfile: () => Promise<void>;
  updateLocale: (locale: string, displayName?: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setProfile: (profile) => set({ profile }),
      setSession: (session) => set({ session }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { session, error } = await authService.login({ email, password });
          if (error) throw error;

          set({ session, user: session?.user || null, isAuthenticated: true });
          await get().loadUserProfile();
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (email, password, locale) => {
        set({ isLoading: true });
        try {
          const { user, error } = await authService.register({ email, password, locale });
          if (error) throw error;
          set({ user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
          set({ user: null, profile: null, session: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },

      loadUserProfile: async () => {
        const { user } = get();
        if (!user) return;

        const { profile, error } = await authService.getUserProfile(user.id);
        if (!error && profile) {
          set({ profile });
        }
      },

      updateLocale: async (locale, displayName) => {
        const { user } = get();
        if (!user) return;

        const { error } = await authService.updateLocale(user.id, locale, displayName);
        if (!error) {
          await get().loadUserProfile();
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        session: state.session,
        user: state.user
      })
    }
  )
);
```

---

## 🔒 Security Considerations

### 1. Password Security
- Minimum 8 characters
- Supabase handles bcrypt hashing automatically
- Implement password strength validation on frontend

### 2. Session Security
- JWT tokens stored in httpOnly cookies (Supabase default)
- Session refresh handled automatically by Supabase SDK
- Token expiration: 1 hour (configurable in Supabase)

### 3. OAuth Security
- State parameter for CSRF protection (handled by Supabase)
- Validate OAuth callback origin
- Store provider tokens securely

### 4. Rate Limiting
- Implement rate limiting for login attempts
- Use Supabase's built-in rate limiting features

### 5. Data Privacy
- Hash passwords before storage (handled by Supabase)
- Encrypt sensitive user data
- GDPR compliance: support account deletion with CASCADE

---

## 🧪 Testing Strategy

### Unit Tests
- AuthService methods
- Zustand store actions
- Validation utilities

### Integration Tests
- Complete auth flows (register, login, logout)
- OAuth callbacks
- Session management

### E2E Tests
- User registration flow
- Email verification
- Password reset
- OAuth login flows

---

## 📊 Error Handling

```typescript
// Common auth errors
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'invalid_credentials',
  EMAIL_EXISTS = 'email_exists',
  WEAK_PASSWORD = 'weak_password',
  EMAIL_NOT_VERIFIED = 'email_not_verified',
  OAUTH_ERROR = 'oauth_error',
  SESSION_EXPIRED = 'session_expired',
  NETWORK_ERROR = 'network_error'
}

export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// Error mapping from Supabase errors
export function mapSupabaseError(error: any): AuthError {
  if (error.message.includes('Invalid login credentials')) {
    return new AuthError(AuthErrorCode.INVALID_CREDENTIALS, 'Invalid email or password');
  }
  // Add more error mappings...
  return new AuthError(AuthErrorCode.NETWORK_ERROR, 'Network error occurred');
}
```

---

## 🚀 Implementation Roadmap

### Phase 1: Core Authentication (Week 1)
- [ ] Setup Supabase client
- [ ] Implement AuthService
- [ ] Create Zustand auth store
- [ ] Email/Password auth flows

### Phase 2: OAuth Integration (Week 1-2)
- [ ] Google OAuth
- [ ] GitHub OAuth
- [ ] Apple OAuth (if needed)

### Phase 3: User Profile & Localization (Week 2)
- [ ] User profile management
- [ ] Multi-language support
- [ ] Timezone handling

### Phase 4: Advanced Features (Week 2-3)
- [ ] Password reset
- [ ] Email verification
- [ ] Account settings
- [ ] Session management

### Phase 5: Testing & Security (Week 3)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Security audit
- [ ] Performance optimization

---

## 📚 Next Steps

1. **Initialize Supabase Client** - Setup Supabase configuration in project
2. **Implement AuthService** - Build core authentication service
3. **Create Auth Store** - Integrate with Zustand for state management
4. **Build Auth UI Components** - Login, Register, Profile forms
5. **Testing** - Comprehensive test coverage
6. **Documentation** - API usage guide for developers

---

**Status:** Ready for implementation
**Priority:** High
**Dependencies:** Database schema ✅, Supabase setup pending
