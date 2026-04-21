import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
  return (
    <div className="pt-32 pb-20 px-6 max-w-[2560px] mx-auto">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6 text-black">Contact Us</h1>
          <p className="text-black text-lg max-w-2xl mx-auto">
            Have questions or feedback? We'd love to hear from you. Our team is here to help.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div className="space-y-12">
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-black">Get in touch</h2>
              <p className="text-black leading-relaxed">
                Fill out the form and our team will get back to you within 24 hours.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-black">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-black">Email</p>
                  <p className="text-black">hello@aipromp.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-black">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-black">Phone</p>
                  <p className="text-black">+1 (555) 000-0000</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-black">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-black">Office</p>
                  <p className="text-black">123 AI Street, Tech City, TC 12345</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 p-8 md:p-12 rounded-[32px] border border-gray-100">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-black ml-1">First Name</label>
                  <input
                    type="text"
                    placeholder="John"
                    className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:border-black outline-none transition-all text-black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-black ml-1">Last Name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:border-black outline-none transition-all text-black"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-black ml-1">Email Address</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:border-black outline-none transition-all text-black"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-black ml-1">Message</label>
                <textarea
                  placeholder="How can we help you?"
                  rows={4}
                  className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:border-black outline-none transition-all text-black resize-none"
                />
              </div>

              <button className="w-full py-4 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all group">
                <span>Send Message</span>
                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
