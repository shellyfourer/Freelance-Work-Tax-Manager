//Mirrors UserSetupQuestDto

export interface UserSetupRequest {
  country: string;
  currency: string;
}

// Mirrors backend UserResponseDto

export interface User {
  userId: number;
  name: string;
  email: string;
  country: string;
  currency: string;
  setupComplete: boolean;
}
