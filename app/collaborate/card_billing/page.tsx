'use client';

import { onSubmit } from './on_submit';
import { useEffect } from "react";
import { loadMercadoPago } from "@mercadopago/sdk-js";
import PaymentGateway from '@/app/components/forms/payment_gateway/paymentGateway';

export default function Billing() {

  return <PaymentGateway />;
}