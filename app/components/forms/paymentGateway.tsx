"use client";

import React, {
    useEffect,
    useRef,
    useState,
} from "react";

// @ts-ignore: allow CSS side-effect import without module declarations
import "./payment_gateway.css";

import {
    loadMercadoPago,
} from "@mercadopago/sdk-js";

// ============================================================
// TYPES
// ============================================================

interface PersonalData {
    firstName: string;
    lastName: string;
    email: string;
}

interface PaymentData {
    dni: string;
    postalCode: string;

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

interface PaymentGatewayProps {
    initialDonationAmount?: number | null;
    lockedDonationAmount?: boolean;
    initialReports?: boolean;

    // Se mantiene por compatibilidad con el componente anterior.
    onSubmit?: (data: DonationData) => void;

    onStepChange?: (step: number) => void;
}

interface InputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    type?: string;
    maxLength?: number;
}

type DonationOption =
    | 5000
    | 10000
    | 15000
    | "custom";

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

// ============================================================
// INPUT COMPONENT
// ============================================================

const Input = ({
    label,
    value,
    onChange,
    placeholder,
    error,
    type = "text",
    maxLength,
}: InputProps): React.ReactElement => {
    return (
        <div className="pg-field">
            <label className="pg-label">
                {label}
                <span className="pg-required">
                    *
                </span>
            </label>

            <input
                className={`pg-input ${
                    error
                        ? "pg-input-error"
                        : ""
                }`}
                type={type}
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value
                    )
                }
                placeholder={placeholder}
                maxLength={maxLength}
            />

            {error && (
                <span className="pg-error">
                    {error}
                </span>
            )}
        </div>
    );
};

// ============================================================
// PAYMENT GATEWAY
// ============================================================

export default function PaymentGateway({
    initialDonationAmount = null,
    lockedDonationAmount = false,
    initialReports = false,
    onSubmit = () => {},
    onStepChange = () => {},
}: PaymentGatewayProps) {

    // ========================================================
    // STEP
    // ========================================================

    const [currentStep, setCurrentStep] =
        useState<number>(1);

    // ========================================================
    // DONATION
    // ========================================================

    const [donationAmount, setDonationAmount] =
        useState<
            number |
            DonationOption |
            null
        >(
            initialDonationAmount !== null &&
            ![5000, 10000, 15000].includes(
                initialDonationAmount
            )
                ? "custom"
                : initialDonationAmount
        );

    const [customAmount, setCustomAmount] =
        useState<string>(
            initialDonationAmount !== null &&
            ![5000, 10000, 15000].includes(
                initialDonationAmount
            )
                ? String(initialDonationAmount)
                : ""
        );

    const [reports, setReports] =
        useState<boolean>(
            initialReports
        );

    // ========================================================
    // PERSONAL DATA
    // ========================================================

    const [firstName, setFirstName] =
        useState<string>("");

    const [lastName, setLastName] =
        useState<string>("");

    const [email, setEmail] =
        useState<string>("");

    // ========================================================
    // NON-CARD PAYMENT DATA
    // ========================================================

    const [dni, setDni] =
        useState<string>("");

    const [postalCode, setPostalCode] =
        useState<string>("");

    /*
     * IMPORTANTE:
     *
     * NO existen estados:
     *
     * cardNumber
     * expirationDate
     * cvv
     *
     * Los maneja Mercado Pago dentro de sus
     * campos seguros.
     */

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

    // ========================================================
    // MERCADO PAGO STATE
    // ========================================================

    const [paymentMethodId, setPaymentMethodId] =
        useState<string>("");

    const [installments, setInstallments] =
        useState<number>(0);

    const [installmentOptions, setInstallmentOptions] =
        useState<
            {
                value: number;
                label: string;
            }[]
        >([]);

    const [mercadoPagoReady, setMercadoPagoReady] =
        useState<boolean>(false);

    const [processingPayment, setProcessingPayment] =
        useState<boolean>(false);

    // ========================================================
    // ERRORS
    // ========================================================

    const [errors, setErrors] =
        useState<
            Record<string, string>
        >({});

    // ========================================================
    // DONATION HELPERS
    // ========================================================

    const isCustomAmount =
        donationAmount === "custom";

    const selectedAmount: number =
        donationAmount === "custom"
            ? Number(customAmount)
            : typeof donationAmount === "number"
              ? donationAmount
              : 0;

    const selectDonationAmount = (
        amount:
            | 5000
            | 10000
            | 15000
    ): void => {

        if (lockedDonationAmount) {
            return;
        }

        setDonationAmount(amount);

        setErrors((prev) => ({
            ...prev,
            donationAmount: "",
        }));
    };

    const selectCustomAmount = (): void => {

        if (lockedDonationAmount) {
            return;
        }

        setDonationAmount("custom");

        setErrors((prev) => ({
            ...prev,
            donationAmount: "",
        }));
    };

    const handleCustomAmountChange = (
        value: string
    ): void => {

        if (lockedDonationAmount) {
            return;
        }

        const numericValue =
            value.replace(/\D/g, "");

        setCustomAmount(
            numericValue
        );

        setErrors((prev) => ({
            ...prev,
            donationAmount: "",
        }));
    };

    // ========================================================
    // MERCADO PAGO INITIALIZATION
    // ========================================================

    useEffect(() => {

        if (currentStep !== 3) {
            return;
        }

        let cancelled = false;

        const initializeMercadoPago =
            async (): Promise<void> => {

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

                    const cardNumberField =
                        mp.fields.create(
                            "cardNumber",
                            {
                                placeholder:
                                    "0000 0000 0000 0000",
                            }
                        );

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
                            }
                        );

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
                            }
                        );

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

                            const bin =
                                data.bin;

                            if (!bin) {

                                setPaymentMethodId(
                                    ""
                                );

                                setInstallmentOptions(
                                    []
                                );

                                setInstallments(
                                    0
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

                                const paymentMethod =
                                    paymentMethodsResponse
                                        ?.results?.[0];

                                if (
                                    !paymentMethod?.id
                                ) {

                                    setPaymentMethodId(
                                        ""
                                    );

                                    setInstallmentOptions(
                                        []
                                    );

                                    setInstallments(
                                        0
                                    );

                                    return;
                                }

                                setPaymentMethodId(
                                    paymentMethod.id
                                );

                                // ----------------------------------------
                                // INSTALLMENTS
                                // ----------------------------------------

                                const installmentsResponse =
                                    await mp.getInstallments(
                                        {
                                            amount:
                                                String(
                                                    selectedAmount
                                                ),
                                            bin,
                                            paymentTypeId:
                                                "credit_card",
                                        }
                                    );

                                const payerCosts =
                                    installmentsResponse
                                        ?.[
                                            0
                                        ]
                                        ?.payer_costs ??
                                    [];

                                const options =
                                    payerCosts.map(
                                        (
                                            cost: any
                                        ) => ({
                                            value:
                                                Number(
                                                    cost.installments
                                                ),
                                            label:
                                                cost.recommended_message ??
                                                `${cost.installments} cuotas`,
                                        })
                                    );

                                setInstallmentOptions(
                                    options
                                );

                                if (
                                    options.length > 0
                                ) {

                                    setInstallments(
                                        options[0]
                                            .value
                                    );

                                } else {

                                    setInstallments(
                                        0
                                    );
                                }

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

                                setInstallmentOptions(
                                    []
                                );

                                setInstallments(
                                    0
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

        initializeMercadoPago();

        // ========================================================
        // CLEANUP
        // ========================================================

        return () => {

            cancelled = true;

            try {
                cardNumberFieldRef.current
                    ?.unmount?.();
            } catch {}

            try {
                expirationDateFieldRef.current
                    ?.unmount?.();
            } catch {}

            try {
                securityCodeFieldRef.current
                    ?.unmount?.();
            } catch {}

            cardNumberFieldRef.current =
                null;

            expirationDateFieldRef.current =
                null;

            securityCodeFieldRef.current =
                null;

            mercadoPagoRef.current =
                null;

            setMercadoPagoReady(
                false
            );

            setPaymentMethodId(
                ""
            );

            setInstallmentOptions(
                []
            );

            setInstallments(
                0
            );
        };

        /*
         * IMPORTANTE:
         *
         * Este effect solamente depende de currentStep.
         *
         * No depende de:
         * - dni
         * - firstName
         * - lastName
         * - email
         * - paymentMethodId
         * - installments
         *
         * Por lo tanto, los renders producidos por
         * setState NO vuelven a crear los iframes
         * de Mercado Pago.
         *
         * Esto evita el problema de perder el foco
         * al escribir.
         */

    }, [currentStep]);

    // ========================================================
    // VALIDATION
    // ========================================================

    const validateStep1 = (): boolean => {

        const newErrors:
            Record<string, string> = {};

        if (
            donationAmount === null
        ) {

            newErrors.donationAmount =
                "Seleccioná un monto.";
        }

        if (
            donationAmount ===
            "custom"
        ) {

            const amount =
                Number(customAmount);

            if (
                !customAmount ||
                Number.isNaN(amount) ||
                amount <= 0
            ) {

                newErrors.donationAmount =
                    "Ingresá un monto válido.";
            }
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

    const validateStep2 = (): boolean => {

        const newErrors:
            Record<string, string> = {};

        if (
            !firstName.trim()
        ) {

            newErrors.firstName =
                "Ingresá tu nombre.";
        }

        if (
            !lastName.trim()
        ) {

            newErrors.lastName =
                "Ingresá tu apellido.";
        }

        if (
            !email.trim()
        ) {

            newErrors.email =
                "Ingresá tu correo electrónico.";

        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                email
            )
        ) {

            newErrors.email =
                "Ingresá un correo electrónico válido.";
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

    const validateStep3 =
        (): boolean => {

            const newErrors:
                Record<string, string> = {};

            if (!dni.trim()) {

                newErrors.dni =
                    "Ingresá tu DNI.";
            }

            if (
                !postalCode.trim()
            ) {

                newErrors.postalCode =
                    "Ingresá tu código postal.";
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

    // ========================================================
    // NAVIGATION
    // ========================================================

    const goToStep = (
        step: number
    ): void => {

        setCurrentStep(
            step
        );

        setErrors({});

        onStepChange(
            step
        );
    };

    const handleNextFromStep1 =
        (): void => {

            if (
                !validateStep1()
            ) {
                return;
            }

            goToStep(2);
        };

    const handleNextFromStep2 =
        (): void => {

            if (
                !validateStep2()
            ) {
                return;
            }

            goToStep(3);
        };

    // ========================================================
    // SUBMIT
    // ========================================================

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {

        event.preventDefault();

        if (
            processingPayment
        ) {
            return;
        }

        if (
            !validateStep3()
        ) {
            return;
        }

        const mp =
            mercadoPagoRef.current;

        if (
            !mp
        ) {

            setErrors((prev) => ({
                ...prev,
                payment:
                    "El formulario de pago no está disponible.",
            }));

            return;
        }

        try {

            setProcessingPayment(
                true
            );

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

            /*
             * Mercado Pago genera el token desde sus
             * campos seguros.
             *
             * En ningún momento obtenemos:
             *
             * - número de tarjeta
             * - fecha de vencimiento
             * - CVV
             */

            const cardToken =
                await mp.fields.createCardToken({
                    cardholderName,

                    identificationType:
                        "DNI",

                    identificationNumber:
                        dni.trim(),
                });

            if (
                !cardToken?.id
            ) {

                setErrors((prev) => ({
                    ...prev,
                    payment:
                        "No se pudo validar la tarjeta.",
                }));

                setProcessingPayment(
                    false
                );

                return;
            }

            // ====================================================
            // AMOUNT
            // ====================================================

            const amount =
                String(
                    selectedAmount
                );

            // ====================================================
            // BODY
            // ====================================================

            /*
             * Esto conserva la misma estructura
             * que tenía tu onSubmit anterior.
             */

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
                            JSON.stringify(
                                body
                            ),
                    }
                );

            // ====================================================
            // ERROR
            // ====================================================

            if (
                !response.ok
            ) {

                const errorText =
                    await response.text();

                console.error(
                    errorText
                );

                setErrors((prev) => ({
                    ...prev,
                    payment:
                        "No se pudo procesar el pago.",
                }));

                setProcessingPayment(
                    false
                );

                return;
            }

            // ====================================================
            // SUCCESS
            // ====================================================

            const data =
                await response.json();

            console.log(
                data
            );

            /*
             * Se mantiene el callback existente por
             * compatibilidad con el componente padre.
             *
             * IMPORTANTE:
             *
             * El callback recibe el token de Mercado Pago,
             * nunca los datos reales de la tarjeta.
             */

            const paymentData:
                DonationData = {

                donationAmount:
                    selectedAmount,

                reports,

                personalData: {
                    firstName,
                    lastName,
                    email,
                },

                paymentData: {

                    dni,

                    postalCode,

                    cardToken:
                        cardToken.id,

                    paymentMethodId,

                    installments,
                },
            };

            onSubmit(
                paymentData
            );

            setProcessingPayment(
                false
            );

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

            setProcessingPayment(
                false
            );
        }
    };

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="pg-container">

            <div className="pg-card">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="pg-header">

                    <div
                        className={`pg-step ${
                            currentStep === 1
                                ? "pg-step-active"
                                : ""
                        }`}
                    >
                        1. Donación
                    </div>

                    <div className="pg-step-line" />

                    <div
                        className={`pg-step ${
                            currentStep === 2
                                ? "pg-step-active"
                                : ""
                        }`}
                    >
                        2. Tus datos
                    </div>

                    <div className="pg-step-line" />

                    <div
                        className={`pg-step ${
                            currentStep === 3
                                ? "pg-step-active"
                                : ""
                        }`}
                    >
                        3. Pago
                    </div>

                </div>

                {/* ==================================================
                    STEP 1 - DONACIÓN
                ================================================== */}

                {currentStep === 1 && (

                    <div className="pg-section">

                        <div className="pg-donation-amount-info-container">

                            <h2 className="pg-title">
                                ¿Cuánto querés donar?
                            </h2>

                            <div className="pg-amount-grid">

                                <button
                                    type="button"
                                    disabled={
                                        lockedDonationAmount
                                    }
                                    className={`pg-amount-option ${
                                        donationAmount === 5000
                                            ? "pg-amount-selected"
                                            : ""
                                    } ${
                                        lockedDonationAmount &&
                                        donationAmount !== 5000
                                            ? "pg-disabled"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        selectDonationAmount(
                                            5000
                                        )
                                    }
                                >
                                    $5.000
                                </button>

                                <button
                                    type="button"
                                    disabled={
                                        lockedDonationAmount
                                    }
                                    className={`pg-amount-option ${
                                        donationAmount === 10000
                                            ? "pg-amount-selected"
                                            : ""
                                    } ${
                                        lockedDonationAmount &&
                                        donationAmount !== 10000
                                            ? "pg-disabled"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        selectDonationAmount(
                                            10000
                                        )
                                    }
                                >
                                    $10.000
                                </button>

                                <button
                                    type="button"
                                    disabled={
                                        lockedDonationAmount
                                    }
                                    className={`pg-amount-option ${
                                        donationAmount === 15000
                                            ? "pg-amount-selected"
                                            : ""
                                    } ${
                                        lockedDonationAmount &&
                                        donationAmount !== 15000
                                            ? "pg-disabled"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        selectDonationAmount(
                                            15000
                                        )
                                    }
                                >
                                    $15.000
                                </button>

                                <button
                                    type="button"
                                    disabled={
                                        lockedDonationAmount
                                    }
                                    className={`pg-amount-option ${
                                        donationAmount === "custom"
                                            ? "pg-amount-selected"
                                            : ""
                                    } ${
                                        lockedDonationAmount &&
                                        donationAmount !== "custom"
                                            ? "pg-disabled"
                                            : ""
                                    }`}
                                    onClick={
                                        selectCustomAmount
                                    }
                                >
                                    Otro monto
                                </button>

                            </div>

                            {isCustomAmount && (

                                <div className="pg-custom-amount">

                                    <label className="pg-label">
                                        Monto
                                    </label>

                                    <div className="pg-money-input">

                                        <span>
                                            $
                                        </span>

                                        <input
                                            type="text"
                                            value={
                                                customAmount
                                            }
                                            disabled={
                                                lockedDonationAmount
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                handleCustomAmountChange(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Ingresá el monto"
                                        />

                                    </div>

                                    {errors.donationAmount && (

                                        <span className="pg-error">
                                            {
                                                errors.donationAmount
                                            }
                                        </span>

                                    )}

                                </div>

                            )}

                        </div>

                        <div className="pg-next-step-container">

                            <label className="pg-checkbox-wrapper">

                                <input
                                    type="checkbox"
                                    checked={
                                        reports
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setReports(
                                            event.target.checked
                                        )
                                    }
                                />

                                <span>
                                    Quiero recibir reportes sobre el uso
                                    de mi donación
                                </span>

                            </label>

                            {errors.donationAmount &&
                                !isCustomAmount && (

                                    <span className="pg-error pg-general-error">
                                        {
                                            errors.donationAmount
                                        }
                                    </span>

                                )}

                            <button
                                type="button"
                                className="pg-primary-button"
                                onClick={
                                    handleNextFromStep1
                                }
                            >
                                Siguiente
                            </button>

                        </div>

                    </div>
                )}

                {/* ==================================================
                    STEP 2 - TUS DATOS
                ================================================== */}

                {currentStep === 2 && (

                    <div className="pg-section-2">

                        <h2 className="pg-title">
                            Tus datos
                        </h2>

                        <div className="pg-form-column">

                            <div className="pg-row">

                                <div className="pg-field">

                                    <label className="pg-label">
                                        Nombre
                                        <span className="pg-required">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        className={`pg-input ${
                                            errors.firstName
                                                ? "pg-input-error"
                                                : ""
                                        }`}
                                        type="text"
                                        value={
                                            firstName
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setFirstName(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Tu nombre"
                                    />

                                    {errors.firstName && (

                                        <span className="pg-error">
                                            {
                                                errors.firstName
                                            }
                                        </span>

                                    )}

                                </div>

                                <div className="pg-field">

                                    <label className="pg-label">
                                        Apellido
                                        <span className="pg-required">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        className={`pg-input ${
                                            errors.lastName
                                                ? "pg-input-error"
                                                : ""
                                        }`}
                                        type="text"
                                        value={
                                            lastName
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setLastName(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Tu apellido"
                                    />

                                    {errors.lastName && (

                                        <span className="pg-error">
                                            {
                                                errors.lastName
                                            }
                                        </span>

                                    )}

                                </div>

                            </div>

                            <div className="pg-field">

                                <label className="pg-label">
                                    Correo electrónico
                                    <span className="pg-required">
                                        *
                                    </span>
                                </label>

                                <input
                                    className={`pg-input ${
                                        errors.email
                                            ? "pg-input-error"
                                            : ""
                                    }`}
                                    type="email"
                                    value={
                                        email
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setEmail(
                                            event.target.value
                                        )
                                    }
                                    placeholder="tu@email.com"
                                />

                                {errors.email && (

                                    <span className="pg-error">
                                        {
                                            errors.email
                                        }
                                    </span>

                                )}

                            </div>

                        </div>

                        <button
                            type="button"
                            className="pg-primary-button"
                            onClick={
                                handleNextFromStep2
                            }
                        >
                            Siguiente
                        </button>

                    </div>
                )}

                {/* ==================================================
                    STEP 3 - CONFIRMAR DONACIÓN
                ================================================== */}

                {currentStep === 3 && (

                    <form
                        className="pg-section-2"
                        onSubmit={
                            handleSubmit
                        }
                    >

                        <h2 className="pg-title">
                            Confirmar donación
                        </h2>

                        <div className="pg-form-column">

                            {/* ======================================
                                DNI / CÓDIGO POSTAL
                            ======================================= */}

                            <div className="pg-row">

                                <Input
                                    label="DNI"
                                    value={
                                        dni
                                    }
                                    onChange={
                                        setDni
                                    }
                                    placeholder="Tu DNI"
                                    error={
                                        errors.dni
                                    }
                                />

                                <Input
                                    label="Código postal"
                                    value={
                                        postalCode
                                    }
                                    onChange={
                                        setPostalCode
                                    }
                                    placeholder="Código postal"
                                    error={
                                        errors.postalCode
                                    }
                                />

                            </div>

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

                            {errors.payment && (

                                <span className="pg-error">
                                    {
                                        errors.payment
                                    }
                                </span>

                            )}

                        </div>

                        <div className="pg-donate-total">

                            <div className="pg-total">

                                $
                                {Number(
                                    selectedAmount ||
                                    0
                                ).toLocaleString(
                                    "es-AR"
                                )}

                            </div>

                            <button
                                type="submit"
                                className="pg-primary-button"
                                disabled={
                                    !mercadoPagoReady ||
                                    processingPayment
                                }
                            >
                                {processingPayment
                                    ? "Procesando..."
                                    : "Donar"}
                            </button>

                        </div>

                    </form>
                )}

                {/* ==================================================
                    SECURITY FOOTER
                ================================================== */}

                <div className="pg-footer">

                    <div className="pg-security-item">

                        <span className="pg-security-icon">
                        </span>

                        <span>
                            Pago seguro SSL/TLS
                        </span>

                    </div>

                    <div className="pg-footer-separator" />

                    <div className="pg-security-item">

                        <span className="pg-security-icon">
                        </span>

                        <span>
                            Datos protegidos
                        </span>

                    </div>

                </div>

            </div>

        </div>
    );
}