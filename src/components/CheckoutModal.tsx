import { useState, useEffect } from "react";
import { X, Loader2, CheckCircle, AlertTriangle, ArrowLeft, Clock, Copy, Check } from "lucide-react";
import { Button } from "./ui/button";
import { useCart } from "@/contexts/CartContext";
import { urlFor, client } from "@/lib/sanity";
import { useNavigate } from "react-router-dom";
import PaymentBrick from "./PaymentBrick";

interface CheckoutModalProps {
  onClose: () => void;
}

type Step = "form" | "loading" | "payment" | "success" | "pending" | "error";

const CheckoutModal = ({ onClose }: CheckoutModalProps) => {
  const navigate = useNavigate();
  const { cart, total, grandTotal, selectedShipping, clearCart, destinationCep } = useCart();
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState({ name: "", email: "", cpf: "", phone: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [orderId] = useState(`EV-${Math.floor(100000 + Math.random() * 900000)}`);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [ticketUrl, setTicketUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Consulta em tempo real se o Pix foi pago enquanto o usuário está na tela de pendente
  useEffect(() => {
    if (step !== "pending") return;

    const interval = setInterval(async () => {
      try {
        const data = await client.fetch(
          `*[_type == "order" && orderId == $orderId][0]{ status }`,
          { orderId }
        );
        if (data && data.status === "paid") {
          setStep("success");
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Erro no polling de status:", err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [step, orderId]);

  const [address, setAddress] = useState({
    cep: destinationCep || "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });
  const [addressErrors, setAddressErrors] = useState<Partial<typeof address>>({});
  const [loadingCep, setLoadingCep] = useState(false);

  const handleCepBlur = async () => {
    const cleanCep = address.cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setAddress((prev) => ({
          ...prev,
          street: data.logradouro || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
        }));
        setAddressErrors((prev) => ({
          ...prev,
          cep: undefined,
          street: undefined,
          neighborhood: undefined,
          city: undefined,
          state: undefined,
        }));
      } else {
        setAddressErrors((prev) => ({ ...prev, cep: "CEP não encontrado" }));
      }
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
    } finally {
      setLoadingCep(false);
    }
  };

  useEffect(() => {
    const cleanCep = address.cep.replace(/\D/g, "");
    if (cleanCep.length === 8 && !address.street) {
      handleCepBlur();
    }
  }, []);

  const validate = () => {
    const errs: Partial<typeof form> = {};
    if (!form.name.trim()) errs.name = "Nome obrigatório";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "E-mail inválido";
    if (!form.cpf.trim() || form.cpf.replace(/\D/g, "").length !== 11)
      errs.cpf = "CPF inválido (11 dígitos)";
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 10)
      errs.phone = "Telefone inválido";
    setErrors(errs);

    const addrErrs: Partial<typeof address> = {};
    if (!address.cep.trim() || address.cep.replace(/\D/g, "").length !== 8)
      addrErrs.cep = "CEP inválido";
    if (!address.street.trim()) addrErrs.street = "Rua obrigatória";
    if (!address.number.trim()) addrErrs.number = "Número obrigatório";
    if (!address.neighborhood.trim()) addrErrs.neighborhood = "Bairro obrigatório";
    if (!address.city.trim()) addrErrs.city = "Cidade obrigatória";
    if (!address.state.trim()) addrErrs.state = "Estado obrigatório";
    setAddressErrors(addrErrs);

    return Object.keys(errs).length === 0 && Object.keys(addrErrs).length === 0;
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
          orderId: orderId,
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
    const shippingId = selectedShipping?.id;
    const shippingName = selectedShipping?.name;
    const shippingPrice = selectedShipping?.price;
    const itemsSnapshot = [...cart];
    const addressSnapshot = { ...address };
    const payerSnapshot = { ...form };

    fetch("/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        payer: payerSnapshot,
        items: itemsSnapshot,
        total: grandTotal,
        shippingFee: shippingPrice,
        shippingMethod: shippingName,
      }),
    }).catch((err) => console.error("Erro ao enviar e-mail:", err));

    // Salva o pedido no banco Sanity
    fetch("/api/order/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        status: paymentData.status === "approved" ? "paid" : "pending",
        payer: payerSnapshot,
        address: addressSnapshot,
        items: itemsSnapshot,
        shipping: {
          method: shippingName || "Entrega",
          price: shippingPrice || 0,
        },
        total: grandTotal,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Pedido salvo no Sanity:", data);
        
        // Adiciona ao carrinho do Melhor Envio apenas DEPOIS que o pedido foi criado no Sanity
        if (shippingId) {
          fetch("/api/order/shipping-label", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId,
              serviceId: shippingId,
              payer: payerSnapshot,
              address: addressSnapshot,
              items: itemsSnapshot,
              total: grandTotal,
            }),
          })
            .then((res) => res.json())
            .then((labelData) => console.log("Etiqueta enviada ao Melhor Envio:", labelData))
            .catch((err) => console.error("Erro ao gerar etiqueta no Melhor Envio:", err));
        }
      })
      .catch((err) => console.error("Erro ao salvar pedido no Sanity:", err));

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

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 10) {
      return digits.replace(/^(\d{2})(\d)/g, "($1) $2").replace(/(\d{4})(\d)/g, "$1-$2");
    }
    return digits.replace(/^(\d{2})(\d)/g, "($1) $2").replace(/(\d{5})(\d)/g, "$1-$2");
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
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: formatPhone(e.target.value) }))}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                    className={`w-full border rounded-lg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 transition-all ${
                      errors.phone ? "border-red-400 bg-red-50" : "border-slate-300"
                    }`}
                  />
                  {errors.phone && <p className="text-red-500 text-[11px] mt-0.5">{errors.phone}</p>}
                </div>

                {/* Endereço de Entrega */}
                <div className="border-t pt-4 mt-2 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Endereço de Entrega</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-700">CEP</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={address.cep}
                          onBlur={handleCepBlur}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 8);
                            const formatted = val.length > 5 ? `${val.slice(0, 5)}-${val.slice(5)}` : val;
                            setAddress((a) => ({ ...a, cep: formatted }));
                          }}
                          placeholder="00000-000"
                          maxLength={9}
                          className={`w-full border rounded-lg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 transition-all ${
                            addressErrors.cep ? "border-red-400 bg-red-50" : "border-slate-300"
                          }`}
                        />
                        {loadingCep && (
                          <div className="absolute right-3 top-2.5">
                            <Loader2 size={14} className="animate-spin text-slate-400" />
                          </div>
                        )}
                      </div>
                      {addressErrors.cep && <p className="text-red-500 text-[11px] mt-0.5">{addressErrors.cep}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-700">Bairro</label>
                      <input
                        type="text"
                        value={address.neighborhood}
                        onChange={(e) => setAddress((a) => ({ ...a, neighborhood: e.target.value }))}
                        placeholder="Centro"
                        className={`w-full border rounded-lg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 transition-all ${
                          addressErrors.neighborhood ? "border-red-400 bg-red-50" : "border-slate-300"
                        }`}
                      />
                      {addressErrors.neighborhood && <p className="text-red-500 text-[11px] mt-0.5">{addressErrors.neighborhood}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-700">Rua / Avenida</label>
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
                      placeholder="Av. Paulista"
                      className={`w-full border rounded-lg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 transition-all ${
                        addressErrors.street ? "border-red-400 bg-red-50" : "border-slate-300"
                      }`}
                    />
                    {addressErrors.street && <p className="text-red-500 text-[11px] mt-0.5">{addressErrors.street}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-700">Número</label>
                      <input
                        type="text"
                        value={address.number}
                        onChange={(e) => setAddress((a) => ({ ...a, number: e.target.value }))}
                        placeholder="1000"
                        className={`w-full border rounded-lg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 transition-all ${
                          addressErrors.number ? "border-red-400 bg-red-50" : "border-slate-300"
                        }`}
                      />
                      {addressErrors.number && <p className="text-red-500 text-[11px] mt-0.5">{addressErrors.number}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-700">Complemento (opcional)</label>
                      <input
                        type="text"
                        value={address.complement}
                        onChange={(e) => setAddress((a) => ({ ...a, complement: e.target.value }))}
                        placeholder="Apto 42"
                        className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-700">Cidade</label>
                      <input
                        type="text"
                        value={address.city}
                        onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                        placeholder="São Paulo"
                        className={`w-full border rounded-lg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 transition-all ${
                          addressErrors.city ? "border-red-400 bg-red-50" : "border-slate-300"
                        }`}
                      />
                      {addressErrors.city && <p className="text-red-500 text-[11px] mt-0.5">{addressErrors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-700">Estado (UF)</label>
                      <input
                        type="text"
                        value={address.state}
                        onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value.toUpperCase().slice(0, 2) }))}
                        placeholder="SP"
                        maxLength={2}
                        className={`w-full border rounded-lg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 transition-all ${
                          addressErrors.state ? "border-red-400 bg-red-50" : "border-slate-300"
                        }`}
                      />
                      {addressErrors.state && <p className="text-red-500 text-[11px] mt-0.5">{addressErrors.state}</p>}
                    </div>
                  </div>
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
                orderId={orderId}
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
              <Button 
                onClick={() => {
                  onClose();
                  navigate(`/rastreio?id=${orderId}&verify=${form.email}`);
                }} 
                className="mt-2 bg-black text-white rounded-xl px-8 h-11 hover:bg-black/90 text-sm font-bold uppercase tracking-wider"
              >
                Acompanhar Entrega →
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
