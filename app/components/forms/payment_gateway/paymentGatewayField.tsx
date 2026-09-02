export function PaymentGatewayField(props: { required: boolean, label: string, inputType: string, placeholder: string, value: any, setValue: any, errors: any}) {
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
                className={`pg-input ${
                    props.errors
                        ? "pg-input-error"
                        : ""
                }`}
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

                <span className="pg-error">
                    {
                        props.errors
                    }
                </span>

            )}

        </div>)
}