import { Link } from "react-router-dom";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const OrderConfirmation = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-24">
        <div className="text-center max-w-md mx-auto">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-14 h-14 text-green-500" />
            </div>
          </div>
          <h1 className="text-3xl font-display font-bold uppercase text-secondary mb-3">
            Pedido Confirmado!
          </h1>
          <p className="text-muted-foreground mb-2 text-lg">
            Obrigada pela sua compra 🎉
          </p>
          <p className="text-muted-foreground text-sm mb-8">
            Você receberá um e-mail de confirmação com os detalhes do seu pedido. Assim que o pagamento for aprovado, seu pedido será separado.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/catalog">
              <Button className="bg-primary hover:bg-primary/90 text-white h-12 px-8 rounded-full font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2">
                <ShoppingBag size={18} />
                Continuar Comprando
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="h-12 px-8 rounded-full font-bold border-primary/30 hover:bg-primary/5 text-primary hover:text-primary transition-all flex items-center gap-2">
                Voltar ao Início
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
