// Error codes para la API de Christmas
export const ChristmasErrorCodes = {
  // User errors (400s)
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  CHILD_NOT_FOUND: 'CHILD_NOT_FOUND',
  CHILD_ALREADY_ASSIGNED: 'CHILD_ALREADY_ASSIGNED',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELDS: 'MISSING_REQUIRED_FIELDS',
  
  // Server errors (500s)
  DATABASE_ERROR: 'DATABASE_ERROR',
  EMAIL_SEND_ERROR: 'EMAIL_SEND_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ChristmasErrorCode = typeof ChristmasErrorCodes[keyof typeof ChristmasErrorCodes];

// Mensajes de error en español
export const ERROR_MESSAGES: Record<ChristmasErrorCode, string> = {
  USER_ALREADY_EXISTS: 'Ya existe un usuario registrado con este email',
  CHILD_NOT_FOUND: 'El niño/a seleccionado no existe',
  CHILD_ALREADY_ASSIGNED: 'El niño/a seleccionado ya fue asignado a otro usuario',
  INVALID_INPUT: 'Los datos proporcionados son inválidos',
  MISSING_REQUIRED_FIELDS: 'Faltan campos obligatorios',
  DATABASE_ERROR: 'Error al conectar con la base de datos',
  EMAIL_SEND_ERROR: 'Error al enviar el email de confirmación',
  INTERNAL_ERROR: 'Error interno del servidor',
};

// Helper para crear respuestas de error consistentes
export function createErrorResponse(
  code: ChristmasErrorCode, 
  status: number,
  details?: string
) {
  return new Response(
    JSON.stringify({
      error: {
        code,
        message: ERROR_MESSAGES[code],
        ...(details && { details }),
      }
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Helper para respuestas exitosas
export function createSuccessResponse(message: string, status: number = 200, data?: unknown) {
  const response: {
    success: boolean;
    message: string;
    data?: unknown;
  } = {
    success: true,
    message,
  };
  
  if (data !== undefined) {
    response.data = data;
  }
  
  return new Response(
    JSON.stringify(response),
    {
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
