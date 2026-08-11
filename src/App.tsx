import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider, useCart } from "@/contexts/CartContext";
import CartDrawer from "@/components/CartDrawer";
import CartFloatingButton from "@/components/CartFloatingButton";
import CheckoutModal from "@/components/CheckoutModal";
import Index from "./pages/Index.tsx";
import Catalog from "./pages/Catalog.tsx";
import Admin from "./pages/Admin.tsx";
import NotFound from "./pages/NotFound.tsx";
import OrderConfirmation from "./pages/OrderConfirmation.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import Tracking from "./pages/Tracking.tsx";
import ScrollToHash from "./components/ScrollToHash.tsx";

const queryClient = new QueryClient();

const GlobalCheckoutModal = () => {
  const { isCheckoutOpen, closeCheckout } = useCart();
  if (!isCheckoutOpen) return null;
  return <CheckoutModal onClose={closeCheckout} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToHash />
          <CartDrawer />
          <GlobalCheckoutModal />
          <CartFloatingButton />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/produto/:id" element={<ProductDetail />} />
            <Route path="/pedido-confirmado" element={<OrderConfirmation />} />
            <Route path="/rastreio" element={<Tracking />} />
            <Route path="/admin/*" element={<Admin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALLs "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;

