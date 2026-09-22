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

  const amount = (
    document.getElementById("transactionAmount") as HTMLInputElement
  ).value;
  
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
    body: JSON.stringify({
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
            payment_method: {
              id: paymentMethodId,
              type: "credit_card",
              token,
              installments,
            },
          },
        ],
      },
    }),
  });

  if (!response.ok) {
    console.error(await response.text());
    return;
  }

  const data = await response.json();
  console.log(data);
};