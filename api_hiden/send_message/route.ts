// import { NextRequest, NextResponse } from 'next/server';

// interface SendMessageBody {
//     csvData?: string; // CSV content as string
//     recipients?: Array<{
//         phone: string;
//         name?: string;
//         customFields?: Record<string, string>;
//     }>;
//     message: string;
//     templateName?: string;
//     templateParams?: string[];
// }

// interface WhatsAppResponse {
//     success: boolean;
//     phone: string;
//     messageId?: string;
//     error?: string;
// }

// // Función para validar y formatear número de teléfono
// function formatPhoneNumber(phone: string): string {
//     // Remover espacios, guiones, paréntesis
//     let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
//     // Si empieza con +, dejarlo; si no, agregar código de país (ej: 549 para Argentina)
//     if (!cleaned.startsWith('+')) {
//         // Asumimos Argentina por defecto, ajustar según necesidad
//         if (cleaned.startsWith('54')) {
//             cleaned = '+' + cleaned;
//         } else if (cleaned.startsWith('9')) {
//             cleaned = '+549' + cleaned;
//         } else {
//             cleaned = '+549' + cleaned;
//         }
//     }
    
//     return cleaned;
// }

// // Función para parsear CSV
// function parseCSV(csvContent: string): Array<{ phone: string; name?: string; [key: string]: any }> {
//     const lines = csvContent.trim().split('\n');
//     if (lines.length === 0) return [];
    
//     // Primera línea es el header
//     const headers = lines[0].split(',').map(h => h.trim());
//     const phoneIndex = headers.findIndex(h => h.toLowerCase().includes('phone') || h.toLowerCase().includes('tel') || h.toLowerCase().includes('celular'));
//     const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name') || h.toLowerCase().includes('nombre'));
    
//     if (phoneIndex === -1) {
//         throw new Error('CSV must contain a phone/telephone column');
//     }
    
//     const recipients: Array<{ phone: string; name?: string; [key: string]: any }> = [];
    
//     for (let i = 1; i < lines.length; i++) {
//         const values = lines[i].split(',').map(v => v.trim());
//         if (values[phoneIndex]) {
//             const recipient: any = {
//                 phone: formatPhoneNumber(values[phoneIndex])
//             };
            
//             if (nameIndex !== -1 && values[nameIndex]) {
//                 recipient.name = values[nameIndex];
//             }
            
//             // Agregar otros campos como custom fields
//             headers.forEach((header, idx) => {
//                 if (idx !== phoneIndex && idx !== nameIndex && values[idx]) {
//                     recipient[header] = values[idx];
//                 }
//             });
            
//             recipients.push(recipient);
//         }
//     }
    
//     return recipients;
// }

// // Función para enviar mensaje via WhatsApp Business API
// async function sendWhatsAppMessage(
//     phone: string,
//     message: string,
//     name?: string,
//     templateName?: string,
//     templateParams?: string[]
// ): Promise<WhatsAppResponse> {
//     const WHATSAPP_TOKEN = process.env.WHATSAPP_API_TOKEN;
//     const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
//     const WHATSAPP_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
    
//     if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
//         return {
//             success: false,
//             phone,
//             error: 'WhatsApp credentials not configured'
//         };
//     }
    
//     try {
//         const url = `https://graph.facebook.com/${WHATSAPP_VERSION}/${WHATSAPP_PHONE_ID}/messages`;
        
//         let body: any;
        
//         if (templateName) {
//             // Usar template aprobado
//             body = {
//                 messaging_product: 'whatsapp',
//                 to: phone,
//                 type: 'template',
//                 template: {
//                     name: templateName,
//                     language: {
//                         code: 'es_AR' // Ajustar según necesidad
//                     },
//                     components: templateParams ? [
//                         {
//                             type: 'body',
//                             parameters: templateParams.map(param => ({
//                                 type: 'text',
//                                 text: param
//                             }))
//                         }
//                     ] : []
//                 }
//             };
//         } else {
//             // Mensaje de texto simple (requiere conversación activa o ventana de 24hs)
//             body = {
//                 messaging_product: 'whatsapp',
//                 to: phone,
//                 type: 'text',
//                 text: {
//                     body: message
//                 }
//             };
//         }
        
//         const response = await fetch(url, {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(body)
//         });
        
//         const data = await response.json();
        
//         if (!response.ok) {
//             return {
//                 success: false,
//                 phone,
//                 error: data.error?.message || 'Failed to send message'
//             };
//         }
        
//         return {
//             success: true,
//             phone,
//             messageId: data.messages?.[0]?.id
//         };
        
//     } catch (error) {
//         return {
//             success: false,
//             phone,
//             error: (error as Error).message
//         };
//     }
// }

// // Delay helper para respetar rate limits
// const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// export async function POST(req: NextRequest) {
//     try {
//         const body = await req.json() as SendMessageBody;
        
//         let recipients: Array<{ phone: string; name?: string; [key: string]: any }> = [];
        
//         // Parsear CSV si se provee
//         if (body.csvData) {
//             try {
//                 recipients = parseCSV(body.csvData);
//             } catch (error) {
//                 return NextResponse.json({
//                     success: false,
//                     error: 'Invalid CSV format',
//                     details: (error as Error).message
//                 }, { status: 400 });
//             }
//         } else if (body.recipients) {
//             recipients = body.recipients.map(r => ({
//                 ...r,
//                 phone: formatPhoneNumber(r.phone)
//             }));
//         } else {
//             return NextResponse.json({
//                 success: false,
//                 error: 'Either csvData or recipients must be provided'
//             }, { status: 400 });
//         }
        
//         if (recipients.length === 0) {
//             return NextResponse.json({
//                 success: false,
//                 error: 'No valid recipients found'
//             }, { status: 400 });
//         }
        
//         if (!body.message && !body.templateName) {
//             return NextResponse.json({
//                 success: false,
//                 error: 'Either message or templateName must be provided'
//             }, { status: 400 });
//         }
        
//         // Enviar mensajes con delay para respetar rate limits
//         const results: WhatsAppResponse[] = [];
//         const DELAY_MS = 1000; // 1 segundo entre mensajes (ajustar según rate limit)
        
//         for (let i = 0; i < recipients.length; i++) {
//             const recipient = recipients[i];
            
//             // Reemplazar placeholders en el mensaje con datos del recipiente
//             let personalizedMessage = body.message;
//             if (personalizedMessage && recipient.name) {
//                 personalizedMessage = personalizedMessage.replace(/\{name\}/g, recipient.name);
//             }
            
//             const result = await sendWhatsAppMessage(
//                 recipient.phone,
//                 personalizedMessage || body.message,
//                 recipient.name,
//                 body.templateName,
//                 body.templateParams
//             );
            
//             results.push(result);
            
//             // Delay entre mensajes (excepto el último)
//             if (i < recipients.length - 1) {
//                 await delay(DELAY_MS);
//             }
//         }
        
//         const successCount = results.filter(r => r.success).length;
//         const failureCount = results.filter(r => !r.success).length;
        
//         return NextResponse.json({
//             success: true,
//             totalRecipients: recipients.length,
//             successCount,
//             failureCount,
//             results
//         });
        
//     } catch (error) {
//         console.error('Error sending WhatsApp messages:', error);
//         return NextResponse.json({
//             success: false,
//             error: 'Internal server error',
//             details: (error as Error).message
//         }, { status: 500 });
//     }
// }

export async function GET(){
    return new Response('Send Message API is running');
}