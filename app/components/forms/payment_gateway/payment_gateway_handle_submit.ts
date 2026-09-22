import React from "react";

type HandlePaymentSubmitParams = {
    mp: MercadoPagoInstance;

    firstName: string;
    lastName: string;
    email: string;
    dni: string;
    cardholderName: string;
    postalCode: string;

    selectedAmount: number;
    paymentMethodId: string;
    reports: any;

    onSubmit: (data: DonationData) => void;
};

export const handlePaymentSubmit = async ({
    mp,
    firstName,
    lastName,
    email,
    dni,
    cardholderName,
    postalCode,
    selectedAmount,
    paymentMethodId,
    reports,
    onSubmit,
}: HandlePaymentSubmitParams): Promise<String> => {
    try {
        // ====================================================
        // CREATE MERCADO PAGO TOKEN
        // ====================================================

        const cardToken =
            await mp.fields.createCardToken({
                cardholderName,

                identificationType:
                    "DNI",

                identificationNumber:
                    dni.trim(),
            });

        if (!cardToken?.id) {
            return "rejected";
        }

        // ====================================================
        // AMOUNT
        // ====================================================

        const amount = Number(selectedAmount);

        // ====================================================
        // BODY
        // ====================================================

        const paymentMethod: Record<string, string | number> = {
            type: "credit_card",
            token: cardToken.id,
            installments: 1,
        };

        const allowedPaymentMethodIds = new Set([
            "amex",
            "argencard",
            "cabal",
            "cencosud",
            "cmr",
            "diners",
            "master",
            "naranja",
            "visa",
        ]);

        const normalizedPaymentMethodId =
            String(paymentMethodId ?? "")
                .trim()
                .toLowerCase();

        if (allowedPaymentMethodIds.has(normalizedPaymentMethodId)) {
            paymentMethod.id = normalizedPaymentMethodId;
        } else if (normalizedPaymentMethodId) {
            console.warn(
                "payment_method.id inválido, se omite y Mercado Pago lo inferirá desde el token:",
                normalizedPaymentMethodId
            );
        }

        const body = {
            type: "online",

            processing_mode:
                "automatic",

            total_amount:
                amount,

            external_reference:
                crypto.randomUUID(),

            payer: {
                email: email.trim(),
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                identification: {
                    type: "DNI",
                    number: dni.trim(),
                },
            },

            transactions: {
                payments: [
                    {
                        amount,

                        payment_method: paymentMethod,
                    },
                ],
            },
        };

        console.log(body);

        // ====================================================
        // SEND TO BACKEND
        // ====================================================

        const response =
            await fetch(
                "/api/process_order",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body:
                        JSON.stringify(body),
                }
            );

        console.log("respuesta: ")
        console.log(response);

        const data = await response
            .json()
            .catch(() => null);

        // ====================================================
        // ERROR
        // ====================================================

        if (!response.ok) {
            console.error("/api/process_order respondió error:", data);

            return "rejected";
        }

        console.log(data);

        // ====================================================
        // SAVE DONATION TRACKER DATA
        // ====================================================

        try {
            const orderId = String(data?.id ?? "").trim();

            if (!orderId) {
                throw new Error("OrderId inválido de Mercado Pago");
            }

            const pendingStatuses = new Set([
                "processing",
                "in_process",
                "pending",
            ]);

            const pendiente = pendingStatuses.has(
                String(data?.status ?? "").trim().toLowerCase()
            );

            const donorPayload = {
                orderId,
                dni: Number(dni.trim()),
                nombre: firstName.trim(),
                apellido: lastName.trim(),
                cp: Number(postalCode.trim()),
                email: email.trim(),
                monto: Number(selectedAmount),
                pendiente,
                fecha: new Date().toISOString(),
            };

            await fetch(
                "/api/donationTracker",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(donorPayload),
                }
            );
        } catch (trackerError) {
            console.error("Error guardando donación en PostgreSQL:", trackerError);
        }

        // ====================================================
        // SUCCESS
        // ====================================================


        const paymentData:
            DonationData = {

            donationAmount:
                selectedAmount,

            reports,

            personalData: {
                firstName,
                lastName,
                email,
                postalCode,
            },

            paymentData: {

                dni,
                cardholderName,

                cardToken:
                    cardToken.id,

                paymentMethodId,

                installments: 1,
            },
        };

        onSubmit(paymentData);


        if (data.status == "processing") {
            return "processing"
        }
        return "accepted";

    } catch (error) {

        console.error(
            "Error procesando pago:",
            error
        );

        return "rejected";
    }
};
