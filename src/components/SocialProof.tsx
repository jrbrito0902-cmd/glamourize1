import { useState, useEffect } from "react";
import { Eye, X } from "lucide-react";

const SocialProof = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    const STORAGE_KEY = "last_social_proof_view";
    const THREE_HOURS = 3 * 60 * 60 * 1000;
    const lastView = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();

    if (!lastView || now - parseInt(lastView) > THREE_HOURS) {
      // Configura o timer para mostrar após 3 segundos navegando
      const showTimer = setTimeout(() => {
        const randomCount = Math.floor(Math.random() * (23 - 7 + 1)) + 7;
        setViewerCount(randomCount);
        setIsVisible(true);
        localStorage.setItem(STORAGE_KEY, now.toString());
      }, 3000);

      // Configura o timer para sumir automaticamente após 8 segundos
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 11000);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 z-[70] animate-in slide-in-from-left duration-500">
      <div className="bg-white/90 backdrop-blur-md border border-primary/20 shadow-elevated rounded-2xl p-4 flex items-center gap-3 pr-10 relative group">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <Eye size={20} className="animate-pulse" />
        </div>
        <div>
          <p className="text-sm font-medium text-secondary">
            <span className="text-primary font-bold">{viewerCount} pessoas</span> estão vendo este catálogo agora.
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Alta procura nas últimas horas</p>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default SocialProof;
