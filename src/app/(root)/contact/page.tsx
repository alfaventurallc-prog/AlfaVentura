import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <main className="px-5 py-20 md:px-40">
      <div className="relative rounded-lg overflow-hidden shadow-lg mb-8">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3768.432998359574!2d72.94959377466759!3d19.17628124881776!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b8fbd9d16c65%3A0x5e09bd5cd819ce93!2sBilleshwar%20Tower%2C%20Mulund%2C%20Mulund%20West%2C%20Mumbai%2C%20Maharashtra%20400080!5e0!3m2!1sen!2sin!4v1756641428436!5m2!1sen!2sin"
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
          <p className="text-sm text-gray-600 mb-1">📍 Billeshwar Tower, Mulund West,</p>
          <p className="text-sm text-gray-600 mb-1">Mumbai, Maharashtra 400080</p>
          <p className="text-sm text-gray-600">📞 +91 7303940226 / +91 8384054004</p>
        </div>
      </div>
      <ContactForm />
    </main>
  );
}
