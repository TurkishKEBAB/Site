import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { contactService } from '../services';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';

export default function Contact() {
  type FieldName = 'name' | 'email' | 'subject' | 'message';

  const { showToast } = useToast();
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  // --- ÇEVİRİ OBJESİ (TRANSLATIONS) ---
  const t = {
    tr: {
      pageTitle: "İletişime Geçin",
      pageSubtitle: "Yeni bir bulut mimarisi fikri konuşmak, açık kaynak projelere katkı sağlamak veya sadece 'Merhaba' demek için çekinmeden yazabilirsiniz.",
      formTitle: "Bana Mesaj Gönder",
      labels: {
        name: "Adınız Soyadınız",
        email: "E-posta Adresiniz",
        subject: "Konu",
        message: "Mesajınız"
      },
      placeholders: {
        name: "Adınız Soyadınız",
        email: "ornek@email.com",
        subject: "Hangi konuda konuşmak istersiniz?",
        message: "Mesajınızı buraya yazabilirsiniz..."
      },
      buttons: {
        sending: "Gönderiliyor...",
        send: "Mesajı Gönder"
      },
      validation: {
        nameMin: "Lütfen en az 2 karakter girin.",
        emailInvalid: "Lütfen geçerli bir e-posta adresi girin.",
        subjectMin: "Konu en az 3 karakter olmalı veya boş bırakılmalıdır.",
        messageMin: "Mesajınız en az 10 karakterden oluşmalıdır."
      },
      toast: {
        fixErrors: "Lütfen göndermeden önce hatalı alanları düzeltin.",
        success: "Mesajınız başarıyla gönderildi!",
        errorFallback: "Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin."
      },
      info: {
        title: "İletişim Bilgileri",
        email: "E-posta",
        phone: "Telefon",
        location: "Konum",
        locationValue: "İstanbul, Türkiye",
        responseTime: "Dönüş Süresi",
        responseTimeValue: "En geç 24 saat içinde dönüş yaparım."
      },
      promo: {
        title: "Yeni Projeler İçin Buradayım!",
        text: "Yazılım topluluklarında yer almayı, sektörden insanlarla tanışmayı ve network kurmayı her zaman çok sevmişimdir. Yeni bir iş birliği veya kahve eşliğinde teknoloji sohbeti için bana ulaşabilirsin."
      }
    },
    en: {
      pageTitle: "Get In Touch",
      pageSubtitle: "Feel free to drop a message to discuss a new cloud architecture idea, contribute to open-source projects, or just say 'Hi'.",
      formTitle: "Send Me a Message",
      labels: {
        name: "Full Name",
        email: "Email Address",
        subject: "Subject",
        message: "Your Message"
      },
      placeholders: {
        name: "John Doe",
        email: "example@email.com",
        subject: "What would you like to discuss?",
        message: "Write your message here..."
      },
      buttons: {
        sending: "Sending...",
        send: "Send Message"
      },
      validation: {
        nameMin: "Please enter at least 2 characters.",
        emailInvalid: "Please enter a valid email address.",
        subjectMin: "Subject must be at least 3 characters or left empty.",
        messageMin: "Your message must be at least 10 characters long."
      },
      toast: {
        fixErrors: "Please fix the highlighted errors before submitting.",
        success: "Your message has been sent successfully!",
        errorFallback: "Failed to send message. Please try again later."
      },
      info: {
        title: "Contact Information",
        email: "Email",
        phone: "Phone",
        location: "Location",
        locationValue: "Istanbul, Turkey",
        responseTime: "Response Time",
        responseTimeValue: "I usually reply within 24 hours."
      },
      promo: {
        title: "Open to New Projects!",
        text: "I've always loved being part of software communities, meeting industry professionals, and networking. You can reach out to me for a new collaboration or a tech chat over coffee."
      }
    }
  };

  const currentLang = language === 'en' ? 'en' : 'tr';
  const text = t[currentLang];

  const focusField = (field: FieldName) => {
    switch (field) {
      case 'name':
        nameRef.current?.focus();
        break;
      case 'email':
        emailRef.current?.focus();
        break;
      case 'subject':
        subjectRef.current?.focus();
        break;
      case 'message':
        messageRef.current?.focus();
        break;
      default:
        break;
    }
  };

  const validateField = (field: FieldName, value: string): string => {
    const trimmed = value.trim();

    switch (field) {
      case 'name':
        if (trimmed.length < 2) {
          return text.validation.nameMin;
        }
        break;
      case 'email':
        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/i.test(trimmed)) {
          return text.validation.emailInvalid;
        }
        break;
      case 'subject':
        if (trimmed && trimmed.length < 3) {
          return text.validation.subjectMin;
        }
        break;
      case 'message':
        if (trimmed.length < 10) {
          return text.validation.messageMin;
        }
        break;
      default:
        break;
    }

    return '';
  };

  const validateForm = () => {
    const newErrors: Partial<Record<FieldName, string>> = {};

    (Object.keys(formData) as FieldName[]).forEach((field) => {
      const errorMessage = validateField(field, formData[field]);
      if (errorMessage) {
        newErrors[field] = errorMessage;
      }
    });

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) {
      return;
    }

    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      const firstErrorField = Object.keys(formErrors)[0] as FieldName;
      focusField(firstErrorField);
      showToast('error', text.toast.fixErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await contactService.sendMessage(formData);
      showToast('success', response.message || text.toast.success);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setErrors({});
    } catch (error: any) {
      console.error('Contact form submission failed:', error);
      const apiMessage = error?.response?.data?.detail;
      showToast('error', apiMessage || text.toast.errorFallback);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const field = name as FieldName;

    setFormData((prev) => ({ ...prev, [field]: value }));

    const errorMessage = validateField(field, value);
    setErrors((prev) => {
      const next = { ...prev };
      if (errorMessage) {
        next[field] = errorMessage;
      } else {
        delete next[field];
      }
      return next;
    });
  };

  return (
    <div className="pt-24 pb-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="section-title bg-gradient-to-r from-primary-600 to-primary-600 bg-clip-text text-transparent">
            {text.pageTitle}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {text.pageSubtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <h2 className="text-2xl font-bold mb-6">{text.formTitle}</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  {text.labels.name}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  ref={nameRef}
                  required
                  {...(errors.name && { 'aria-invalid': true, 'aria-describedby': 'name-error' })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 outline-none transition"
                  placeholder={text.placeholders.name}
                />
                {errors.name && (
                  <p id="name-error" className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  {text.labels.email}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  ref={emailRef}
                  required
                  {...(errors.email && { 'aria-invalid': true, 'aria-describedby': 'email-error' })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 outline-none transition"
                  placeholder={text.placeholders.email}
                />
                {errors.email && (
                  <p id="email-error" className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  {text.labels.subject}
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  ref={subjectRef}
                  {...(errors.subject && { 'aria-invalid': true, 'aria-describedby': 'subject-error' })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 outline-none transition"
                  placeholder={text.placeholders.subject}
                />
                {errors.subject && (
                  <p id="subject-error" className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.subject}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  {text.labels.message}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  ref={messageRef}
                  {...(errors.message && { 'aria-invalid': true, 'aria-describedby': 'message-error' })}
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 outline-none transition resize-none"
                  placeholder={text.placeholders.message}
                />
                {errors.message && (
                  <p id="message-error" className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                {...(loading && { 'aria-busy': true })}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span
                      className="h-4 w-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin"
                      aria-hidden="true"
                    />
                    {text.buttons.sending}
                  </span>
                ) : (
                  text.buttons.send
                )}
              </button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">{text.info.title}</h2>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">{text.info.email}</h3>
                    <a href="mailto:yigitokur@ieee.org" className="text-primary-600 dark:text-primary-400 hover:underline">
                      yigitokur@ieee.org
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">{text.info.phone}</h3>
                    <a href="tel:+905355733873" className="text-primary-600 dark:text-primary-400 hover:underline">
                      +90 535 573 3873
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">{text.info.location}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{text.info.locationValue}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">{text.info.responseTime}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{text.info.responseTimeValue}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-600 to-primary-600 rounded-2xl shadow-xl p-8 text-white">
              <h3 className="text-xl font-bold mb-4">{text.promo.title}</h3>
              <p className="mb-6 opacity-90">
                {text.promo.text}
              </p>
              <div className="flex space-x-4">
                <a href="https://github.com/TurkishKEBAB" target="_blank" rel="noopener noreferrer" className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition" title="GitHub">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://www.linkedin.com/in/yiğit-okur-050b5b278" target="_blank" rel="noopener noreferrer" className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition" title="LinkedIn">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}