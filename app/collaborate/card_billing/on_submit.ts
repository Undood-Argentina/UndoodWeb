export const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  const form = event.currentTarget;

  // Si todavía no existe el token, dejamos que createCardToken lo genere
  const token = (
    document.getElementById("token") as HTMLInputElement
  ).value;

  if (!token) {
    form.requestSubmit();
    return;
  }

  const amount = Number((
    document.getElementById("transactionAmount") as HTMLInputElement
  ).value);
  
  const email = (
    document.getElementById("form-checkout__email") as HTMLInputElement
  ).value;

  const paymentMethodId = (
    document.getElementById("paymentMethodId") as HTMLInputElement
  ).value;

  const installments = Number(
    (
      document.getElementById(
        "form-checkout__installments"
      ) as HTMLSelectElement
    ).value
  );

  const response = await fetch("/api/process_order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify((() => {
      const paymentMethod: Record<string, string | number> = {
        type: "credit_card",
        token,
        installments,
      };

      const allowedPaymentMethodIds = new Set([
        "amex",
        "argencard",
        "cabal",
        "cencosud",
        "cmr",
        "diners",
        "master",
        "naranja",
        "visa",
      ]);

      const normalizedPaymentMethodId = String(paymentMethodId ?? "")
        .trim()
        .toLowerCase();

      if (allowedPaymentMethodIds.has(normalizedPaymentMethodId)) {
        paymentMethod.id = normalizedPaymentMethodId;
      }

      return {
        type: "online",
        processing_mode: "automatic",
        total_amount: amount,
        external_reference: crypto.randomUUID(),
        payer: {
          email,
        },
        transactions: {
          payments: [
            {
              amount,
              payment_method: paymentMethod,
            },
          ],
        },
      };
    })()),
  });

  if (!response.ok) {
    console.error(await response.text());
    return;
  }

  const data = await response.json();
  console.log(data);
};