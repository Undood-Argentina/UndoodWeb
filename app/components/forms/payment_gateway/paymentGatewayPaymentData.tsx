import React, {
    forwardRef,
    useEffect,
    useRef,
    useImperativeHandle,
    useState,
} from "react";
import {
    loadMercadoPago,
} from "@mercadopago/sdk-js";


import { PaymentGatewayField } from "./paymentGatewayField";

// ============================================================
// MERCADO PAGO TYPES
// ============================================================

interface MercadoPagoField {
    mount: (elementId: string) => void;

    unmount?: () => void;

    on: (
        event: string,
        callback: (data: any) => void
    ) => void;
}

interface MercadoPagoFields {
    create: (
        type: string,
        options: {
            placeholder?: string;
        }
    ) => MercadoPagoField;

    createCardToken: (data: {
        cardholderName: string;
        identificationType: string;
        identificationNumber: string;
    }) => Promise<{
        id: string;
    }>;
}

interface MercadoPagoInstance {
    fields: MercadoPagoFields;

    getIdentificationTypes: () => Promise<any[]>;

    getPaymentMethods: (params: {
        bin: string;
    }) => Promise<{
        results: any[];
    }>;

    getInstallments: (params: {
        amount: string;
        bin: string;
        paymentTypeId: string;
    }) => Promise<any[]>;
}

export type PaymentGatewayPaymentDataRef = {
    validate: () => boolean;
    getMercadoPagoInstance: () => MercadoPagoInstance | null;
    getCardNumberField: () => MercadoPagoField | null;
    getExpirationDateField: () => MercadoPagoField | null;
    getSecurityCodeField: () => MercadoPagoField | null;
};


const PaymentGatewayPaymentData = forwardRef<
    PaymentGatewayPaymentDataRef,
    {
        onReady: (ready: boolean) => void;
        onPaymentMethodIdChanged: (paymentMethodId: string) => void;
        onDniChanged: (dni: string) => void;
    }
>(function PaymentGatewayPaymentData(props, ref) {


    const [dni, setDni] = useState<string>("");
    useEffect(() => {
        props.onDniChanged(dni);
        if ("dni" in errors) {
            const newErrors = { ...errors };
            delete newErrors.dni;
            setErrors(newErrors);
        }

    }, [dni])

    // ========================================================
    // MERCADO PAGO REFS
    // ========================================================

    const mercadoPagoRef =
        useRef<MercadoPagoInstance | null>(
            null
        );

    const cardNumberFieldRef =
        useRef<MercadoPagoField | null>(
            null
        );

    const expirationDateFieldRef =
        useRef<MercadoPagoField | null>(
            null
        );

    const securityCodeFieldRef =
        useRef<MercadoPagoField | null>(
            null
        );

    useImperativeHandle(ref, () => ({
        validate: validate,

        getMercadoPagoInstance: () =>
            mercadoPagoRef.current,

        getCardNumberField: () =>
            cardNumberFieldRef.current,

        getExpirationDateField: () =>
            expirationDateFieldRef.current,

        getSecurityCodeField: () =>
            securityCodeFieldRef.current,
    }));

    // ========================================================
    // MERCADO PAGO STATE
    // ========================================================

    const [paymentMethodId, setPaymentMethodId] =
        useState<string>("");
    
    useEffect(() => {
        props.onPaymentMethodIdChanged(paymentMethodId)
    }, [paymentMethodId])

    const [mercadoPagoReady, setMercadoPagoReady] =
        useState<boolean>(false);

    useEffect(() => {
        props.onReady(mercadoPagoReady)
    }, [mercadoPagoReady])

    const initializeMercadoPago =
        async (): Promise<void> => {
            let cancelled = false;

            try {

                await loadMercadoPago();

                if (cancelled) {
                    return;
                }

                const publicKey =
                    process.env
                        .NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;

                if (!publicKey) {

                    console.error(
                        "Mercado Pago public key is not configured."
                    );

                    setErrors((prev) => ({
                        ...prev,
                        payment:
                            "No se pudo inicializar Mercado Pago.",
                    }));

                    return;
                }

                const mp =
                    new window.MercadoPago(
                        publicKey
                    ) as unknown as MercadoPagoInstance;

                mercadoPagoRef.current =
                    mp;

                // ====================================================
                // CARD NUMBER
                // ====================================================

                const cardNumberField =mp.fields.create("cardNumber", {
                    placeholder: "0000 0000 0000 0000",
                    style: {
                        color: "#0F1D36",
                        fontFamily: "Nunito Sans",
                        fontSize: "14px",
                        fontStyle: "normal",
                        fontWeight: "400",
                    },
                    customFonts: [
                        {
                            src: "https://fonts.googleapis.com/css2?family=Nunito+Sans",
                        },
                    ],
                } as any);

                cardNumberField.on("change", () => {
                    setErrors((prev) => {
                        if (!("payment" in prev)) {
                            return prev;
                        }

                        const newErrors = { ...prev };
                        delete newErrors.payment;
                        return newErrors;
                    });
                });

                cardNumberField.on('focus', () => {
                    document.getElementById('pg-card-number')!.classList.add('is-focused');
                });

                cardNumberField.on('blur', () => {
                    document.getElementById('pg-card-number')!.classList.remove('is-focused');
                });

                cardNumberField.mount(
                    "pg-card-number"
                );
                

                cardNumberFieldRef.current =
                    cardNumberField;

                // ====================================================
                // EXPIRATION DATE
                // ====================================================

                const expirationDateField =
                    mp.fields.create(
                        "expirationDate",
                        {
                            placeholder:
                                "MM/AA",
                            style: {
                                color: "#0F1D36",
                                fontFamily: "Nunito Sans",
                                fontSize: "14px",
                                fontStyle: "normal",
                                fontWeight: "400",
                            },
                            customFonts: [
                                {
                                    src: "https://fonts.googleapis.com/css2?family=Nunito+Sans",
                                },
                            ],
                        } as any);


                expirationDateField.on("change", () => {
                    setErrors((prev) => {
                        if (!("payment" in prev)) {
                            return prev;
                        }

                        const newErrors = { ...prev };
                        delete newErrors.payment;
                        return newErrors;
                    });
                });


                expirationDateField.on('focus', () => {
                    document.getElementById('pg-expiration-date')!.classList.add('is-focused');
                });

                expirationDateField.on('blur', () => {
                    document.getElementById('pg-expiration-date')!.classList.remove('is-focused');
                });

                expirationDateField.mount(
                    "pg-expiration-date"
                );

                expirationDateFieldRef.current =
                    expirationDateField;

                // ====================================================
                // SECURITY CODE
                // ====================================================

                const securityCodeField =
                    mp.fields.create(
                        "securityCode",
                        {
                            placeholder:
                                "123",
                            style: {
                                color: "#0F1D36",
                                fontFamily: "Nunito Sans",
                                fontSize: "14px",
                                fontStyle: "normal",
                                fontWeight: "400",
                            },
                            customFonts: [
                                {
                                    src: "https://fonts.googleapis.com/css2?family=Nunito+Sans",
                                },
                            ],
                        } as any);


                securityCodeField.on("change", () => {
                    setErrors((prev) => {
                        if (!("payment" in prev)) {
                            return prev;
                        }

                        const newErrors = { ...prev };
                        delete newErrors.payment;
                        return newErrors;
                    });
                });

                securityCodeField.on('focus', () => {
                    document.getElementById('pg-security-code')!.classList.add('is-focused');
                });

                securityCodeField.on('blur', () => {
                    document.getElementById('pg-security-code')!.classList.remove('is-focused');
                });
                securityCodeField.mount(
                    "pg-security-code"
                );

                securityCodeFieldRef.current =
                    securityCodeField;

                // ====================================================
                // BIN CHANGE
                // ====================================================

                cardNumberField.on(
                    "binChange",
                    async (
                        data: {
                            bin?: string;
                        }
                    ) => {

                        console.log("BIN CHANGE:", data);
                        const bin =
                            data.bin;

                        if (!bin) {
                            console.log("No hay BIN");
                            setPaymentMethodId(
                                ""
                            );

                            return;
                        }

                        try {

                            // ----------------------------------------
                            // PAYMENT METHOD
                            // ----------------------------------------

                            const paymentMethodsResponse =
                                await mp.getPaymentMethods(
                                    {
                                        bin,
                                    }
                                );
                            console.log(
                                "Payment methods response:",
                                paymentMethodsResponse
                            );

                            const paymentMethod =
                                paymentMethodsResponse
                                    ?.results?.[0];

                            console.log(
                                "Payment method:",
                                paymentMethod
                            );
                            if (
                                !paymentMethod?.id
                            ) {

                                setPaymentMethodId(
                                    ""
                                );

                                return;
                            }

                            setPaymentMethodId(
                                paymentMethod.id
                            );

                            console.log(
                                "SETTING PAYMENT METHOD:",
                                paymentMethod.id
                            );

                        } catch (
                            error
                        ) {

                            console.error(
                                "Error obteniendo información de Mercado Pago:",
                                error
                            );

                            setPaymentMethodId(
                                ""
                            );
                        }
                    }
                );

                // ====================================================
                // READY
                // ====================================================

                if (!cancelled) {
                    setMercadoPagoReady(
                        true
                    );
                }

            } catch (error) {

                console.error(
                    "Error inicializando Mercado Pago:",
                    error
                );

                if (!cancelled) {

                    setErrors((prev) => ({
                        ...prev,
                        payment:
                            "No se pudo inicializar el pago.",
                    }));
                }
            }
        };

    useEffect(() => {
        initializeMercadoPago();
    }, [])


    const [errors, setErrors] =
        useState<
            Record<string, string>
        >({});


    const validate = (): boolean => {
        const newErrors:
            Record<string, string> = {};

        if (!dni.trim()) {

            newErrors.dni =
                "Ingresá tu DNI.";
        }

        if (
            !mercadoPagoReady
        ) {

            newErrors.payment =
                "El formulario de pago todavía no está listo.";
        }

        if (
            !paymentMethodId
        ) {
            newErrors.payment =
                "Ingresá un número de tarjeta válido.";
        }

        setErrors(
            newErrors
        );

        return (
            Object.keys(
                newErrors
            ).length === 0
        );
    };


    return (<div className="pg-personal-data-container">
                <h2 className="pg-title-2">
                    Confirmar donación
                </h2>

                <div className="pg-form-column">

                    {/* ======================================
                        DNI 
                    ======================================= */}

                    <PaymentGatewayField
                        required={true}
                        label="DNI"
                        value={
                            dni
                        }
                        setValue={
                            setDni
                        }
                        placeholder="Tu DNI"
                        inputType="text"
                        errors={
                            errors.dni
                        }
                    />

                    {/* ======================================
                        NÚMERO DE TARJETA
                    ======================================= */}


                    <div className="pg-field">

                        <label className="pg-label">
                            Número de tarjeta
                            <span className="pg-required">
                                *
                            </span>
                        </label>

                        <div
                            id="pg-card-number"
                            className={`pg-mp-field ${
                                errors.payment
                                    ? "pg-mp-field-error"
                                    : ""
                            }`}
                        />

                    </div>

                    {/* ======================================
                        VENCIMIENTO / CVV
                    ======================================= */}

                    <div className="pg-row">

                        <div className="pg-field">

                            <label className="pg-label">
                                Fecha de vencimiento
                                <span className="pg-required">
                                    *
                                </span>
                            </label>

                            <div
                                id="pg-expiration-date"
                                className={`pg-mp-field ${
                                    errors.payment
                                        ? "pg-mp-field-error"
                                        : ""
                                }`}
                            />

                        </div>

                        <div className="pg-field">

                            <label className="pg-label">
                                CVV
                                <span className="pg-required">
                                    *
                                </span>
                            </label>

                            <div
                                id="pg-security-code"
                                className={`pg-mp-field ${
                                    errors.payment
                                        ? "pg-mp-field-error"
                                        : ""
                                }`}
                            />

                        </div>

                    </div>

                </div>

                    {errors.payment && (

                        <p className="pg-error">
                            {
                                errors.payment
                            }
                        </p>

                    )}
            </div>
        )
});


export default PaymentGatewayPaymentData;