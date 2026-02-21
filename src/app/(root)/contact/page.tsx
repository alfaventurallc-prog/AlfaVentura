import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <main className="px-5 py-20 md:px-40">
      <div className="relative rounded-lg overflow-hidden shadow-lg mb-8">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3264.6083336423476!2d-106.55805988720398!3d35.09151769198945!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x87220a95517c54df%3A0x6e3d67eaab0b4f51!2s1209%20Mountain%20Rd%20Pl%20NE%20n%2C%20Albuquerque%2C%20NM%2087110%2C%20USA!5e0!3m2!1sen!2sin!4v1771677850470!5m2!1sen!2sin"
          width="100%"
          height="450"
          style={{
            border: 0,
            pointerEvents: "none",
          }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />

        {/* Business Info Overlay */}
        <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg w-80">
          <h3 className="font-bold text-gray-900 mb-2">Alfa Ventura</h3>
          <p className="text-sm text-gray-600 mb-1">📍 1209 Mountain Road Place Northeast STE N,</p>
          <p className="text-sm text-gray-600 mb-1">Albuquerque, NM 87110, USA</p>
          <p className="text-sm text-gray-600">📞 +1 (480)791-5581</p>
        </div>
      </div>
      <ContactForm />
    </main>
  );
}
