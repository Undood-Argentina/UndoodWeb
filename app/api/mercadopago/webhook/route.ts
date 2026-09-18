import { NextResponse } from "next/server";
import {
    WebhookSignatureValidator,
    InvalidWebhookSignatureError,
} from "mercadopago";



export async function POST(req: Request) {
    try {
        const url = new URL(req.url);

        const xSignature = req.headers.get("x-signature");
        const xRequestId = req.headers.get("x-request-id");

        const body = await req.json();

        const dataId = url.searchParams.get("data.id")?.toLowerCase() ?? "";

        const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

        if (!secret) {
            throw new Error("MERCADOPAGO_WEBHOOK_SECRET no configurado");
        }
        try {
            WebhookSignatureValidator.validate({
                xSignature: xSignature,
                xRequestId: xRequestId,
                dataId: dataId,
                secret: secret,
            });
        } catch (error) {
            if (error instanceof InvalidWebhookSignatureError) {
                return NextResponse.json(
                    { error: "Invalid signature" },
                    { status: 401 }
                );
            }

            throw error;
        }


        console.log("Webhook Mercado Pago válido:", body);

        const orderId = dataId;

        // Consultamos la Order directamente a Mercado Pago
        const response = await fetch(
            `https://api.mercadopago.com/v1/orders/${orderId}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
                },
            }
        );

        if (!response.ok) {
            console.error(
                "Error consultando Order:",
                response.status
            );

            return NextResponse.json(
                { error: "Error consultando Order" },
                { status: 500 }
            );
        }

        const order = await response.json();

        console.log("Order:", order);

        // fetchear orderId y obtener mail
        const orderIdResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/donationTracker/${orderId}`,
            {
                method: "GET",
            }
        );
        if (!orderIdResponse.ok) {
            return NextResponse.json(
                { error: "Error obteniendo mail" },
                { status: 500 }
            );
        }
        const data = await orderIdResponse.json();

        const email = data.email

        if (
            order.status === "processed" &&
            order.status_detail === "accredited"
        ) {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/donation_email`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body:
                        JSON.stringify({ email: email, accepted: true }),
                }
            );
            if (!response.ok) {
                return NextResponse.json(
                    { error: "Error enviando mail" },
                    { status: 500 }
                );
            }
        }

        if (order.status === "failed") {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/donation_email`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body:
                        JSON.stringify({ email: email, accepted: false }),
                }
            );

            if (!response.ok) {
                return NextResponse.json(
                    { error: "Error enviando mail" },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
        console.error("Webhook Mercado Pago:", error);

        return NextResponse.json(
            { error: "Webhook error" },
            { status: 500 }
        );
    }
}