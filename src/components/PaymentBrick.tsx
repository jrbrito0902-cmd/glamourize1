import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

// Tipagem global do SDK do Mercado Pago (carregado via CDN no index.html)
declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface PaymentBrickProps {
  preferenceId: string;
  amount: number;
  payer: { name: string; email: string; cpf: string };
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: any) => void;
}

const PaymentBrick = ({
  preferenceId,
  amount,
  payer,
  onPaymentSuccess,
  onPaymentError,
}: PaymentBrickProps) => {
  const brickContainerRef = useRef<HTMLDivElement>(null);
  const brickControllerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [sdkError, setSdkError] = useState<string | null>(null);

  useEffect(() => {
    const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;

    if (!publicKey) {
      setSdkError(
        "Chave pública do Mercado Pago (VITE_MERCADOPAGO_PUBLIC_KEY) não configurada."
      );
      setLoading(false);
      return;
    }

    if (!window.MercadoPago) {
      setSdkError(
        "SDK do Mercado Pago não carregado. Recarregue a página."
      );
      setLoading(false);
      return;
    }

    let isMounted = true;

    const initBrick = async () => {
      try {
        const mp = new window.MercadoPago(publicKey, {
          locale: "pt-BR",
        });

        const bricksBuilder = mp.bricks();

        // Limpa o container antes de renderizar
        if (brickContainerRef.current) {
          brickContainerRef.current.innerHTML = "";
        }

        const controller = await bricksBuilder.create(
          "payment",
          "mp-payment-brick-container",
          {
            initialization: {
              amount: amount,
              preferenceId: preferenceId,
              payer: {
                firstName: payer.name.split(" ")[0] || "",
                lastName: payer.name.split(" ").slice(1).join(" ") || "",
                email: payer.email,
                identification: {
                  type: "CPF",
                  number: payer.cpf.replace(/\D/g, ""),
                },
              },
            },
            customization: {
              visual: {
                style: {
                  theme: "default",
                  customVariables: {
                    formBackgroundColor: "#FFFFFF",
                    baseColor: "#000000",
                  },
                },
                hideFormTitle: true,
                hidePaymentButton: false,
              },
              paymentMethods: {
                creditCard: "all",
                debitCard: "all",
                ticket: "all",
                bankTransfer: "all",
                maxInstallments: 12,
              },
            },
            callbacks: {
              onReady: () => {
                if (isMounted) {
                  setLoading(false);
                }
              },
              onSubmit: async ({ selectedPaymentMethod, formData }: any) => {
                try {
                  const response = await fetch("/api/payment/process", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                  });

                  const result = await response.json();

                  if (
                    response.ok &&
                    (result.status === "approved" ||
                      result.status === "pending" ||
                      result.status === "in_process")
                  ) {
                    onPaymentSuccess(result);
                  } else {
                    onPaymentError(result);
                  }
                } catch (err) {
                  console.error("Erro ao processar pagamento:", err);
                  onPaymentError(err);
                }
              },
              onError: (error: any) => {
                console.error("Brick error:", error);
                if (isMounted) {
                  setSdkError("Erro no formulário de pagamento. Tente novamente.");
                }
              },
            },
          }
        );

        if (isMounted) {
          brickControllerRef.current = controller;
        }
      } catch (err) {
        console.error("Erro ao inicializar Brick:", err);
        if (isMounted) {
          setSdkError("Não foi possível carregar o formulário de pagamento.");
          setLoading(false);
        }
      }
    };

    initBrick();

    return () => {
      isMounted = false;
      // Cleanup: desmonta o brick quando o componente sair
      if (brickControllerRef.current?.unmount) {
        brickControllerRef.current.unmount();
      }
    };
  }, [preferenceId, amount]);

  return (
    <div className="w-full">
      {loading && (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <Loader2 className="w-8 h-8 text-black animate-spin" />
          <p className="text-sm text-slate-500">
            Carregando opções de pagamento...
          </p>
        </div>
      )}

      {sdkError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-lg text-center">
          {sdkError}
        </div>
      )}

      <div
        id="mp-payment-brick-container"
        ref={brickContainerRef}
        className={loading ? "hidden" : ""}
      />
    </div>
  );
};

export default PaymentBrick;
