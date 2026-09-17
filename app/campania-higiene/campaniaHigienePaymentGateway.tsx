
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

    const [cardholderName, setCardholderName] =
        useState<string>("");


    const [accepted, setAccepted] =
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

    const handlePreviousFromProcessedPayment = (): void => {
        goToStep(2);
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
        event.preventDefault();

        if (processingPayment) {
            return;
        }

        const valid =
            billingDataRef.current?.validate() &&
            paymentDataRef.current?.validate()

        if (!valid) {
            return;
        }

        const mp =
            paymentDataRef.current?.getMercadoPagoInstance();
        
        if (!mp) {
            setAccepted(false)
            goToStep(3)
            return;
        }
        
        const success = await handlePaymentSubmit({
            setProcessingPayment,
            mp,
            setErrors,
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
        });

        setAccepted(success)
        goToStep(3)
    };
    // ========================================================
    // RENDER
    // ========================================================

    return (
            <div className="pg-card">

                {/* ==================================================
                    STEP 1 - DONACIÓN
                ================================================== */}

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

                {/* ==================================================
                    STEP 2 - DATOS Y CONFIRMACION
                ================================================== */}

                <div className={`pg-step-pane ${currentStep === 2 ? "active" : "enter-right"}`}>
                    <div className="pg-section-2">
                        <div className="pg-section-2-header">
                            <button className="pg-back-button" onClick={handlePreviousFromStep2}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M18 12C18 12.1989 17.921 12.3897 17.7803 12.5304C17.6397 12.671 17.4489 12.75 17.25 12.75L8.5605 12.75L11.781 15.969C11.9218 16.1099 12.0009 16.3009 12.0009 16.5C12.0009 16.6992 11.9218 16.8902 11.781 17.031C11.6402 17.1719 11.4492 17.251 11.25 17.251C11.0508 17.251 10.8598 17.1719 10.719 17.031L6.219 12.531C6.14916 12.4614 6.09374 12.3786 6.05593 12.2875C6.01812 12.1964 5.99866 12.0987 5.99866 12C5.99866 11.9014 6.01812 11.8037 6.05593 11.7126C6.09374 11.6215 6.14916 11.5387 6.219 11.469L10.719 6.96903C10.8598 6.8282 11.0508 6.74908 11.25 6.74908C11.4492 6.74908 11.6402 6.8282 11.781 6.96903C11.9218 7.10986 12.0009 7.30087 12.0009 7.50003C12.0009 7.69919 11.9218 7.8902 11.781 8.03103L8.5605 11.25L17.25 11.25C17.4489 11.25 17.6397 11.329 17.7803 11.4697C17.921 11.6104 18 11.8011 18 12Z" fill="black"/>
                                </svg>
                            </button>
                            <p className="pg-step-indicator">Paso 2/2</p>
                        </div>

                        <PaymentGatewayBillingData
                            ref={billingDataRef}
                            onFirstNameChanged={setFirstName}
                            onLastNameChanged={setLastName}
                            onEmailChanged={setEmail}
                            onPostalCodeChanged={setPostalCode}
                        />
                        <PaymentGatewayPaymentData 
                            ref={paymentDataRef} 
                            onReady={setReady}
                            onPaymentMethodIdChanged={setPaymentMethodId}
                            onDniChanged={setDni}
                            onCardholderNameChanged={setCardholderName}
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
                                            : !ready
                                            ? "Cargando..."
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
                <div className={`pg-step-pane ${currentStep === 3 ? "active" : "enter-right"}`}>
                    { accepted ? (
                    <div className="pg-section-3">
                        <div className="pg-female-container">
                            <svg className="pg-female" xmlns="http://www.w3.org/2000/svg" width="139" height="271" viewBox="0 0 199.828 275.625" fill="none">
                                <path d="M199.828 99.9141C199.828 44.8235 155.005 0 99.9141 0C44.8235 0 0 44.8235 0 99.9141C0 150.727 38.1281 192.805 87.2812 199.03V217.055H66.6094C63.2589 217.055 60.0457 218.386 57.6766 220.755C55.3075 223.124 53.9766 226.337 53.9766 229.688C53.9766 233.038 55.3075 236.251 57.6766 238.62C60.0457 240.989 63.2589 242.32 66.6094 242.32H87.2812V262.992C87.2812 266.343 88.6122 269.556 90.9813 271.925C93.3504 274.294 96.5636 275.625 99.9141 275.625C103.264 275.625 106.478 274.294 108.847 271.925C111.216 269.556 112.547 266.343 112.547 262.992V242.32H133.219C136.569 242.32 139.782 240.989 142.151 238.62C144.521 236.251 145.852 233.038 145.852 229.688C145.852 226.337 144.521 223.124 142.151 220.755C139.782 218.386 136.569 217.055 133.219 217.055H112.547V199.03C161.7 192.805 199.828 150.727 199.828 99.9141ZM25.2656 99.9141C25.2656 58.7541 58.7541 25.2656 99.9141 25.2656C141.074 25.2656 174.562 58.7541 174.562 99.9141C174.562 141.074 141.074 174.562 99.9141 174.562C58.7541 174.562 25.2656 141.074 25.2656 99.9141Z" fill="#FFF9FC"/>
                            </svg>
                        </div>
                        <div className="pg-flower-container">
                            <svg className="pg-flower" xmlns="http://www.w3.org/2000/svg" width="219" height="225" viewBox="-119 -138 344 363" fill="none">
                                <path d="M34.4373 3.83334C21.6495 -20.0097 1.47898 -57.7893 1.47898 -76.7733C1.47898 -104.873 25.3032 -128 53.2707 -128C81.2382 -128 105.062 -104.892 105.062 -76.7733C105.062 -57.7893 84.8918 -20.0097 72.104 3.83334M78.1118 7.29867C92.3687 -15.6968 114.987 -52.0452 131.41 -61.5372C155.799 -75.6057 187.722 -66.528 201.696 -42.3083C215.689 -18.0887 207.591 14.0975 183.221 28.166C166.779 37.658 123.99 39.0705 96.9452 39.918M96.9452 46.8487C123.971 47.6962 166.779 49.1087 183.202 58.6007C207.591 72.6692 215.689 104.855 201.696 129.075C187.703 153.295 155.799 162.372 131.429 148.304C114.987 138.812 92.3687 102.464 78.1118 79.468M72.104 82.9333C84.8918 106.776 105.062 144.556 105.062 163.54C105.062 191.677 81.257 214.767 53.2707 214.767C25.2843 214.767 1.47898 191.677 1.47898 163.54C1.47898 144.556 21.6495 106.776 34.4373 82.9333M28.4295 79.468C14.1726 102.464 -8.44619 138.812 -24.8689 148.304C-49.258 162.372 -81.1805 153.295 -95.1548 129.075C-109.148 104.855 -101.05 72.6692 -76.6793 58.6007C-60.2378 49.1087 -17.4297 47.6962 9.59614 46.8487M9.59614 39.918C-17.4297 39.0705 -60.2378 37.658 -76.6605 28.166C-101.05 14.0975 -109.148 -18.0887 -95.1548 -42.3083C-81.1617 -66.528 -49.258 -75.6057 -24.8877 -61.5372C-8.44618 -52.0452 14.1726 -15.6968 28.4295 7.29867M90.9373 41.5C90.9373 51.4898 86.9689 61.0705 79.905 68.1344C72.8411 75.1982 63.2605 79.1667 53.2707 79.1667C43.2808 79.1667 33.7002 75.1982 26.6363 68.1344C19.5724 61.0705 15.604 51.4898 15.604 41.5C15.604 31.5102 19.5724 21.9295 26.6363 14.8657C33.7002 7.80179 43.2808 3.83334 53.2707 3.83334C63.2605 3.83334 72.8411 7.80179 79.905 14.8657C86.9689 21.9295 90.9373 31.5102 90.9373 41.5Z" stroke="#FFF9FC" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div className="pg-confirmed-alert-body">
                            <div className="pg-confirmed-alert-info">
                                
                                <div className="pg-green-check">
                                    <GreenCheckIcon />
                                </div>
                                <div className="pg-confirmed-alert-donation">
                                    <p className="pg-confirmed-alert-donation-confirmation-text">Donación confirmada</p>
                                    <p className="pg-confirmed-alert-donation-amount-text">                                    $
                                    {Number(
                                        selectedAmount ||
                                        0
                                    ).toLocaleString(
                                        "es-AR"
                                    )}</p>
                                </div>
                            </div>
                            <div className="pg-confirmed-alert-gratitude">
                                <h1>¡Gracias, {firstName}!</h1>
                                <p>Tu donación hace la diferencia. Gracias a tu aporte más adolescentes podrán acceder a salud menstrual digna.</p>
                            </div>
                        </div>
                        <div className="pg-confirmed-alert-footer">
                            
                            <Icon icon="bxs:home-heart" className="pg-home-heart" />
                            <p>Tu aporte ya está en manos de Undood</p>
                        </div>
                    </div>)
                    :
                    (<div className="pg-section-3">
                        <div className="pg-confirmed-alert-body">
                            <div className="pg-confirmed-alert-info">
                                <div className="pg-red-cross">
                                    <RedCrossIcon />
                                </div>
                                <div className="pg-confirmed-alert-donation">
                                    <p className="pg-confirmed-alert-donation-confirmation-text pg-rejection-color">Pago rechazado</p>
                                </div>
                            </div>
                            <div className="pg-confirmed-alert-gratitude">
                                <h1>No pudimos procesar tu pago</h1>
                                <p>Verificá los datos ingresados e intentá nuevamente.</p>
                            </div>
                        </div>
                        <div className="pg-rejected-alert-footer">
                            <div className="pg-rejected-alert-footer-contact">
                                <div className="pg-info">
                                    <InfoIcon/>
                                </div>
                                <div className="pg-contact-text">
                                    <p>Si el problema persiste, contactanos en </p><a>@undood.org</a>
                                </div>
                            </div>
                            <button 
                                className="pg-primary-button"
                                onClick={handlePreviousFromProcessedPayment}
                            >
                                Intentar nuevamente
                            </button>
                        </div>
                    </div>)
                    }
                </div>

            </div>
    );
}


function GreenCheckIcon() {
    return (<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                <g clipPath="url(#clip0_816_2428)">
                    <path d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z" fill="#4ADE80"/>
                    <path d="M12 20L18 26L28 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
                <defs>
                    <clipPath id="clip0_816_2428">
                        <rect width="40" height="40" fill="white"/>
                    </clipPath>
                </defs>
            </svg>)
}

function RedCrossIcon() {
    return (<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                <g clipPath="url(#clip0_784_2946)">
                    <path d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z" fill="#DC2626"/>
                    <path d="M14 14L26 26M26 14L14 26" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </g>
                <defs>
                    <clipPath id="clip0_784_2946">
                        <rect width="40" height="40" fill="white"/>
                    </clipPath>
                </defs>
            </svg>)
}

function InfoIcon() {
    return (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10.0003 1.66666C5.40033 1.66666 1.66699 5.39999 1.66699 9.99999C1.66699 14.6 5.40033 18.3333 10.0003 18.3333C14.6003 18.3333 18.3337 14.6 18.3337 9.99999C18.3337 5.39999 14.6003 1.66666 10.0003 1.66666ZM10.8337 14.1667H9.16699V9.16666H10.8337V14.1667ZM10.8337 7.49999H9.16699V5.83332H10.8337V7.49999Z" fill="#137EBE"/>
    </svg>)
}