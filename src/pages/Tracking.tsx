import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { client } from "@/lib/sanity";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Truck, Calendar, MapPin, Package, CheckCircle, 
  Clock, AlertTriangle, ChevronRight, RefreshCw, Copy, Check
} from "lucide-react";

interface OrderData {
  orderId: string;
  status: string;
  trackingCode?: string;
  shippingLabelId?: string;
  payer: {
    name: string;
    email: string;
    cpf: string;
  };
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  items: Array<{
    productId: string;
    name: string;
    price: number;
    size: string;
    quantity: number;
  }>;
  shipping?: {
    method: string;
    price: number;
  };
  total: number;
}

interface TrackingEvent {
  status: string;
  message: string;
  created_at: string;
  local: string;
}

const Tracking = () => {
  const [searchParams] = useSearchParams();
  const [orderIdInput, setOrderIdInput] = useState("");
  const [verifyInput, setVerifyInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [trackingStatus, setTrackingStatus] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const runSearch = useCallback(async (targetOrderId: string, targetVerify: string) => {
    setLoading(true);
    setError(null);
    setOrder(null);
    setTrackingEvents([]);
    setTrackingStatus(null);
    setTrackingNumber(null);

    const cleanVerify = targetVerify.trim();
    const verifyCleanCpf = cleanVerify.replace(/\D/g, "");

    try {
      // Busca o pedido no Sanity filtrando por ID e Email/CPF do comprador
      const query = `*[_type == "order" && (orderId == $orderId || orderId == "EV-" + $orderId) && (payer.email == $verify || payer.cpf == $verify || payer.cpf == $verifyCleanCpf)][0]{
        orderId,
        status,
        trackingCode,
        shippingLabelId,
        payer,
        address,
        items,
        shipping,
        total
      }`;

      const data = await client.fetch(query, {
        orderId: targetOrderId.trim(),
        verify: cleanVerify,
        verifyCleanCpf: verifyCleanCpf
      });

      if (!data) {
        setError("Pedido não encontrado ou dados de verificação incorretos.");
        setLoading(false);
        return;
      }

      setOrder(data);

      // Se o pedido tiver código de rastreio ou ID do carrinho, busca as etapas na API do Melhor Envio
      const trackCode = data.shippingLabelId || data.trackingCode;
      if (trackCode) {
        try {
          const trackResponse = await fetch("/api/shipping/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ trackingCode: trackCode })
          });

          if (trackResponse.ok) {
            const trackData = await trackResponse.json();
            if (trackData.history && Array.isArray(trackData.history)) {
              setTrackingEvents(trackData.history);
            }
            if (trackData.status) {
              setTrackingStatus(trackData.status);
            }
            if (trackData.tracking) {
              setTrackingNumber(trackData.tracking);
            }
          }
        } catch (trackErr) {
          console.error("Erro ao buscar rastreamento da transportadora:", trackErr);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao buscar informações do pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = searchParams.get("id");
    const verify = searchParams.get("verify");
    if (id && verify) {
      setOrderIdInput(id);
      setVerifyInput(verify);
      runSearch(id, verify);
    }
  }, [searchParams, runSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdInput.trim() || !verifyInput.trim()) {
      setError("Preencha todos os campos.");
      return;
    }
    runSearch(orderIdInput, verifyInput);
  };

  const getStatusDetails = (status: string) => {
    const details: Record<string, { label: string; color: string; bg: string; icon: any }> = {
      pending: { label: "Aguardando Pagamento", color: "text-amber-600", bg: "bg-amber-50 border-amber-100", icon: Clock },
      paid: { label: "Pago & Confirmado", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100", icon: CheckCircle },
      shipped: { label: "Pedido Enviado", color: "text-blue-600", bg: "bg-blue-50 border-blue-100", icon: Truck },
      delivered: { label: "Pedido Entregue", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle },
      canceled: { label: "Pedido Cancelado", color: "text-rose-600", bg: "bg-rose-50 border-rose-100", icon: AlertTriangle }
    };
    return details[status] || { label: status, color: "text-slate-600", bg: "bg-slate-50 border-slate-100", icon: Package };
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] flex flex-col">
      <Header />

      <main className="flex-grow pt-28 pb-20 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Título */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold uppercase tracking-wider text-black font-display">
              Rastrear Pedido
            </h1>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Consulte o status de sua entrega em tempo real direto pela transportadora.
            </p>
          </div>

          {/* Card de Busca */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-700">
                    Número do Pedido
                  </label>
                  <Input
                    type="text"
                    value={orderIdInput}
                    onChange={(e) => setOrderIdInput(e.target.value)}
                    placeholder="Ex: EV-123456"
                    className="h-11 focus:ring-black/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-700">
                    E-mail ou CPF do comprador
                  </label>
                  <Input
                    type="text"
                    value={verifyInput}
                    onChange={(e) => setVerifyInput(e.target.value)}
                    placeholder="maria@email.com ou 000.000.000-00"
                    className="h-11 focus:ring-black/20"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-black text-white hover:bg-black/90 uppercase tracking-widest font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Buscar Rastreamento
                  </>
                )}
              </Button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-xl text-center text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}
          </div>

          {/* Resultado da Busca */}
          {order && (
            <div className="space-y-6">
              
              {/* Status Geral */}
              {(() => {
                const details = getStatusDetails(order.status);
                const Icon = details.icon;
                return (
                  <div className={`border p-5 rounded-2xl flex items-center justify-between ${details.bg}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-full bg-white shadow-sm ${details.color}`}>
                        <Icon size={22} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Status do Pedido</p>
                        <h4 className={`text-base font-extrabold ${details.color}`}>{details.label}</h4>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Código</p>
                      <h4 className="text-sm font-bold text-slate-800">#{order.orderId}</h4>
                    </div>
                  </div>
                );
              })()}

              {/* Rastreio da Transportadora (Timeline) */}
              <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-5">
                <h3 className="text-sm font-bold uppercase tracking-widest text-black border-b pb-2">
                  Histórico de Entrega
                </h3>

                {trackingNumber ? (
                  <div className="space-y-6">
                    {/* Código de rastreio para cópia */}
                    <div className="flex justify-between items-center bg-slate-50 border rounded-xl p-3 text-xs">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Código de Rastreamento</p>
                        <p className="font-mono text-slate-700 font-bold">{trackingNumber}</p>
                      </div>
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(trackingNumber || "");
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        variant="outline"
                        className="h-8 bg-white border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 text-[11px]"
                      >
                        {copied ? (
                          <>
                            <Check size={12} className="text-emerald-500" />
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

                    {/* Timeline de Eventos */}
                    <div className="relative border-l-2 border-slate-100 pl-6 ml-3 space-y-6 py-2">
                      {trackingEvents.length > 0 ? (
                        trackingEvents.map((event, idx) => (
                          <div key={idx} className="relative">
                            {/* Ponto indicador na linha */}
                            <span className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                              idx === 0 ? "border-black scale-110 shadow-sm" : "border-slate-300"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? "bg-black" : "bg-slate-300"}`} />
                            </span>

                            {/* Conteúdo do Evento */}
                            <div className="space-y-1">
                              <div className="flex justify-between items-baseline gap-2">
                                <h4 className={`text-xs font-bold ${idx === 0 ? "text-black text-sm" : "text-slate-700"}`}>
                                  {event.status}
                                </h4>
                                <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                                  {new Date(event.created_at).toLocaleString("pt-BR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 leading-normal">{event.message}</p>
                              {event.local && (
                                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <MapPin size={10} />
                                  {event.local}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="relative">
                          <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-black bg-white flex items-center justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-black" />
                          </span>
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-black">Aguardando postagem</h4>
                            <p className="text-xs text-slate-500">
                              A transportadora está aguardando o recebimento da encomenda física para atualizar os dados de trânsito.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-6 flex flex-col items-center justify-center text-center gap-3 bg-slate-50/50 border border-dashed rounded-xl">
                    <Package className="w-10 h-10 text-slate-300" />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-700">Aguardando Despacho</p>
                      <p className="text-[11px] text-slate-500 max-w-xs px-4">
                        O pagamento foi confirmado e a etiqueta de envio foi criada. Assim que postarmos o pacote, o código de rastreamento e as etapas de entrega aparecerão aqui!
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Resumo de Itens e Entrega */}
              <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-black border-b pb-2">
                  Resumo do Pedido
                </h3>

                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs text-slate-700">
                      <div>
                        <span className="font-semibold">{item.name}</span>
                        {item.size && <span className="text-slate-400 ml-1">({item.size})</span>}
                      </div>
                      <span className="font-medium text-slate-500 font-mono">
                        {item.quantity}x
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>Forma de Envio:</span>
                    <span className="font-medium text-slate-800">{order.shipping?.method || "Entrega"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Endereço de Entrega:</span>
                    <span className="font-medium text-slate-800 text-right max-w-xs">
                      {order.address.street}, {order.address.number}{order.address.complement && ` - ${order.address.complement}`} <br />
                      {order.address.neighborhood} - {order.address.city}/{order.address.state} <br />
                      CEP: {order.address.cep}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-3 mt-1 text-sm font-bold text-slate-900">
                    <span>Total Pago:</span>
                    <span className="font-black text-black">R$ {order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Tracking;
