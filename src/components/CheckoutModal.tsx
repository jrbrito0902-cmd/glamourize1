import { useState } from "react";
import { X, Loader2, CheckCircle, ShoppingBag } from "lucide-react";
import { Button } from "./ui/button";
import { useCart } from "@/contexts/CartContext";
import { urlFor } from "@/lib/sanity";

interface CheckoutModalProps {
  onClose: () => void;
}

type Step = "form" | "processing" | "success";

const CheckoutModal = ({ onClose }: CheckoutModalProps) => {
  const { cart, total, clearCart } = useCart();
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState({ name: "", email: "", cpf: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

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

    // ⚠️ INTEGRAÇÃO MERCADO PAGO — será ativada depois
    // Aqui será feita a chamada para: POST /api/create-preference
    // com os dados do cart e do form (name, email, cpf)
    // e então o usuário será redirecionado para init_point (URL do MP)
    //
    // Simulação temporária (2s de espera):
    await new Promise((res) => setTimeout(res, 2000));

    clearCart();
    setStep("success");
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
        <div className="bg-secondary text-white px-6 py-5 flex justify-between items-center">
          <h2 className="text-xl font-display font-bold uppercase tracking-widest">
            {step === "success" ? "Pedido Recebido!" : "Finalizar Compra"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo */}
        {step === "form" && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Resumo rápido */}
            <div className="bg-muted/40 rounded-xl p-4 space-y-2 max-h-36 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 border">
                    {item.images?.[0] && (
                      <img
                        src={urlFor(item.images[0]).width(80).url()}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium line-clamp-1">{item.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {item.quantity}x R$ {(item.discountPrice || item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center border-t pt-3">
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Total</span>
              <span className="text-2xl font-bold text-primary">R$ {total.toFixed(2)}</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-secondary">Nome completo</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Maria da Silva"
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                    errors.name ? "border-red-400 bg-red-50" : "border-border"
                  }`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-secondary">E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="maria@email.com"
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                    errors.email ? "border-red-400 bg-red-50" : "border-border"
                  }`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-secondary">CPF</label>
                <input
                  type="text"
                  value={form.cpf}
                  onChange={(e) => setForm((f) => ({ ...f, cpf: formatCpf(e.target.value) }))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                    errors.cpf ? "border-red-400 bg-red-50" : "border-border"
                  }`}
                />
                {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf}</p>}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all"
              >
                Ir para Pagamento
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                🔒 Pagamento seguro via Mercado Pago — Cartão, Pix ou Boleto
              </p>
            </div>
          </form>
        )}

        {step === "processing" && (
          <div className="p-12 flex flex-col items-center justify-center gap-4 text-center">
            <Loader2 className="w-14 h-14 text-primary animate-spin" />
            <p className="text-lg font-semibold text-secondary">Preparando seu pagamento...</p>
            <p className="text-sm text-muted-foreground">Você será redirecionada para o Mercado Pago em instantes.</p>
          </div>
        )}

        {step === "success" && (
          <div className="p-12 flex flex-col items-center justify-center gap-4 text-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <h3 className="text-2xl font-bold text-secondary">Pedido confirmado!</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Em breve o sistema de pagamento estará ativo. Iremos notificá-la assim que estiver disponível.
            </p>
            <Button onClick={onClose} className="mt-4 bg-primary text-white rounded-xl px-8 h-12 hover:bg-primary/90">
              Fechar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
