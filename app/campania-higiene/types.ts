
interface PersonalData {
    firstName: string;
    lastName: string;
    email: string;
    postalCode: string;
}

interface PaymentData {
    dni: string;
    cardholderName: string;

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