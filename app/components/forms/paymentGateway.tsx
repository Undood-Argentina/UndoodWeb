"use client";

import React, {
    useEffect,
    useRef,
    useState,
} from "react";

// @ts-ignore: allow CSS side-effect import without module declarations
import "./payment_gateway.css";

import { handlePaymentSubmit } from "./payment_gateway_handle_submit";

import {
    loadMercadoPago,
} from "@mercadopago/sdk-js";

import PaymentGatewayAmountSelection, {
    PaymentGatewayAmountSelectionRef,
} from "./paymentGatewayAmountSelection";

import PaymentGatewayBillingData, {
    PaymentGatewayBillingDataRef,
} from "./paymentGatewayBillingData";


import PaymentGatewayPaymentData, {
    PaymentGatewayPaymentDataRef,
} from "./paymentGatewayPaymentData";

// ============================================================
// TYPES
// ============================================================

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

interface PaymentGatewayProps {
    onSubmit?: (data: DonationData) => void;

    onStepChange?: (step: number) => void;
}


// ============================================================
// PAYMENT GATEWAY
// ============================================================

export default function PaymentGateway({
    onSubmit = () => {},
    onStepChange = () => {},
}: PaymentGatewayProps) {

    const amountSelectionRef =
        useRef<PaymentGatewayAmountSelectionRef>(null);

    const billingDataRef =
        useRef<PaymentGatewayBillingDataRef>(null);

    const paymentDataRef =
        useRef<PaymentGatewayPaymentDataRef>(null);


    // ========================================================
    // STEP
    // ========================================================

    const [currentStep, setCurrentStep] =
        useState<number>(1);

    // ========================================================
    // DONATION
    // ========================================================

    const [reports, setReports] =
        useState<boolean>(false);

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


    const [selectedAmount, setSelectedAmount] = useState<number>(0)


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

    const handleNextFromStep1 = (): void => {
        const valid = amountSelectionRef.current?.validate();

        if (!valid) {
            return;
        }

        goToStep(2);
    };

    const handleNextFromStep2 = (): void => {
        const valid = billingDataRef.current?.validate();

        if (!valid) {
            return;
        }

        goToStep(3);
    };

    // ========================================================
    // SUBMIT
    // ========================================================

    const [ready, setReady] = useState<boolean>(false);

    const [paymentMethodId, setPaymentMethodId] =
        useState<string>("");

    const [processingPayment, setProcessingPayment] = useState<boolean>(false);

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {

        await handlePaymentSubmit({
            event,
            processingPayment,
            setProcessingPayment,
            paymentDataRef,
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
        });
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
                        <PaymentGatewayAmountSelection
                        ref={amountSelectionRef}
                        amount_option_1={5000}
                        amount_option_2={10000}
                        amount_option_3={15000}
                        onAmountSelected={(amount: number)=>{setSelectedAmount(amount)}}/>

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
                        <PaymentGatewayBillingData
                            ref={billingDataRef}
                            onFirstNameChanged={setFirstName}
                            onLastNameChanged={setLastName}
                            onEmailChanged={setEmail}
                            onPostalCodeChanged={setPostalCode}
                        />

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
                    <div className="pg-section-2">
                        <div className="pg-donate-total">
                            <PaymentGatewayPaymentData 
                                ref={paymentDataRef} 
                                onReady={setReady}
                                onPaymentMethodIdChanged={setPaymentMethodId}
                                onDniChanged={setDni}
                            />

                            <div className="pg-total">
                                $
                                {Number(
                                    selectedAmount ||
                                    0
                                ).toLocaleString(
                                    "es-AR"
                                )}

                            </div>

                            <form
                            onSubmit={
                                handleSubmit
                            }>
                                <button
                                    type="submit"
                                    className="pg-primary-button"
                                    disabled={
                                        !ready ||
                                        processingPayment
                                    }
                                >
                                    {processingPayment
                                        ? "Procesando..."
                                        : "Donar"}
                                </button>
                            </form>
                        </div>
                    </div>
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