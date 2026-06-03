/**
 * Gắn vào `request.user` sau JwtAuthGuard (Firebase ID token) / login response.
 */
export interface AuthUser {
  userId: string;
  role: string;
  email: string;
}
