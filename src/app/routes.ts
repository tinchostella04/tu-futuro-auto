export const ROUTES = {
  HOME: '/',
  VEHICLES: '/vehiculos',
  PUBLISH: '/publicar',
  ADMIN: '/admin',
  CREATE_VEHICLE: '/admin/crear-vehiculo',
  PAYMENT_SUCCESS: '/pago-exitoso',
  PAYMENT_FAILED: '/pago-fallido',
  PAYMENT_PENDING: '/pago-pendiente',
} as const

export type Route = (typeof ROUTES)[keyof typeof ROUTES]
