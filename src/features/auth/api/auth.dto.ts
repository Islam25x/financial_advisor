export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface ConfirmEmailRequestDto {
  userId: string;
  token: string;
}

export interface ResendConfirmationRequestDto {
  email: string;
}

export interface LoginResponseDto {
  token: string;
  expiresAt?: string | null;
  expiresIn?: number | null;
}

export interface RegisterResponseDto {
  message: string;
}

export interface ResendConfirmationResponseDto {
  message: string;
}

export interface LogoutResponseDto {
  message: string;
}
export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ForgotPasswordResponseDto {
  message: string;
}

export interface ResetPasswordRequestDto {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponseDto {
  message: string;
}