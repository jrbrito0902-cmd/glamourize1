import { useState } from "react";
import { X, Loader2, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useCart } from "@/contexts/CartContext";
import { urlFor } from "@/lib/sanity";

interface CheckoutModalProps {
  onClose: () => void;
}

type Step = "form" | "processing" | "success";

const CheckoutModal = ({ onClose }: CheckoutModalProps) => {
  const { cart, total, grandTotal, selectedShipping, clearCart } = useCart();
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState({ name: "", email: "", cpf: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const validate = () => {
    const errs: Partial<typeof form> = {};
    if (!form.name.trim()) errs.name = "Nome obrigatório";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "E-mail inválido";
    if (!form.cpf.trim() || form.cpf.replace(/\D/g, "").length !== 11)
      errs.cpf = "CPF inválido (somente números, 11 dígitos)";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStep("processing");
    setApiError(null);

    const orderId = `EV-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // 1. Dispara envio do e-mail de confirmação em segundo plano
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
      }).catch((err) => console.error("Erro ao solicitar e-mail:", err));

      // 2. Cria preferência no Mercado Pago
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
        throw new Error("Não foi possível gerar a sessão de pagamento.");
      }

      const data = await response.json();
      const redirectUrl = data.init_point || data.sandbox_init_point;

      clearCart();

      if (redirectUrl) {
        // Redireciona diretamente para o checkout do Mercado Pago
        window.location.href = redirectUrl;
      } else {
        setStep("success");
      }
    } catch (err: any) {
      console.error(err);
      setApiError("Ocorreu um erro ao preparar o pagamento. Tente novamente.");
      setStep("form");
    }
  };

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-black text-white px-6 py-5 flex justify-between items-center">
          <h2 className="text-xl font-display font-bold uppercase tracking-widest">
            {step === "success" ? "Pedido Recebido!" : "Finalizar Compra"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo */}
        {step === "form" && (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg">
                {apiError}
              </div>
            )}

            {/* Resumo rápido */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 max-h-36 overflow-y-auto border border-slate-100">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0 border">
                    {item.images?.[0] && (
                      <img
                        src={urlFor(item.images[0]).width(80).url()}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-slate-800 line-clamp-1">{item.name}</p>
                    <p className="text-slate-500 text-xs">
                      {item.quantity}x R$ {(item.discountPrice || item.price).toFixed(2)}
                      {item.size && ` | Tam: ${item.size}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 border-t pt-3">
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
              <div className="flex justify-between items-center text-sm font-bold text-slate-900 border-t pt-2">
                <span className="uppercase tracking-wider">Total a pagar:</span>
                <span className="text-xl font-black text-black">R$ {grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3.5">
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
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
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
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
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
                {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf}</p>}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                type="submit"
                className="w-full h-12 text-base bg-black hover:bg-black/90 text-white font-bold rounded-xl shadow-lg transition-all uppercase tracking-wider"
              >
                Pagar com Mercado Pago
              </Button>
              <p className="text-center text-[11px] text-slate-500">
                🔒 Pix, Cartão de Crédito em até 12x ou Boleto via Mercado Pago
              </p>
            </div>
          </form>
        )}

        {step === "processing" && (
          <div className="p-12 flex flex-col items-center justify-center gap-4 text-center">
            <Loader2 className="w-14 h-14 text-black animate-spin" />
            <p className="text-lg font-semibold text-slate-800">Gerando seu checkout seguro...</p>
            <p className="text-sm text-slate-500">Você será redirecionada para o Mercado Pago em instantes.</p>
          </div>
        )}

        {step === "success" && (
          <div className="p-12 flex flex-col items-center justify-center gap-4 text-center">
            <CheckCircle className="w-16 h-16 text-emerald-500" />
            <h3 className="text-2xl font-bold text-slate-900">Pedido Solicitado!</h3>
            <p className="text-sm text-slate-600 max-w-xs">
              Enviamos a confirmação para seu e-mail. Obrigado por comprar na Estilo VIP!
            </p>
            <Button onClick={onClose} className="mt-4 bg-black text-white rounded-xl px-8 h-12 hover:bg-black/90">
              Fechar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;

