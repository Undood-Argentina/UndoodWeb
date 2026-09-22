import { NextResponse } from "next/server";
import {
    WebhookSignatureValidator,
    InvalidWebhookSignatureError,
} from "mercadopago";
import { conectDB, Donacion } from "../../config";



export async function POST(req: Request) {
    try {
        const url = new URL(req.url);

        const xSignature = req.headers.get("x-signature");
        const xRequestId = req.headers.get("x-request-id");

        const body = await req.json();

        const dataId = url.searchParams.get("data.id") ?? "";

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
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/donationTracker/getMail/${orderId}`,
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

        const orderStatus = String(order.status ?? "").toLowerCase();
        const orderStatusDetail = String(order.status_detail ?? "").toLowerCase();
        const isFinalState = ["processed", "failed", "cancelled", "expired"].includes(orderStatus);

        if (isFinalState) {
            await conectDB();
            await Donacion.update(
                { pendiente: false },
                { where: { id_donacion: orderId } }
            );
        }

        if (
            orderStatus === "processed" &&
            orderStatusDetail === "accredited"
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

        if (orderStatus === "failed") {
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