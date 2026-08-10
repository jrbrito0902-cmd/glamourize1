import { useState } from "react";
import { Truck, Loader2, Check } from "lucide-react";
import { useCart, ShippingOption } from "@/contexts/CartContext";

export const ShippingCalculator = () => {
  const { cart, destinationCep, setDestinationCep, selectedShipping, setSelectedShipping } = useCart();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  const formatCep = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length > 5) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    }
    return digits;
  };

  const handleCalculate = async (cepValue?: string) => {
    const targetCep = (cepValue || destinationCep).replace(/\D/g, "");
    if (targetCep.length !== 8) {
      setError("Digite um CEP válido de 8 dígitos");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/shipping/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cepDestino: targetCep,
          items: cart.map((item) => ({
            id: item.id,
            price: item.discountPrice || item.price,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Não foi possível consultar o frete.");
      }

      const data = await response.json();
      if (data.options && data.options.length > 0) {
        setOptions(data.options);
        // Seleciona a primeira opção por padrão se nenhuma foi selecionada
        if (!selectedShipping) {
          setSelectedShipping(data.options[0]);
        }
      } else {
        setError("Nenhuma opção de entrega encontrada para este CEP.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Erro ao calcular o frete. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
        <Truck size={18} className="text-black" />
        <span>Calcular Frete e Entrega</span>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={destinationCep}
          onChange={(e) => {
            const formatted = formatCep(e.target.value);
            setDestinationCep(formatted);
            if (formatted.replace(/\D/g, "").length === 8) {
              handleCalculate(formatted);
            }
          }}
          placeholder="00000-000"
          maxLength={9}
          className="flex-grow bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
        />
        <button
          onClick={() => handleCalculate()}
          disabled={loading || cart.length === 0}
          className="bg-black text-white hover:bg-black/80 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : "OK"}
        </button>
      </div>

      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

      {options.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Opções disponíveis para vestuário:</p>
          {options.map((opt) => {
            const isSelected = selectedShipping?.id === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setSelectedShipping(opt)}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? "border-black bg-white shadow-sm ring-1 ring-black"
                    : "border-slate-200 bg-white/70 hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? "border-black bg-black text-white" : "border-slate-400"
                    }`}
                  >
                    {isSelected && <Check size={10} />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{opt.name}</p>
                    <p className="text-slate-500 text-[11px]">
                      Chega em até {opt.custom_delivery_time} dias úteis
                    </p>
                  </div>
                </div>
                <span className="font-bold text-slate-900 text-sm">
                  R$ {opt.price.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShippingCalculator;
