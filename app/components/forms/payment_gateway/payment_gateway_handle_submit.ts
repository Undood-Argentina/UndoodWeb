import React from "react";

interface PersonalData {
    firstName: string;
    lastName: string;
    email: string;
    postalCode: string;
}

interface PaymentData {
    dni: string;

    // Token generado por Mercado Pago.
    // Nunca se almacenan los datos reales de la tarjeta.
    cardToken: string;

    paymentMethodId: string;
    installments: number;
}

interface DonationData {
    donationAmount: number;
    reports: boolean;

    personalData: PersonalData;

    paymentData: PaymentData;
}

type HandlePaymentSubmitParams = {
    event: React.FormEvent<HTMLFormElement>;

    processingPayment: boolean;
    setProcessingPayment: React.Dispatch<
        React.SetStateAction<boolean>
    >;

    paymentDataRef: React.RefObject<any>;

    billingDataRef: React.RefObject<any>;


    setErrors: React.Dispatch<
        React.SetStateAction<Record<string, string>>
    >;

    firstName: string;
    lastName: string;
    email: string;
    dni: string;
    postalCode: string;

    selectedAmount: number;
    paymentMethodId: string;
    reports: any;

    onSubmit: (data: DonationData) => void;
};

export const handlePaymentSubmit = async ({
    event,
    processingPayment,
    setProcessingPayment,
    paymentDataRef,
    billingDataRef,
    setErrors,
    firstName,
    lastName,
    email,
    dni,
    postalCode,
    selectedAmount,
    paymentMethodId,
    reports,
    onSubmit,
}: HandlePaymentSubmitParams): Promise<void> => {

    event.preventDefault();

    if (processingPayment) {
        return;
    }

    const valid =
        paymentDataRef.current?.validate()
        && billingDataRef.current?.validate();

    if (!valid) {
        return;
    }

    const mp =
        paymentDataRef.current?.getMercadoPagoInstance();

    if (!mp) {
        setErrors((prev) => ({
            ...prev,
            payment:
                "El formulario de pago no está disponible.",
        }));

        return;
    }

    try {

        setProcessingPayment(true);

        setErrors((prev) => ({
            ...prev,
            payment: "",
        }));

        // ====================================================
        // CARDHOLDER
        // ====================================================

        const cardholderName =
            `${firstName.trim()} ${lastName.trim()}`;

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

            setErrors((prev) => ({
                ...prev,
                payment:
                    "No se pudo validar la tarjeta.",
            }));

            setProcessingPayment(false);

            return;
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

            setErrors((prev) => ({
                ...prev,
                payment:
                    "No se pudo procesar el pago.",
            }));

            setProcessingPayment(false);

            return;
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

                cardToken:
                    cardToken.id,

                paymentMethodId,

                installments: 1,
            },
        };

        onSubmit(paymentData);

        setProcessingPayment(false);

    } catch (error) {

        console.error(
            "Error procesando pago:",
            error
        );

        setErrors((prev) => ({
            ...prev,
            payment:
                "No se pudo procesar el pago.",
        }));

        setProcessingPayment(false);
    }
};