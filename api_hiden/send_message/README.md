# WhatsApp Business API - Envío Masivo de Mensajes

Este endpoint permite enviar mensajes de WhatsApp a múltiples destinatarios desde un CSV o lista de contactos.

## Configuración

Añadir las siguientes variables de entorno en tu `.env.local`:

```env
WHATSAPP_API_TOKEN=tu_token_aqui
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id
WHATSAPP_API_VERSION=v18.0
```

### Obtener credenciales de WhatsApp Business API

1. Ir a [Meta for Developers](https://developers.facebook.com/)
2. Crear una app de WhatsApp Business
3. Configurar el número de teléfono
4. Copiar el **Phone Number ID** y el **Access Token**

## Uso

### Endpoint
```
POST /api/send_message
```

### Opción 1: Enviar desde CSV

```json
{
  "csvData": "phone,name\n+5491123456789,Juan\n+5491198765432,María",
  "message": "Hola {name}, este es un mensaje de prueba!"
}
```

### Opción 2: Enviar desde lista de contactos

```json
{
  "recipients": [
    { "phone": "+5491123456789", "name": "Juan" },
    { "phone": "+5491198765432", "name": "María" }
  ],
  "message": "Hola, este es un mensaje de prueba!"
}
```

### Opción 3: Usar template aprobado

```json
{
  "recipients": [
    { "phone": "+5491123456789", "name": "Juan" }
  ],
  "templateName": "hello_world",
  "templateParams": ["Juan", "parámetro2"]
}
```

## Formato CSV

El CSV debe tener una columna con el número de teléfono (phone, telephone, celular, tel) y opcionalmente una columna con el nombre (name, nombre).

Ejemplo:
```csv
phone,name
+5491123456789,Juan Pérez
5491198765432,María García
91134567890,Pedro López
```

## Formateo de Números

El endpoint automáticamente formatea los números:
- Acepta con o sin `+`
- Agrega código de país si falta (por defecto Argentina: +549)
- Limpia espacios, guiones y paréntesis

## Rate Limiting

El endpoint incluye un delay de 1 segundo entre mensajes para respetar los límites de WhatsApp Business API. Ajustar `DELAY_MS` según tu tier de cuenta.

## Respuesta

```json
{
  "success": true,
  "totalRecipients": 2,
  "successCount": 2,
  "failureCount": 0,
  "results": [
    {
      "success": true,
      "phone": "+5491123456789",
      "messageId": "wamid.xxx"
    },
    {
      "success": true,
      "phone": "+5491198765432",
      "messageId": "wamid.yyy"
    }
  ]
}
```

## Notas Importantes

⚠️ **Mensajes de texto vs Templates**:
- Los mensajes de texto simple solo funcionan dentro de la ventana de 24 horas después de que el usuario inicie la conversación
- Para mensajes iniciados por el negocio (como campañas masivas), se deben usar **templates aprobados** por Meta

⚠️ **Rate Limits**:
- Tier 1 (nuevo): 1,000 conversaciones únicas / 24h
- Tier 2: 10,000 conversaciones únicas / 24h
- Tier 3: 100,000 conversaciones únicas / 24h

⚠️ **Costos**:
- Verificar pricing según tu región en [WhatsApp Business Pricing](https://developers.facebook.com/docs/whatsapp/pricing)

## Testing

Para probar con curl:

```bash
curl -X POST http://localhost:3000/api/send_message \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": [{"phone": "+5491123456789", "name": "Test"}],
    "message": "Hola {name}, este es un test!"
  }'
```
