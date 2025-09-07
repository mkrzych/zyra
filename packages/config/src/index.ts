// Shared configuration (placeholder for Phase 1)
export const CONFIG = {
  API_VERSION: 'v1',
  PAGINATION_SIZE: 20,
  JWT_EXPIRY: '7d',
} as const;

export const USER_ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  TEAM_MEMBER: 'TEAM_MEMBER',
  CLIENT: 'CLIENT',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];