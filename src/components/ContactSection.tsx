import { MapPin, Mail, Clock, MessageCircle } from "lucide-react";

const ContactSection = () => {
  const contactDetails = [
    {
      icon: MapPin,
      label: "Endereço",
      value: "São Paulo, SP - Brasil",
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: "(11) 95450-5858",
      href: "https://wa.me/5511954505858?text=Olá! Gostaria de saber mais sobre os serviços da E-Estilo Modas.",
    },
    {
      icon: Mail,
      label: "Email",
      value: "eutimia.modas@hotmail.com",
      href: "mailto:eutimia.modas@hotmail.com",
    },
    {
      icon: Clock,
      label: "Horário",
      value: "Seg-Sex: 9h às 18h | Sáb: 9h às 13h",
    },
  ];

  return (
    <section id="contato" className="section-padding bg-muted">
      <div className="container max-w-5xl">
        <div className="text-center mb-16">
          <p className="text-primary font-body text-sm uppercase tracking-[0.3em] mb-3 font-medium">
            Fale conosco
          </p>
          <h2 className="heading-section">Entre em Contato</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Info */}
          <div className="space-y-6">
            {contactDetails.map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.label}
                  </p>
                  {"href" in item && item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-sm hover:underline font-medium"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {item.value}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Google Maps */}
          <div className="rounded-lg overflow-hidden shadow-card h-64">
            <iframe
              title="Localização Estilo Modas"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d467692.0488591707!2d-46.87529809999999!3d-23.6820635!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce448183a461d1%3A0x9ba94b08ff335bae!2sS%C3%A3o%20Paulo%2C%20SP!5e0!3m2!1spt-BR!2sbr!4v1710000000000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
