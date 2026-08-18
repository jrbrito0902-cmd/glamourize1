import { MapPin, Mail, Clock, MessageCircle } from "lucide-react";

const ContactSection = () => {
  const contactDetails = [
    {
      icon: MapPin,
      label: "Endereço",
      value: "Rua Tijuco Preto, 131 - Tatuapé, São Paulo - SP",
      href: "https://www.google.com/maps/place/Glamourize/@-23.5444327,-46.5769699,17z/data=!4m6!3m5!1s0x94ce5f7641dd9de3:0xbbf88274b344bb43!8m2!3d-23.5444376!4d-46.574395!16s%2Fg%2F11j79rxgkf?entry=ttu",
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: "(11) 94918-4803",
      href: "https://wa.me/5511949184803?text=Olá! Gostaria de saber mais sobre a Glamourize.",
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
      value: "Seg-Qui: 9:30 às 18:30 | Sex-Sáb: 9:30 às 19:00 | Dom: Fechado",
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
              title="Localização Glamourize"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.485121651322!2d-46.5769733!3d-23.5444376!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce5f7641dd9de3%3A0xbbf88274b344bb43!2sGlamourize!5e0!3m2!1spt-BR!2sbr!4v1710000000000"
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
