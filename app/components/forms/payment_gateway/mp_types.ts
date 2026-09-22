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
