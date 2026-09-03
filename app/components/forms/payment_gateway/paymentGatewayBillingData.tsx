import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
} from "react";

import { PaymentGatewayField } from "./paymentGatewayField";


export type PaymentGatewayBillingDataRef = {
    validate: () => boolean;
};


const PaymentGatewayBillingData = forwardRef<
    PaymentGatewayBillingDataRef,
    {
        onFirstNameChanged: (firstName: string) => void,
        onLastNameChanged: (lastName: string) => void,
        onEmailChanged: (email: string) => void,
        onPostalCodeChanged: (postalCode: string) => void,
    }
>(function PaymentGatewayBillingData(props, ref) {

    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [postalCode, setPostalCode] = useState<string>("");


    const [errors, setErrors] =
        useState<
            Record<string, string>
        >({});


    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!firstName.trim()) {
            newErrors.firstName = "Ingresá tu nombre.";
        }

        if (!lastName.trim()) {
            newErrors.lastName = "Ingresá tu apellido.";
        }

        if (!email.trim()) {
            newErrors.email = "Ingresá tu correo electrónico.";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            newErrors.email = "Ingresá un correo electrónico válido.";
        }

        if (!postalCode.trim()) {
            newErrors.postalCode = "Ingresá tu código postal"
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };


    useImperativeHandle(ref, () => ({
        validate,
    }));


    useEffect(() => {
        props.onFirstNameChanged(firstName)
        if ("firstName" in errors) {
            const newErrors = { ...errors };
            delete newErrors.firstName;
            setErrors(newErrors);
        }
    }, [firstName]);

    useEffect(() => {
        props.onLastNameChanged(lastName)
        if ("lastName" in errors) {
            const newErrors = { ...errors };
            delete newErrors.lastName;
            setErrors(newErrors);
        }

    }, [lastName]);

    useEffect(() => {
        props.onEmailChanged(email)
        if ("email" in errors) {
            const newErrors = { ...errors };
            delete newErrors.email;
            setErrors(newErrors);
        }
    }, [email]);

    useEffect(() => {
        props.onPostalCodeChanged(postalCode)
        if ("postalCode" in errors) {
            const newErrors = { ...errors };
            delete newErrors.postalCode;
            setErrors(newErrors);
        }

    }, [postalCode]);


    return (<div className="pg-donation-amount-info-container">
        
                <h2 className="pg-title">
                    Datos de facturación
                </h2>

                <div className="pg-form-column">

                    <div className="pg-row">

                        <PaymentGatewayField required={true} label="Nombre" inputType="text" placeholder="Tu nombre" value={firstName} setValue={setFirstName} errors={errors.firstName}/>

                        <PaymentGatewayField required={true} label="Apellido" inputType="text" placeholder="Tu apellido" value={lastName} setValue={setLastName} errors={errors.lastName}/>

                    </div>

                    <PaymentGatewayField required={true} label="Correo electrónico" inputType="email" placeholder="tu@email.com" value={email} setValue={setEmail} errors={errors.email}/>

                    <PaymentGatewayField required={true} label="Código postal" inputType="text" placeholder="Tu código postal" value={postalCode} setValue={setPostalCode} errors={errors.postalCode}/>

                </div>

            </div>)
});



export default PaymentGatewayBillingData;