import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { error: "MERCADOPAGO_ACCESS_TOKEN no configurado" },
        { status: 500 }
      );
    }

    console.log(body);

    // Llamar a Mercado Pago
    const response = await fetch("https://api.mercadopago.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(body),
    });

    const rawData = await response.text();
    let data: any = null;

    if (rawData) {
      try {
        data = JSON.parse(rawData);
      } catch {
        data = { raw: rawData };
      }
    }

    if (!response.ok) {
      console.error("Mercado Pago /v1/orders error:", {
        status: response.status,
        data,
      });

      return NextResponse.json(
        {
          error: "Mercado Pago rechazó la orden",
          mpStatus: response.status,
          mpData: data,
        },
        { status: response.status }
      );
    }

    if (data.status === "processed") {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/donation_email`,
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json",
            },
            body:
                JSON.stringify({ email: body.payer.email, accepted: true }),
        }
      );
    }
  
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Error procesando la orden" },
      { status: 500 }
    );
  }
}