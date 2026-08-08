import React, { useState } from "react";
// @ts-ignore: allow CSS side-effect import without module declarations
import "./payment_gateway.css";

interface PersonalData {
    firstName: string;
    lastName: string;
    email: string;
}

interface PaymentData {
    dni: string;
    postalCode: string;
    cardNumber: string;
    expirationDate: string;
    cvv: string;
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

type DonationOption = 5000 | 10000 | 15000 | "custom";

// ------------------------------------------------------------
// INPUT COMPONENT
// ------------------------------------------------------------

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
            </label>

            <input
                className={`pg-input ${
                    error ? "pg-input-error" : ""
                }`}
                type={type}
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
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

// ------------------------------------------------------------
// PAYMENT GATEWAY
// ------------------------------------------------------------

export default function PaymentGateway({
    initialDonationAmount = null,
    lockedDonationAmount = false,
    initialReports = false,
    onSubmit = () => {},
    onStepChange = () => {},
}: PaymentGatewayProps) {

    // ------------------------------------------------------------
    // STEP
    // ------------------------------------------------------------

    const [currentStep, setCurrentStep] =
        useState<number>(1);

    // ------------------------------------------------------------
    // DONATION
    // ------------------------------------------------------------

    const [donationAmount, setDonationAmount] =
        useState<number | DonationOption | null>(
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
        useState<boolean>(initialReports);

    // ------------------------------------------------------------
    // PERSONAL DATA
    // ------------------------------------------------------------

    const [firstName, setFirstName] =
        useState<string>("");

    const [lastName, setLastName] =
        useState<string>("");

    const [email, setEmail] =
        useState<string>("");

    // ------------------------------------------------------------
    // PAYMENT DATA
    // ------------------------------------------------------------

    const [dni, setDni] =
        useState<string>("");

    const [postalCode, setPostalCode] =
        useState<string>("");

    const [cardNumber, setCardNumber] =
        useState<string>("");

    const [expirationDate, setExpirationDate] =
        useState<string>("");

    const [cvv, setCvv] =
        useState<string>("");

    // ------------------------------------------------------------
    // ERRORS
    // ------------------------------------------------------------

    const [errors, setErrors] =
        useState<Record<string, string>>({});

    // ------------------------------------------------------------
    // DONATION HELPERS
    // ------------------------------------------------------------

    const isCustomAmount =
        donationAmount === "custom";

    const selectedAmount: number =
        donationAmount === "custom"
            ? Number(customAmount)
            : typeof donationAmount === "number"
              ? donationAmount
              : 0;

    const selectDonationAmount = (
        amount: 5000 | 10000 | 15000
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

        setCustomAmount(numericValue);

        setErrors((prev) => ({
            ...prev,
            donationAmount: "",
        }));
    };

    // ------------------------------------------------------------
    // VALIDATION
    // ------------------------------------------------------------

    const validateStep1 = (): boolean => {

        const newErrors: Record<string, string> = {};

        if (donationAmount === null) {
            newErrors.donationAmount =
                "Seleccioná un monto.";
        }

        if (donationAmount === "custom") {

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

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = (): boolean => {

        const newErrors: Record<string, string> = {};

        if (!firstName.trim()) {
            newErrors.firstName =
                "Ingresá tu nombre.";
        }

        if (!lastName.trim()) {
            newErrors.lastName =
                "Ingresá tu apellido.";
        }

        if (!email.trim()) {

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

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = (): boolean => {

        const newErrors: Record<string, string> = {};

        if (!dni.trim()) {
            newErrors.dni =
                "Ingresá tu DNI.";
        }

        if (!postalCode.trim()) {
            newErrors.postalCode =
                "Ingresá tu código postal.";
        }

        if (!cardNumber.trim()) {
            newErrors.cardNumber =
                "Ingresá el número de tarjeta.";
        }

        if (!expirationDate.trim()) {
            newErrors.expirationDate =
                "Ingresá la fecha de vencimiento.";
        }

        if (!cvv.trim()) {
            newErrors.cvv =
                "Ingresá el CVV.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // ------------------------------------------------------------
    // NAVIGATION
    // ------------------------------------------------------------

    const goToStep = (
        step: number
    ): void => {

        setCurrentStep(step);
        setErrors({});
        onStepChange(step);
    };

    const handleNextFromStep1 =
        (): void => {

            if (!validateStep1()) {
                return;
            }

            goToStep(2);
        };

    const handleNextFromStep2 =
        (): void => {

            if (!validateStep2()) {
                return;
            }

            goToStep(3);
        };

    // ------------------------------------------------------------
    // SUBMIT
    // ------------------------------------------------------------

    const handleSubmit = (
        event: React.FormEvent<HTMLFormElement>
    ): void => {

        event.preventDefault();

        if (!validateStep3()) {
            return;
        }

        const paymentData: DonationData = {

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
                cardNumber,
                expirationDate,
                cvv,
            },
        };

        onSubmit(paymentData);
    };

    // ------------------------------------------------------------
    // RENDER
    // ------------------------------------------------------------

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
                                    checked={reports}
                                    onChange={(event) =>
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
                                        value={firstName}
                                        onChange={(event) =>
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
                                        value={lastName}
                                        onChange={(event) =>
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
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(
                                            event.target.value
                                        )
                                    }
                                    placeholder="tu@email.com"
                                />

                                {errors.email && (
                                    <span className="pg-error">
                                        {errors.email}
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
                        onSubmit={handleSubmit}
                    >

                        <h2 className="pg-title">
                            Confirmar donación
                        </h2>

                        <div className="pg-form-column">

                            <div className="pg-row">

                                <Input
                                    label="DNI"
                                    value={dni}
                                    onChange={setDni}
                                    placeholder="Tu DNI"
                                    error={errors.dni}
                                />

                                <Input
                                    label="Código postal"
                                    value={postalCode}
                                    onChange={setPostalCode}
                                    placeholder="Código postal"
                                    error={
                                        errors.postalCode
                                    }
                                />

                            </div>

                            <Input
                                label="Número de tarjeta"
                                value={cardNumber}
                                onChange={setCardNumber}
                                placeholder="0000 0000 0000 0000"
                                error={
                                    errors.cardNumber
                                }
                            />

                            <div className="pg-row">

                                <Input
                                    label="Fecha de vencimiento"
                                    value={expirationDate}
                                    onChange={
                                        setExpirationDate
                                    }
                                    placeholder="MM/AA"
                                    error={
                                        errors.expirationDate
                                    }
                                    maxLength={5}
                                />

                                <Input
                                    label="CVV"
                                    value={cvv}
                                    onChange={setCvv}
                                    placeholder="123"
                                    error={errors.cvv}
                                    maxLength={4}
                                />

                            </div>

                        </div>

                        <div className="pg-donate-total">

                            <div className="pg-total">
                                $
                                {Number(
                                    selectedAmount || 0
                                ).toLocaleString(
                                    "es-AR"
                                )}
                            </div>

                            <button
                                type="submit"
                                className="pg-primary-button"
                            >
                                Donar
                            </button>

                        </div>

                    </form>
                )}

                {/* ==================================================
                    SECURITY FOOTER - STEP 1
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