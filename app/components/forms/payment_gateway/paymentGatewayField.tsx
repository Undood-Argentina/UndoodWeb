export function PaymentGatewayField(props: { disabled: boolean, required: boolean, label: string, inputType: string, placeholder: string, value: any, setValue: any, errors: any}) {
    return (<div className="pg-field">
            <label className="pg-label">
                {props.label}
                {props.required && (
                    <span className="pg-required">
                        *
                    </span>
                )}
            </label>

            <input
                disabled={props.disabled}
                className={`pg-input ${
                    props.errors
                        ? "pg-input-error"
                        : ""
                } ${ props.disabled ? "disabled" : ""}`}
                type={props.inputType}
                value={
                    props.value
                }
                onChange={(
                    event
                ) =>
                    props.setValue(
                        event.target.value
                    )
                }
                placeholder={props.placeholder}

            />

            {props.errors && (

                <p className="pg-error">
                    {
                        props.errors
                    }
                </p>

            )}

        </div>)
}