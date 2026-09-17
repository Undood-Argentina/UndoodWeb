import React from "react";

type HandlePaymentSubmitParams = {
    mp: MercadoPagoInstance;

    setProcessingPayment: React.Dispatch<
        React.SetStateAction<boolean>
    >;



    setErrors: React.Dispatch<
        React.SetStateAction<Record<string, string>>
    >;

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
    setProcessingPayment,
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
}: HandlePaymentSubmitParams): Promise<boolean> => {


    try {

        setProcessingPayment(true);

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

            setProcessingPayment(false);

            return false;
        }

        // ====================================================
        // AMOUNT
        // ====================================================

        const amount =
            String(selectedAmount);

        // ====================================================
        // BODY
        // ====================================================

        const body = {
            type: "online",

            processing_mode:
                "automatic",

            total_amount:
                amount,

            external_reference:
                crypto.randomUUID(),

            payer: {
                email,
            },

            transactions: {
                payments: [
                    {
                        amount,

                        payment_method: {
                            id:
                                paymentMethodId,

                            type:
                                "credit_card",

                            token:
                                cardToken.id,

                            installments:
                                1,
                        },
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

        console.log(response);

        // ====================================================
        // ERROR
        // ====================================================

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(errorText);

            setProcessingPayment(false);

            return false;
        }

        // ====================================================
        // SAVE DONATION TRACKER DATA
        // ====================================================

        try {
            const donorPayload = {
                dni: Number(dni.trim()),
                nombre: firstName.trim(),
                apellido: lastName.trim(),
                cp: Number(postalCode.trim()),
                email: email.trim(),
                monto: Number(selectedAmount),
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

        const data =
            await response.json();

        console.log(data);

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

        setProcessingPayment(false);

        return true;

    } catch (error) {

        console.error(
            "Error procesando pago:",
            error
        );

        setProcessingPayment(false);

        return false;
    }
};