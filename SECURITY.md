# Dokumentasi Keamanan API

## 🔐 Status Keamanan Saat Ini

### API yang Telah Diproteksi dengan Auth

Berikut adalah API endpoints yang **SUDAH** dilindungi dengan validasi autentikasi:

#### 1. **API Peserta** (Data Pegawai Sensitif)
- `GET /api/mudikgratis/participants` - Mengembalikan data semua peserta
- `POST /api/mudikgratis/participants` - Membuat peserta baru
- `DELETE /api/mudikgratis/participants/[id]` - Menghapus peserta

#### 2. **API Cek Bus** (Data Alokasi)
- `POST /api/mudikgratis/check-bus` - Mencari alokasi bus peserta

#### 3. **API Daftar Ulang** (Data Registrasi)
- `POST /api/mudikgratis/reregistration` - Mendaftar ulang peserta

### API yang Masih Publik (Tanpa Auth)

Endpoints ini **MASIH** dapat diakses tanpa autentikasi:

#### 1. **API General Info** (Data Non-sensitif)
- `GET /api/mudikgratis/settings` - Pengaturan umum
- `GET /api/mudikgratis/summary` - Statistik umum
- `GET /api/mudikgratis/cities` - Daftar kota tujuan
- `GET /api/mudikgratis/buses` - Daftar bus

#### 2. **API Auth**
- `GET /api/auth/session` - Session NextAuth
- `POST /api/auth/[...nextauth]` - Login/Logout

#### 3. **API Lainnya**
- `GET /api/sliders` - Slider/Carousel
- `GET /api/kegiatan` - Daftar kegiatan
- `GET /api/program` - Program
- `GET /api/peraturan` - Peraturan

## ⚠️ Masalah Keamanan yang Telah Diperbaiki

### Sebelum Perbaikan:
- Semua API dapat diakses langsung tanpa token
- Data pegawai (NIP, nama, keluarga, dll) terekspose lewat inspect browser
- Tidak ada validasi autentikasi sama sekali

### Sesudah Perbaikan:
- API yang mengembalikan data sensitif (participants, check-bus, reregistration) sekarang memerlukan autentikasi
- Tanpa token/session yang valid, request akan mendapat response `401 Unauthorized`
- Mencegah akses tidak sah ke data peserta

## 🔑 Cara Kerja Validasi Auth Saat Ini

### Helper Function: `/src/lib/auth.ts`

```typescript
export function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const sessionToken = request.cookies.get('next-auth.session-token')?.value;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return true; // TODO: Validate JWT token properly
  }
  
  if (sessionToken) {
    return true; // TODO: Validate session token properly
  }

  return false;
}

export function requireAuth(request: NextRequest) {
  if (!isAuthenticated(request)) {
    throw new Error('Unauthorized - Authentication required');
  }
}
```

### Contoh Penggunaan di Endpoint:

```typescript
export async function GET(request: NextRequest) {
  try {
    // Wajib login untuk akses data sensitif
    requireAuth(request);

    // ... code endpoint
    
  } catch (error: any) {
    if (error.message === 'Unauthorized - Authentication required') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## 🚨 Yang Perlu Dilakukan Selanjutnya

### 1. Implement NextAuth.js dengan Benar

Saat ini validasi auth masih **SIMULASI**. Token belum divalidasi dengan benar. Berikut yang perlu dilakukan:

#### Langkah 1: Konfigurasi NextAuth.js

Buat file `/src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from '@/lib/credentials-provider';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // TODO: Validate credentials dengan database
        const user = { id: '1', name: 'Admin', email: 'admin@bmkg.go.id' };
        if (credentials.username === 'admin' && credentials.password === 'admin123') {
          return user;
        }
        return null;
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

#### Langkah 2: Update Helper Auth untuk Validasi Token

Update `/src/lib/auth.ts` untuk memvalidasi JWT token:

```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions);
    return !!session?.user;
  } catch (error) {
    return false;
  }
}

export async function requireAuth(request: NextRequest) {
  const authenticated = await isAuthenticated(request);
  if (!authenticated) {
    throw new Error('Unauthorized - Authentication required');
  }
}
```

#### Langkah 3: Update Endpoint untuk Use Server Session

Update endpoint yang menggunakan auth:

```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ... rest of code
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 2. Frontend - Kirim Token di Request

Saat ini frontend belum mengirim token di request. Setelah NextAuth terimplementasi:

#### Update API Calls di Frontend:

```typescript
// Contoh untuk fetching dengan session
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const session = await getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // NextAuth akan otomatis mengirim session cookie
  return fetch(url, {
    ...options,
    headers,
  });
}

// Penggunaan:
const response = await fetchWithAuth('/api/mudikgratis/participants');
```

### 3. Environment Variables

Buat file `.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production

# Database URLs (jika perlu)
DATABASE_URL=your-database-url
```

### 4. Implementasi JWT Token Validation (Opsional)

Untuk API yang dipanggil dari luar (mobile app, dll), implementasi JWT:

```typescript
import { jwtVerify } from 'jose';

export async function verifyToken(token: string): Promise<any> {
  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}
```

## 📋 Checklist Keamanan

- [x] Validasi auth pada endpoint sensitif (participants, check-bus, reregistration)
- [x] Response 401 untuk unauthorized access
- [ ] Implement NextAuth.js configuration
- [ ] Setup credentials provider dengan database
- [ ] Frontend mengirim session token secara otomatis
- [ ] Validasi JWT token yang benar
- [ ] Implement rate limiting
- [ ] HTTPS di production
- [ ] CORS configuration yang ketat
- [ ] Input validation dan sanitization

## 🛡️ Best Practices untuk Keamanan

### 1. Jangan Terekspose Data Sensitif
- Data pegawai (NIP, nama, keluarga) adalah data SENSITIF
- Jangan tampilkan data lengkap di response error
- Mask bagian sensitif di logs

### 2. Gunakan HTTPS di Production
- Selalu gunakan HTTPS untuk semua request
- Token dikirim melalui HTTPS, bukan HTTP

### 3. Validasi Input
- Selalu validasi dan sanitize input dari user
- Gunakan zod atau similar untuk schema validation

### 4. Rate Limiting
- Implementasi rate limiting untuk mencegah brute force
- Limit request per IP/endpoint

### 5. Logging & Monitoring
- Log semua request yang gagal (401, 403, 429)
- Monitor akses yang mencurigakan

### 6. Session Management
- Session timeout yang wajar
- Secure cookie settings (httpOnly, secure, sameSite)

## 📝 Contoh Response Saat Ini

### ✅ Dengan Token/Session Valid:
```json
{
  "data": [
    {
      "id": "P-001",
      "name": "Ahmad Fauzi",
      "nip": "198001012001001001",
      "phone": "081234567890",
      ...
    }
  ]
}
```

### ❌ Tanpa Token/Session:
```json
{
  "error": "Unauthorized - Authentication required"
}
```

## 🚀 Langkah Selanjutnya

1. **Implement NextAuth.js** dengan proper session management
2. **Setup database** untuk credentials storage
3. **Update frontend** untuk mengirim session secara otomatis
4. **Test** semua endpoint dengan dan tanpa auth
5. **Implement** rate limiting dan security headers
6. **Deploy** dengan HTTPS

---

**Catatan**: Saat ini, validasi auth sudah diterapkan di level endpoint, tetapi implementasi NextAuth.js belum lengkap. Token masih disimulasikan. Harap lengkapi implementasi NextAuth.js sebelum production.
