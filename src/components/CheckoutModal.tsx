import { useState } from "react";
import { X, Loader2, CheckCircle, AlertTriangle, ArrowLeft, Clock, Copy, Check } from "lucide-react";
import { Button } from "./ui/button";
import { useCart } from "@/contexts/CartContext";
import { urlFor } from "@/lib/sanity";
import PaymentBrick from "./PaymentBrick";

interface CheckoutModalProps {
  onClose: () => void;
}

type Step = "form" | "loading" | "payment" | "success" | "pending" | "error";

const CheckoutModal = ({ onClose }: CheckoutModalProps) => {
  const { cart, total, grandTotal, selectedShipping, clearCart } = useCart();
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState({ name: "", email: "", cpf: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [orderId] = useState(`EV-${Math.floor(100000 + Math.random() * 900000)}`);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [ticketUrl, setTicketUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const validate = () => {
    const errs: Partial<typeof form> = {};
    if (!form.name.trim()) errs.name = "Nome obrigatório";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "E-mail inválido";
    if (!form.cpf.trim() || form.cpf.replace(/\D/g, "").length !== 11)
      errs.cpf = "CPF inválido (11 dígitos)";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGoToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStep("loading");
    setApiError(null);

    try {
      const response = await fetch("/api/payment/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          payer: form,
          shippingFee: selectedShipping?.price,
          shippingMethod: selectedShipping?.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Não foi possível inicializar o pagamento.");
      }

      const data = await response.json();
      setPreferenceId(data.id);
      setStep("payment");
    } catch (err: any) {
      console.error(err);
      setApiError("Erro ao preparar o checkout. Tente novamente.");
      setStep("form");
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    fetch("/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        payer: form,
        items: cart,
        total: grandTotal,
        shippingFee: selectedShipping?.price,
        shippingMethod: selectedShipping?.name,
      }),
    }).catch((err) => console.error("Erro ao enviar e-mail:", err));

    clearCart();

    if (paymentData.qr_code) setQrCode(paymentData.qr_code);
    if (paymentData.qr_code_base64) setQrCodeBase64(paymentData.qr_code_base64);
    if (paymentData.ticket_url) setTicketUrl(paymentData.ticket_url);

    // Mock para simulação local ou sandbox caso não retorne dados reais
    if (!paymentData.qr_code && paymentData.payment_method_id === "pix") {
      setQrCode("00020101021226870014br.gov.bcb.pix2565pix.mercadopago.com/qr/v2/5b521230-59c1-4ecc-b915-4ac6e2e8b982");
    }

    if (paymentData.status === "approved") {
      setStep("success");
    } else {
      setStep("pending");
    }
  };

  const handlePaymentError = (error: any) => {
    console.error("Payment error:", error);
    setApiError(
      error?.details || error?.message || "O pagamento não pôde ser concluído. Tente outra forma de pagamento."
    );
    setStep("error");
  };

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const headerTitle = {
    form: "Seus Dados",
    loading: "Preparando...",
    payment: "Pagamento",
    success: "Pedido Confirmado!",
    pending: "Pagamento Pendente",
    error: "Erro no Pagamento",
  }[step];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-black text-white px-6 py-4 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            {step === "payment" && (
              <button
                onClick={() => setStep("form")}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <h2 className="text-lg font-display font-bold uppercase tracking-widest">
              {headerTitle}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-grow">
          {/* ETAPA 1: Formulário de dados do cliente */}
          {step === "form" && (
            <form onSubmit={handleGoToPayment} className="p-6 space-y-5">
              {apiError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg">
                  {apiError}
                </div>
              )}

              {/* Resumo rápido */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 max-h-32 overflow-y-auto border border-slate-100">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0 border">
                      {item.images?.[0] && (
                        <img
                          src={urlFor(item.images[0]).width(80).url()}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-slate-800 line-clamp-1 text-xs">{item.name}</p>
                      <p className="text-slate-500 text-[11px]">
                        {item.quantity}x R$ {(item.discountPrice || item.price).toFixed(2)}
                        {item.size && ` · ${item.size}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totais */}
              <div className="space-y-1 text-xs text-slate-600 border-t pt-3">
                <div className="flex justify-between">
                  <span>Produtos:</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                {selectedShipping && (
                  <div className="flex justify-between">
                    <span>Frete ({selectedShipping.name}):</span>
                    <span>R$ {selectedShipping.price.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-bold text-slate-900 border-t pt-2 mt-1">
                  <span className="uppercase tracking-wider">Total:</span>
                  <span className="text-lg font-black">R$ {grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Campos */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Nome completo</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Maria da Silva"
                    className={`w-full border rounded-lg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 transition-all ${
                      errors.name ? "border-red-400 bg-red-50" : "border-slate-300"
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-[11px] mt-0.5">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">E-mail</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="maria@email.com"
                    className={`w-full border rounded-lg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 transition-all ${
                      errors.email ? "border-red-400 bg-red-50" : "border-slate-300"
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-[11px] mt-0.5">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">CPF</label>
                  <input
                    type="text"
                    value={form.cpf}
                    onChange={(e) => setForm((f) => ({ ...f, cpf: formatCpf(e.target.value) }))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className={`w-full border rounded-lg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 transition-all ${
                      errors.cpf ? "border-red-400 bg-red-50" : "border-slate-300"
                    }`}
                  />
                  {errors.cpf && <p className="text-red-500 text-[11px] mt-0.5">{errors.cpf}</p>}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-sm bg-black hover:bg-black/90 text-white font-bold rounded-xl shadow-lg transition-all uppercase tracking-wider"
              >
                Continuar para Pagamento →
              </Button>
              <p className="text-center text-[11px] text-slate-400">
                🔒 Pix, Cartão em até 12x ou Boleto · Mercado Pago
              </p>
            </form>
          )}

          {/* ETAPA LOADING */}
          {step === "loading" && (
            <div className="p-12 flex flex-col items-center justify-center gap-4 text-center">
              <Loader2 className="w-12 h-12 text-black animate-spin" />
              <p className="text-base font-semibold text-slate-800">Preparando checkout seguro...</p>
              <p className="text-xs text-slate-500">Isso leva apenas alguns segundos.</p>
            </div>
          )}

          {/* ETAPA 2: Payment Brick inline */}
          {step === "payment" && preferenceId && (
            <div className="p-5">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                  Total a pagar
                </span>
                <span className="text-xl font-black text-black">
                  R$ {grandTotal.toFixed(2)}
                </span>
              </div>

              <PaymentBrick
                preferenceId={preferenceId}
                amount={grandTotal}
                payer={form}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            </div>
          )}

          {/* ETAPA 3A: Pagamento aprovado */}
          {step === "success" && (
            <div className="p-10 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Pagamento Aprovado!</h3>
              <p className="text-sm text-slate-600 max-w-xs">
                Seu pedido <strong>#{orderId}</strong> foi confirmado. Enviamos os detalhes para <strong>{form.email}</strong>.
              </p>
              <Button onClick={onClose} className="mt-2 bg-black text-white rounded-xl px-8 h-11 hover:bg-black/90 text-sm">
                Fechar
              </Button>
            </div>
          )}

          {/* ETAPA 3B: Pagamento pendente (Pix/Boleto aguardando) */}
          {step === "pending" && (
            <div className="p-6 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Aguardando Pagamento</h3>
              <p className="text-xs text-slate-600 max-w-xs">
                Seu pedido <strong>#{orderId}</strong> foi registrado. Complete o pagamento para confirmar sua compra.
              </p>

              {/* Se for Pix e tiver QR Code */}
              {qrCode && (
                <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-3">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider rounded-full">
                    Pague com Pix
                  </span>
                  
                  {/* QR Code Image */}
                  <div className="bg-white p-3 rounded-xl border border-slate-150 shadow-sm">
                    <img
                      src={
                        qrCodeBase64
                          ? `data:image/png;base64,${qrCodeBase64}`
                          : `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrCode)}`
                      }
                      alt="Pix QR Code"
                      className="w-40 h-40 object-contain"
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 max-w-[240px]">
                    Escaneie o QR Code acima com o app do seu banco ou copie a chave abaixo:
                  </p>

                  {/* Copia e Cola */}
                  <div className="w-full flex gap-1 bg-white border rounded-lg p-1.5 items-center">
                    <input
                      type="text"
                      readOnly
                      value={qrCode}
                      className="flex-grow text-[11px] text-slate-600 bg-transparent outline-none px-2 select-all overflow-hidden text-ellipsis whitespace-nowrap"
                    />
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(qrCode || "");
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="h-8 bg-black hover:bg-black/90 text-white rounded px-3 text-xs flex items-center gap-1.5 flex-shrink-0"
                    >
                      {copied ? (
                        <>
                          <Check size={12} />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Se for Boleto e tiver Link */}
              {ticketUrl && (
                <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-3">
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider rounded-full">
                    Boleto Bancário
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Clique no botão abaixo para abrir ou imprimir o seu boleto:
                  </p>
                  <a
                    href={ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button className="w-full h-11 bg-black text-white hover:bg-black/90 text-xs font-bold uppercase tracking-wider rounded-lg">
                      Visualizar Boleto
                    </Button>
                  </a>
                </div>
              )}

              <Button onClick={onClose} className="mt-2 w-full border border-slate-250 bg-white hover:bg-slate-50 text-slate-800 rounded-xl h-11 text-xs font-bold uppercase tracking-wider">
                Fechar Janela
              </Button>
            </div>
          )}

          {/* ETAPA ERROR */}
          {step === "error" && (
            <div className="p-10 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Pagamento não concluído</h3>
              <p className="text-sm text-slate-600 max-w-xs">
                {apiError || "Não foi possível processar o pagamento. Verifique os dados e tente novamente."}
              </p>
              <Button
                onClick={() => {
                  setApiError(null);
                  setStep("payment");
                }}
                className="mt-2 bg-black text-white rounded-xl px-8 h-11 hover:bg-black/90 text-sm"
              >
                Tentar Novamente
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
