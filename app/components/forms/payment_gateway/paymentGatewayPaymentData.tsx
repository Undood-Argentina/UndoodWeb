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
        onPaymentMethodTypeChanged: (paymentMethodType: string) => void;
        onDniChanged: (dni: string) => void;
        onCardholderNameChanged: (cardholderName: string) => void;
        disabled: boolean;
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

    const [cardholderName, setCardholderName] = useState<string>("");
    useEffect(() => {
        props.onCardholderNameChanged(cardholderName);
        if ("cardholderName" in errors) {
            const newErrors = { ...errors };
            delete newErrors.cardholderName;
            setErrors(newErrors);
        }

    }, [cardholderName])

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

    const [cardNumberValid, setCardNumberValid] = useState<boolean>(false);

    const expirationDateFieldRef =
        useRef<MercadoPagoField | null>(
            null
        );

    const [expirationDateValid, setExpirationDateValid] = useState<boolean>(false);

    const securityCodeFieldRef =
        useRef<MercadoPagoField | null>(
            null
        );

    const [securityCodeValid, setSecurityCodeValid] = useState<boolean>(false);

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

    const [paymentMethodType, setPaymentMethodType] =
        useState<string>("");
    
    useEffect(() => {
        props.onPaymentMethodIdChanged(paymentMethodId)
    }, [paymentMethodId])

    useEffect(() => {
        props.onPaymentMethodTypeChanged(paymentMethodType)
    }, [paymentMethodType])

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

                const cardNumberField = mp.fields.create("cardNumber", {
                    placeholder: "0000 0000 0000 0000",
                    style: {
                        color: "#121212",
                        fontFamily: "Raleway",
                        fontSize: "16px",
                        fontStyle: "normal",
                        fontWeight: "500",
                    },
                    customFonts: [
                        {
                            src: "https://fonts.googleapis.com/css2?family=Raleway:wght@500",
                        },
                    ],
                } as any);

                cardNumberField.on("change", () => {
                    setErrors((prev) => {
                        if (!("cardNumber" in prev)) {
                            return prev;
                        }

                        const newErrors = { ...prev };
                        delete newErrors.cardNumber;
                        return newErrors;
                    });
                });

                cardNumberField.on('focus', () => {
                    document.getElementById('pg-card-number')!.classList.add('is-focused');
                });

                cardNumberField.on('blur', () => {
                    document.getElementById('pg-card-number')!.classList.remove('is-focused');
                });

                cardNumberField.on("validityChange", (event) => {
                    const isValid = event.errorMessages.length === 0;
                    setCardNumberValid(isValid);
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
                                color: "#121212",
                                fontFamily: "Raleway",
                                fontSize: "16px",
                                fontStyle: "normal",
                                fontWeight: "500"
                            },
                            customFonts: [
                                {
                                    src: "https://fonts.googleapis.com/css2?family=Raleway:wght@500",
                                },
                            ],
                        } as any);


                expirationDateField.on("change", () => {
                    setErrors((prev) => {
                        if (!("expirationDate" in prev)) {
                            return prev;
                        }

                        const newErrors = { ...prev };
                        delete newErrors.expirationDate;
                        return newErrors;
                    });
                });


                expirationDateField.on('focus', () => {
                    document.getElementById('pg-expiration-date')!.classList.add('is-focused');
                });

                expirationDateField.on('blur', () => {
                    document.getElementById('pg-expiration-date')!.classList.remove('is-focused');
                });

                expirationDateField.on("validityChange", (event) => {
                    const isValid = event.errorMessages.length === 0;
                    setExpirationDateValid(isValid);
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
                                color: "#121212",
                                fontFamily: "Raleway",
                                fontSize: "16px",
                                fontStyle: "normal",
                                fontWeight: "500",
                            },
                            customFonts: [
                                {
                                    src: "https://fonts.googleapis.com/css2?family=Raleway:wght@500",
                                },
                            ],
                        } as any);


                securityCodeField.on("change", () => {
                    setErrors((prev) => {
                        if (!("securityCode" in prev)) {
                            return prev;
                        }

                        const newErrors = { ...prev };
                        delete newErrors.securityCode;
                        return newErrors;
                    });
                });

                securityCodeField.on('focus', () => {
                    document.getElementById('pg-security-code')!.classList.add('is-focused');
                });

                securityCodeField.on('blur', () => {
                    document.getElementById('pg-security-code')!.classList.remove('is-focused');
                });

                securityCodeField.on("validityChange", (event) => {
                    const isValid = event.errorMessages.length === 0;
                    setSecurityCodeValid(isValid);
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

                            setPaymentMethodType(
                                ""
                            )

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

                            if (
                                !paymentMethod?.payment_type_id
                            ) {

                                setPaymentMethodType(
                                    ""
                                );

                                return;
                            }

                            setPaymentMethodType(
                                paymentMethod.payment_type_id
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

        if (!cardNumberValid) {
            newErrors.cardNumber =
                "Numero de tarjeta invalido"
        }

        if (!expirationDateValid) {
            newErrors.expirationDate =
                "Fecha de vencimiento invalida"
        }

        if (!securityCodeValid) {
            newErrors.securityCode =
                "Fecha de vencimiento invalida"
        }

        if (!cardholderName) {
            newErrors.cardholderName =
                "Ingresa el titular de la tarjeta";
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
                <div className="pg-section-header">
                    <div className="pg-payment-section-title-container">
                        <h2 className="pg-title-2">
                            Pago
                        </h2>
                        <div className="pg-credit-card-icons">
                            <VisaIcon/><MastercardIcon/><AmericanExpressIcon/>
                        </div>
                    </div>
                    <p className="pg-section-description">
                        Tarjeta de Crédito/Débito
                    </p>
                </div>

                <div className="pg-form-column">

                    {/* ======================================
                        DNI 
                    ======================================= */}

                    <PaymentGatewayField
                        disabled={props.disabled}
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
                                errors.cardNumber ? "pg-mp-field-error" : ""
                            } ${props.disabled ? "disabled" : ""}`}
                        />

                        {errors.cardNumber && (

                            <p className="pg-error">
                                {
                                    errors.cardNumber
                                }
                            </p>
                        )}

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
                                    errors.expirationDate
                                        ? "pg-mp-field-error"
                                        : ""
                                } ${props.disabled ? "disabled" : ""}`}
                            />
                            {errors.expirationDate && (

                                <p className="pg-error">
                                    {
                                        errors.expirationDate
                                    }
                                </p>

                            )}

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
                                    errors.securityCode
                                        ? "pg-mp-field-error"
                                        : ""
                                } ${props.disabled ? "disabled" : ""}`}
                            />
                            {errors.securityCode && (

                                <p className="pg-error">
                                    {
                                        errors.securityCode
                                    }
                                </p>

                            )}


                        </div>

                    </div>

                    <PaymentGatewayField
                        disabled={props.disabled}
                        required={true}
                        label="Titular de la tarjeta"
                        value={
                            cardholderName
                        }
                        setValue={
                            setCardholderName
                        }
                        placeholder="Titular de la tarjeta"
                        inputType="text"
                        errors={
                            errors.cardholderName
                        }
                    />

                </div>
            </div>
        )
});


function VisaIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="11" viewBox="0 0 32 11" fill="none">
            <g clipPath="url(#clip0_784_1781)">
                <path d="M16.5496 3.5025C16.5314 5.02872 17.8325 5.88035 18.8126 6.38675C19.8196 6.90627 20.1579 7.23945 20.1539 7.7041C20.1464 8.41513 19.3506 8.72896 18.606 8.74115C17.3069 8.76249 16.5515 8.36927 15.951 8.07187L15.483 10.3937C16.0855 10.688 17.2011 10.9447 18.358 10.956C21.0736 10.956 22.8503 9.53474 22.8599 7.33116C22.8705 4.53451 19.2114 4.37972 19.2364 3.12969C19.245 2.75066 19.5861 2.34617 20.3336 2.24333C20.7036 2.19138 21.725 2.15162 22.883 2.71699L23.3375 0.470609C22.7148 0.230199 21.9144 -6.67572e-06 20.9179 -6.67572e-06C18.3619 -6.67572e-06 16.5641 1.4406 16.5496 3.5025ZM27.7048 0.193487C27.2089 0.193487 26.791 0.500162 26.6045 0.970777L22.7254 10.791H25.439L25.979 9.20872H29.295L29.6082 10.791H32L29.9129 0.193487H27.7048ZM28.0844 3.05627L28.8675 7.03575H26.7227L28.0844 3.05627ZM13.2595 0.19362L11.1205 10.7909H13.7064L15.8444 0.193355L13.2595 0.19362ZM9.43412 0.19362L6.74263 7.40657L5.65387 1.27348C5.52612 0.588825 5.02163 0.193487 4.46138 0.193487H0.061625L0 0.501223C0.90325 0.709029 1.9295 1.0442 2.55125 1.40282C2.93175 1.6219 3.04025 1.8134 3.16525 2.33398L5.22738 10.791H7.96L12.1495 0.193487L9.43412 0.19362Z" fill="url(#paint0_linear_784_1781)"/>
            </g>
            <defs>
                <linearGradient id="paint0_linear_784_1781" x1="14.7117" y1="11.1758" x2="15.0479" y2="-0.0750935" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#222357"/>
                    <stop offset="1" stopColor="#254AA5"/>
                </linearGradient>
                <clipPath id="clip0_784_1781">
                    <rect width="32" height="11" fill="white"/>
                </clipPath>
            </defs>
        </svg>
    )
}

function MastercardIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M8.74219 6.16406H15.2391V17.8312H8.74219V6.16406Z" fill="#FF5A00"/>
            <path d="M9.17344 12C9.17344 9.62814 10.2891 7.52345 12 6.16407C10.7391 5.17501 9.15469 4.57501 7.42031 4.57501C3.31875 4.5797 0 7.89845 0 12C0 16.1016 3.31875 19.4203 7.42031 19.4203C9.15 19.4203 10.7391 18.8203 12 17.8313C10.2891 16.4953 9.17344 14.3719 9.17344 12Z" fill="#EB001B"/>
            <path d="M24 12C24 16.1016 20.6813 19.4203 16.5797 19.4203C14.85 19.4203 13.2609 18.8203 12 17.8312C13.7297 16.4672 14.8266 14.3672 14.8266 11.9953C14.8266 9.62344 13.7109 7.51875 12 6.15937C13.2562 5.17031 14.8453 4.57031 16.575 4.57031C20.6813 4.57969 24 7.91719 24 12Z" fill="#F79E1B"/>
        </svg>
    )
}

function AmericanExpressIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <g clipPath="url(#clip0_784_1778)">
                <path d="M18 18H0V0H18V9V18Z" fill="white"/>
                <path d="M18 18V15.1488H15.8273L14.7094 13.9113L13.5844 15.1488H6.42656V9.38672H4.1168L6.98203 2.90039H9.74531L10.7332 5.12227V2.90039H14.1539L14.748 4.57383L15.3457 2.90039H18V0H0V18H18ZM16.193 14.4281H18L15.6129 11.8934L18 9.39023H16.2246L14.748 11.0039L13.2855 9.39023H11.4785L13.8516 11.9074L11.4785 14.4246H13.2328L14.7164 12.7969L16.193 14.4281ZM16.6184 11.8969L18 13.3699V10.4379L16.6184 11.8969ZM8.56758 13.2609V12.477H11.4117V11.3414H8.56758V10.5574H11.482V9.39023H7.19297V14.4281H11.482V13.2609H8.56758ZM16.6395 8.65898H18V3.62109H15.8836L14.7551 6.75703L13.6301 3.62109H11.4785V8.65898H12.8391V5.13281L14.1328 8.65898H15.3422L16.6359 5.12578V8.65898H16.6395ZM9.93164 8.65898H11.4785L9.25664 3.62109H7.48477L5.25938 8.65898H6.77109L7.18945 7.65H9.50625L9.93164 8.65898ZM9.03516 6.52148H7.66758L8.34961 4.87266L9.03516 6.52148Z" fill="#006FCF"/>
            </g>
            <defs>
                <clipPath id="clip0_784_1778">
                    <rect width="18" height="18" fill="white"/>
                </clipPath>
            </defs>
        </svg>
    )
}


export default PaymentGatewayPaymentData;