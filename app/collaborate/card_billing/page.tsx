'use client';

import { onSubmit } from './on_submit';
import { useEffect } from "react";
import { loadMercadoPago } from "@mercadopago/sdk-js";

export default function Billing() {
  useEffect(() => {
    async function init() {
      await loadMercadoPago();

      const mp = new window.MercadoPago(
        process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY!
      );

      const cardNumberElement = mp.fields
        .create("cardNumber", {
          placeholder: "Número de la tarjeta",
        })
        .mount("form-checkout__cardNumber");

      mp.fields
        .create("expirationDate", {
          placeholder: "MM/YY",
        })
        .mount("form-checkout__expirationDate");

      const securityCodeElement = mp.fields
        .create("securityCode", {
          placeholder: "Código de seguridad",
        })
        .mount("form-checkout__securityCode");

      function createSelectOptions(
        elem: HTMLSelectElement,
        options: any[],
        labelsAndKeys = { label: "name", value: "id" }
      ) {
        const { label, value } = labelsAndKeys;

        elem.options.length = 0;

        const tempOptions = document.createDocumentFragment();

        options.forEach((option) => {
          const opt = document.createElement("option");
          opt.value = option[value];
          opt.textContent = option[label];
          tempOptions.appendChild(opt);
        });

        elem.appendChild(tempOptions);
      }

      try {
        const identificationTypes = await mp.getIdentificationTypes();

        createSelectOptions(
          document.getElementById(
            "form-checkout__identificationType"
          ) as HTMLSelectElement,
          identificationTypes
        );
      } catch (e) {
        console.error("Error getting identificationTypes:", e);
      }

      const paymentMethodElement = document.getElementById(
        "paymentMethodId"
      ) as HTMLInputElement;

      const issuerElement = document.getElementById(
        "form-checkout__issuer"
      ) as HTMLSelectElement;

      const installmentsElement = document.getElementById(
        "form-checkout__installments"
      ) as HTMLSelectElement;

      const issuerPlaceholder = "Banco emisor";
      const installmentsPlaceholder = "Cuotas";

      function clearHTMLSelectChildrenFrom(element: HTMLSelectElement) {
        [...element.children].forEach((child) => child.remove());
      }

      function createSelectElementPlaceholder(
        element: HTMLSelectElement,
        placeholder: string
      ) {
        const option = document.createElement("option");
        option.textContent = placeholder;
        option.disabled = true;
        option.selected = true;
        element.appendChild(option);
      }

      function clearSelectsAndSetPlaceholders() {
        clearHTMLSelectChildrenFrom(issuerElement);
        createSelectElementPlaceholder(
          issuerElement,
          issuerPlaceholder
        );

        clearHTMLSelectChildrenFrom(installmentsElement);
        createSelectElementPlaceholder(
          installmentsElement,
          installmentsPlaceholder
        );
      }

      function updatePCIFieldsSettings(paymentMethod: any) {
        const settings = paymentMethod.settings[0];

        cardNumberElement.update({
          settings: settings.card_number,
        });

        securityCodeElement.update({
          settings: settings.security_code,
        });
      }

      async function getIssuers(paymentMethod: any, bin: string) {
        try {
          return await mp.getIssuers({
            paymentMethodId: paymentMethod.id,
            bin,
          });
        } catch (e) {
          console.error("error getting issuers:", e);
          return [];
        }
      }

      async function updateIssuer(paymentMethod: any, bin: string) {
        let issuerOptions = [paymentMethod.issuer];

        if (
          paymentMethod.additional_info_needed.includes("issuer_id")
        ) {
          issuerOptions = await getIssuers(paymentMethod, bin);
        }

        createSelectOptions(issuerElement, issuerOptions);
      }

      async function updateInstallments(
        paymentMethod: any,
        bin: string
      ) {
        try {
          const installments = await mp.getInstallments({
            amount: (
              document.getElementById(
                "transactionAmount"
              ) as HTMLInputElement
            ).value,
            bin,
            paymentTypeId: "credit_card",
          });

          const installmentOptions =
            installments[0].payer_costs;

          createSelectOptions(
            installmentsElement,
            installmentOptions,
            {
              label: "recommended_message",
              value: "installments",
            }
          );
        } catch (e) {
          console.error("error getting installments:", e);
        }
      }

      let currentBin: string | undefined;

      cardNumberElement.on(
        "binChange",
        async (data: { bin?: string }) => {
          const { bin } = data;

          try {
            if (!bin && paymentMethodElement.value) {
              clearSelectsAndSetPlaceholders();
              paymentMethodElement.value = "";
            }

            if (bin && bin !== currentBin) {
              const { results } =
                await mp.getPaymentMethods({ bin });

              const paymentMethod = results[0];

              paymentMethodElement.value = paymentMethod.id;

              updatePCIFieldsSettings(paymentMethod);
              await updateIssuer(paymentMethod, bin);
              await updateInstallments(paymentMethod, bin);
            }

            currentBin = bin;
          } catch (e) {
            console.error(
              "error getting payment methods:",
              e
            );
          }
        }
      );

      const formElement = document.getElementById(
        "form-checkout"
      ) as HTMLFormElement;

      formElement.addEventListener("submit", createCardToken);

      async function createCardToken(event: Event) {
        try {
          const tokenElement = document.getElementById(
            "token"
          ) as HTMLInputElement;

          if (!tokenElement.value) {
            event.preventDefault();

            const token = await mp.fields.createCardToken({
              cardholderName: (
                document.getElementById(
                  "form-checkout__cardholderName"
                ) as HTMLInputElement
              ).value,
              identificationType: (
                document.getElementById(
                  "form-checkout__identificationType"
                ) as HTMLSelectElement
              ).value,
              identificationNumber: (
                document.getElementById(
                  "form-checkout__identificationNumber"
                ) as HTMLInputElement
              ).value,
            });

            tokenElement.value = token.id;
            formElement.requestSubmit();
          }
        } catch (e) {
          console.error("error creating card token:", e);
        }
      }
    }

    init();
  }, []);

  return (
    <div>
      <form
        id="form-checkout"
        onSubmit={onSubmit}
      >
        <input
          id="transactionAmount"
          name="transactionAmount"
          type="number"
          min="1"
          step="0.01"
          placeholder="Monto"
        />
      
        <div
          id="form-checkout__cardNumber"
          className="container"
        ></div>

        <div
          id="form-checkout__expirationDate"
          className="container"
        ></div>

        <div
          id="form-checkout__securityCode"
          className="container"
        ></div>

        <input
          type="text"
          id="form-checkout__cardholderName"
          placeholder="Titular de la tarjeta"
        />

        <select
          id="form-checkout__issuer"
          name="issuer"
          defaultValue=""
        >
          <option value="" disabled>
            Banco emisor
          </option>
        </select>

        <select
          id="form-checkout__installments"
          name="installments"
          defaultValue=""
        >
          <option value="" disabled>
            Cuotas
          </option>
        </select>

        <select
          id="form-checkout__identificationType"
          name="identificationType"
          defaultValue=""
        >
          <option value="" disabled>
            Tipo de documento
          </option>
        </select>

        <input
          type="text"
          id="form-checkout__identificationNumber"
          name="identificationNumber"
          placeholder="Número do documento"
        />

        <input
          type="email"
          id="form-checkout__email"
          name="email"
          placeholder="E-mail"
        />

        <input id="token" name="token" type="hidden" />
        <input
          id="paymentMethodId"
          name="paymentMethodId"
          type="hidden"
        />

        <button
          type="submit"
          id="form-checkout__submit"
        >
          Pagar
        </button>
      </form>
    </div>
  );
}