
import React, {
    useEffect,
    useRef,
    useState,
} from "react";
import { Icon } from '@iconify/react';

import { handlePaymentSubmit } from "../components/forms/payment_gateway/payment_gateway_handle_submit";

import PaymentGatewayAmountSelection, {
    PaymentGatewayAmountSelectionRef,
} from "../components/forms/payment_gateway/paymentGatewayAmountSelection";

import PaymentGatewayBillingData, {
    PaymentGatewayBillingDataRef,
} from "../components/forms/payment_gateway/paymentGatewayBillingData";


import PaymentGatewayPaymentData, {
    PaymentGatewayPaymentDataRef,
} from "../components/forms/payment_gateway/paymentGatewayPaymentData";


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
}


// ============================================================
// PAYMENT GATEWAY
// ============================================================

export default function CampaniaHigienePaymentGateway({
    onSubmit = () => {},
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

    useEffect(()=>{
        setKits(Math.floor(selectedAmount/5000))
    }, [selectedAmount])

    const [kits, setKits] = useState<number>(0)



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
    };

    const handleNextFromStep1 = (): void => {
        const valid = amountSelectionRef.current?.validate();

        if (!valid) {
            return;
        }

        goToStep(2);
    };
    
    const handlePreviousFromStep2 = (): void => {
        goToStep(1);
    }

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
        });
    };
    // ========================================================
    // RENDER
    // ========================================================

    return (
            <div className="pg-card">

                {/* ==================================================
                    STEP 1 - DONACIÓN
                ================================================== */}

                {/* {currentStep === 1 && ( */}
                <div className={`pg-step-pane ${currentStep === 1 ? "active" : "exit-left"}`}>
                    <div className="pg-section">
                        <div className="pg-higiene-donation-amount-selection">
                            <PaymentGatewayAmountSelection
                            ref={amountSelectionRef}
                            amount_option_1={6000}
                            amount_option_2={10000}
                            amount_option_3={15000}
                            onAmountSelected={(amount: number)=>{setSelectedAmount(amount)}}/>
                            <div className="pg-higiene-kits-notice">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#11527B" strokeWidth="1.5" strokeLinecap="round"/>
                                    <path d="M8 9.05001V8.95001M16 9.05001V8.95001" stroke="#11527B" strokeWidth="1.5" strokeLinecap="round"/>
                                    <path d="M16 14C15.5 15.5 14.21 17 12 17C9.79 17 8.5 15.5 8 14" stroke="#11527B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <p>Equivale a {kits} packs de toallas descartables</p>
                            </div>
                        </div>
                        <div className="pg-next-step-container">
                            <div className="pg-donation-amount">
                                <label>Tu donación:</label><p>                                
                                    $
                                    {Number(
                                        selectedAmount ||
                                        0
                                    ).toLocaleString(
                                        "es-AR"
                                    )}</p>
                            </div>

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
                </div>
                {/* )} */}

                {/* ==================================================
                    STEP 2 - DATOS Y CONFIRMACION
                ================================================== */}

                {/* {currentStep === 2 && ( */}

                <div className={`pg-step-pane ${currentStep === 2 ? "active" : "enter-right"}`}>
                    <div className="pg-section-2">
                        <button className="pg-back-button" onClick={handlePreviousFromStep2}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path fillRule="evenodd" clipRule="evenodd" d="M18 12C18 12.1989 17.921 12.3897 17.7803 12.5304C17.6397 12.671 17.4489 12.75 17.25 12.75L8.5605 12.75L11.781 15.969C11.9218 16.1099 12.0009 16.3009 12.0009 16.5C12.0009 16.6992 11.9218 16.8902 11.781 17.031C11.6402 17.1719 11.4492 17.251 11.25 17.251C11.0508 17.251 10.8598 17.1719 10.719 17.031L6.219 12.531C6.14916 12.4614 6.09374 12.3786 6.05593 12.2875C6.01812 12.1964 5.99866 12.0987 5.99866 12C5.99866 11.9014 6.01812 11.8037 6.05593 11.7126C6.09374 11.6215 6.14916 11.5387 6.219 11.469L10.719 6.96903C10.8598 6.8282 11.0508 6.74908 11.25 6.74908C11.4492 6.74908 11.6402 6.8282 11.781 6.96903C11.9218 7.10986 12.0009 7.30087 12.0009 7.50003C12.0009 7.69919 11.9218 7.8902 11.781 8.03103L8.5605 11.25L17.25 11.25C17.4489 11.25 17.6397 11.329 17.7803 11.4697C17.921 11.6104 18 11.8011 18 12Z" fill="black"/>
                            </svg>
                        </button>
                        <PaymentGatewayPaymentData 
                            ref={paymentDataRef} 
                            onReady={setReady}
                            onPaymentMethodIdChanged={setPaymentMethodId}
                            onDniChanged={setDni}
                        />
                        <PaymentGatewayBillingData
                            ref={billingDataRef}
                            onFirstNameChanged={setFirstName}
                            onLastNameChanged={setLastName}
                            onEmailChanged={setEmail}
                            onPostalCodeChanged={setPostalCode}
                        />

                        <div className="pg-next-step-container">
                            <div className="pg-donation-amount">
                                <label>Tu donación:</label><p>                                
                                    $
                                    {Number(
                                        selectedAmount ||
                                        0
                                    ).toLocaleString(
                                        "es-AR"
                                    )}</p>
                            </div>
                            <div className="pg-submit-container">
                                <form className="pg-submit-form"
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

                                <div className="pg-footer">
                                    <div className="pg-mp-icon" />
                                    <p>Pago seguro con Mercado Pago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* )} */}

            </div>
    );
}