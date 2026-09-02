import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
} from "react";


export type PaymentGatewayAmountSelectionRef = {
    validate: () => boolean;
};


const PaymentGatewayAmountSelection = forwardRef<
    PaymentGatewayAmountSelectionRef,
    {
        amount_option_1: number, amount_option_2: number, amount_option_3: number,
        onAmountSelected: (amount: number) => void,
    }
>(function PaymentGatewayAmountSelection(props, ref) {
    const [finalAmount, setFinalAmount] = useState<null | number>();
    const [amountSelected, setAmountSelected] = useState<null | number | "custom">(null);

    useEffect(() => {
        if (amountSelected !== "custom") {
            setFinalAmount(amountSelected)
        }
    }, [amountSelected]);

    useEffect(() => {
        if (finalAmount) {
            props.onAmountSelected(finalAmount)
        }
    }, [finalAmount])

    const isCustomAmount = amountSelected == "custom"

    const [customAmount, setCustomAmount] = useState<string>("0");

    useEffect(() => {
        setFinalAmount(parseInt(customAmount))
    }, [customAmount])

    const [errors, setErrors] =
        useState<
            Record<string, string>
        >({});


    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (amountSelected === null) {
            newErrors.donationAmount =
                "Seleccioná un monto.";
        }

        if (amountSelected === "custom") {
            const amount = Number(customAmount);

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


    useImperativeHandle(ref, () => ({
        validate,
    }));


    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            setErrors({});
        }
    }, [amountSelected, customAmount]);


    return (<div className="pg-donation-amount-info-container">
                <h2 className="pg-title">
                    ¿Cuánto querés donar?
                </h2>

                <div className="pg-amount-grid">
                    <AmountButton amount={props.amount_option_1} selected={amountSelected === props.amount_option_1} onSelect={() => setAmountSelected(props.amount_option_1)}></AmountButton>
                    <AmountButton amount={props.amount_option_2} selected={amountSelected === props.amount_option_2} onSelect={() => setAmountSelected(props.amount_option_2)}></AmountButton>
                    <AmountButton amount={props.amount_option_3} selected={amountSelected === props.amount_option_3} onSelect={() => setAmountSelected(props.amount_option_3)}></AmountButton>

                    <button
                        type="button"
                        className={
                            `pg-amount-option ${
                                amountSelected === "custom"
                                    ? "pg-amount-selected"
                                    : ""
                            }`
                        }
                        onClick={
                            () => setAmountSelected("custom")
                        }
                    >
                        Otro monto
                    </button>

                </div>
                {errors.donationAmount &&
                    !isCustomAmount && (

                        <span className="pg-error pg-general-error">
                            {
                                errors.donationAmount
                            }
                        </span>

                    )}

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
                                type="number"
                                value={
                                    customAmount
                                }
                                onChange={(
                                    event
                                ) =>
                                    setCustomAmount(event.target.value)
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

            </div>)
});


function AmountButton(props: {
    amount: number;
    selected: boolean;
    onSelect: () => void;
}) {

    const formatAmount = (amount: number) => {
        return `$${amount.toLocaleString("es-AR")}`;
    }
    
    return (<button
        type="button"
        className={
            `pg-amount-option ${
                props.selected
                    ? "pg-amount-selected"
                    : ""
            }`
        }
        onClick={props.onSelect}
    >
        {formatAmount(props.amount)}
    </button>)
}


export default PaymentGatewayAmountSelection;