import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FiMail, FiPhone, FiMapPin, FiClock, FiGithub, FiLinkedin, FiSend } from 'react-icons/fi'
import { contactService } from '../services'
import { useToast } from '../components/Toast'
import { useLanguage } from '../contexts/LanguageContext'
import { CornerFrame, PanelCard, StatusDot } from '../components/ui'

export default function Contact() {
  type FieldName = 'name' | 'email' | 'subject' | 'message'

  const { showToast } = useToast()
  const { language } = useLanguage()
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({})

  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const subjectRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)

  const t = {
    tr: {
      pageLabel: 'KANAL',
      pageTitle: 'Iletisime Gecin',
      pageSubtitle: 'Yazilim muhendisligi, enterprise backend, cloud/DevOps veya proje is birlikleri icin benimle iletisime gecebilirsiniz.',
      formLabel: 'MESAJ',
      formTitle: 'Bana Mesaj Gonderin',
      labels: { name: 'Adiniz Soyadiniz', email: 'E-posta Adresiniz', subject: 'Konu', message: 'Mesajiniz' },
      placeholders: { name: 'Adiniz Soyadiniz', email: 'ornek@email.com', subject: 'Hangi konuda konusmak istersiniz?', message: 'Mesajinizi buraya yazabilirsiniz...' },
      buttons: { sending: 'Gonderiliyor...', send: 'Mesaji Gonder' },
      validation: { nameMin: 'Lutfen en az 2 karakter girin.', emailInvalid: 'Lutfen gecerli bir e-posta adresi girin.', subjectMin: 'Konu en az 3 karakter olmali veya bos birakilmalidir.', messageMin: 'Mesajiniz en az 10 karakterden olusmalidir.' },
      toast: { fixErrors: 'Lutfen gondermeden once hatali alanlari duzeltin.', success: 'Mesajiniz basariyla gonderildi!', errorFallback: 'Mesaj gonderilemedi. Lutfen daha sonra tekrar deneyin.' },
      infoLabel: 'BILGILER',
      info: { title: 'Iletisim Bilgileri', email: 'E-posta', phone: 'Telefon', location: 'Konum', locationValue: 'Istanbul, Turkiye', responseTime: 'Donus Suresi', responseTimeValue: 'Genellikle 24 saat icinde donus yaparim.' },
      promoTitle: 'Yeni Muhendislik Is Birliklerine Acigim',
      promoText: 'Ozellikle backend sistemleri, cloud-native mimari, otomasyon ve urunlestirme odakli projelerde teknik katki ve ekip calismasina acigim.',
    },
    en: {
      pageLabel: 'CHANNEL',
      pageTitle: 'Get In Touch',
      pageSubtitle: 'Reach out for software engineering, enterprise backend, cloud/DevOps, or project collaboration opportunities.',
      formLabel: 'MESSAGE',
      formTitle: 'Send Me a Message',
      labels: { name: 'Full Name', email: 'Email Address', subject: 'Subject', message: 'Your Message' },
      placeholders: { name: 'John Doe', email: 'example@email.com', subject: 'What would you like to discuss?', message: 'Write your message here...' },
      buttons: { sending: 'Sending...', send: 'Send Message' },
      validation: { nameMin: 'Please enter at least 2 characters.', emailInvalid: 'Please enter a valid email address.', subjectMin: 'Subject must be at least 3 characters or left empty.', messageMin: 'Your message must be at least 10 characters long.' },
      toast: { fixErrors: 'Please fix the highlighted errors before submitting.', success: 'Your message has been sent successfully!', errorFallback: 'Failed to send message. Please try again later.' },
      infoLabel: 'DETAILS',
      info: { title: 'Contact Information', email: 'Email', phone: 'Phone', location: 'Location', locationValue: 'Istanbul, Turkey', responseTime: 'Response Time', responseTimeValue: 'I usually respond within 24 hours.' },
      promoTitle: 'Open to Engineering Collaborations',
      promoText: 'I am open to collaboration on backend systems, cloud-native architecture, automation pipelines, and product-focused software delivery.',
    },
  }

  const currentLang = language === 'en' ? 'en' : 'tr'
  const text = t[currentLang]

  const focusField = (field: FieldName) => {
    const refs: Record<FieldName, React.RefObject<HTMLInputElement | HTMLTextAreaElement>> = { name: nameRef, email: emailRef, subject: subjectRef, message: messageRef }
    ;(refs[field]?.current as HTMLElement | null)?.focus()
  }

  const validateField = (field: FieldName, value: string): string => {
    const trimmed = value.trim()
    if (field === 'name' && trimmed.length < 2) return text.validation.nameMin
    if (field === 'email' && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/i.test(trimmed)) return text.validation.emailInvalid
    if (field === 'subject' && trimmed && trimmed.length < 3) return text.validation.subjectMin
    if (field === 'message' && trimmed.length < 10) return text.validation.messageMin
    return ''
  }

  const validateForm = () => {
    const newErrors: Partial<Record<FieldName, string>> = {}
    ;(Object.keys(formData) as FieldName[]).forEach((field) => {
      const err = validateField(field, formData[field])
      if (err) newErrors[field] = err
    })
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    const formErrors = validateForm()
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      focusField(Object.keys(formErrors)[0] as FieldName)
      showToast('error', text.toast.fixErrors)
      return
    }
    setLoading(true)
    try {
      const response = await contactService.sendMessage(formData)
      showToast('success', response.message || text.toast.success)
      setFormData({ name: '', email: '', subject: '', message: '' })
      setErrors({})
    } catch (error: any) {
      showToast('error', error?.response?.data?.detail || text.toast.errorFallback)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const field = name as FieldName
    setFormData((prev) => ({ ...prev, [field]: value }))
    const err = validateField(field, value)
    setErrors((prev) => { const next = { ...prev }; if (err) next[field] = err; else delete next[field]; return next })
  }

  const inputClass = (field: FieldName) =>
    `w-full px-4 py-3 rounded border ${errors[field] ? 'border-red-400' : 'border-gray-200 dark:border-dark-600'} bg-white dark:bg-dark-800/60 text-gray-900 dark:text-dark-50 placeholder-gray-400 dark:placeholder-dark-400 font-mono text-sm focus:outline-none focus:border-primary-400 transition-colors`

  return (
    <div className="pt-24 md:pt-32 pb-16">
      <div className="container-custom">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <span className="sys-label mb-3 block">// {text.pageLabel}</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-dark-50 tracking-tight mb-4">{text.pageTitle}</h1>
          <p className="text-lg text-gray-600 dark:text-dark-300 max-w-2xl">{text.pageSubtitle}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <CornerFrame accent className="p-6 md:p-8">
              <span className="sys-label mb-4 block">// {text.formLabel}</span>
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-dark-50 mb-6">{text.formTitle}</h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {(['name', 'email', 'subject'] as FieldName[]).map((field) => (
                  <div key={field}>
                    <label htmlFor={field} className="block font-mono text-xs tracking-wide text-gray-500 dark:text-dark-400 mb-1.5 uppercase">
                      {text.labels[field]}
                    </label>
                    <input
                      type={field === 'email' ? 'email' : 'text'}
                      id={field}
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      ref={field === 'name' ? nameRef : field === 'email' ? emailRef : subjectRef}
                      required={field !== 'subject'}
                      {...(errors[field] && { 'aria-invalid': true, 'aria-describedby': `${field}-error` })}
                      className={inputClass(field)}
                      placeholder={text.placeholders[field]}
                    />
                    {errors[field] && <p id={`${field}-error`} className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors[field]}</p>}
                  </div>
                ))}

                <div>
                  <label htmlFor="message" className="block font-mono text-xs tracking-wide text-gray-500 dark:text-dark-400 mb-1.5 uppercase">
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
                    rows={5}
                    className={`${inputClass('message')} resize-none`}
                    placeholder={text.placeholders.message}
                  />
                  {errors.message && <p id="message-error" className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.message}</p>}
                </div>

                <button type="submit" disabled={loading} className="w-full btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed" {...(loading && { 'aria-busy': true })}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-dark-950/40 border-t-transparent animate-spin" aria-hidden="true" />
                      {text.buttons.sending}
                    </span>
                  ) : (
                    <><FiSend size={14} /> {text.buttons.send}</>
                  )}
                </button>
              </form>
            </CornerFrame>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
            <PanelCard>
              <span className="sys-label mb-4 block">// {text.infoLabel}</span>
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-dark-50 mb-5">{text.info.title}</h2>
              <div className="space-y-4">
                {[
                  { icon: FiMail, label: text.info.email, value: 'yigitokur@ieee.org', href: 'mailto:yigitokur@ieee.org' },
                  { icon: FiPhone, label: text.info.phone, value: '+90 535 573 3873', href: 'tel:+905355733873' },
                  { icon: FiMapPin, label: text.info.location, value: text.info.locationValue },
                  { icon: FiClock, label: text.info.responseTime, value: text.info.responseTimeValue },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="p-2 rounded border border-gray-200 dark:border-dark-600 text-primary-500">
                      <item.icon size={16} />
                    </div>
                    <div>
                      <h3 className="font-mono text-xs tracking-wide text-gray-500 dark:text-dark-400 uppercase">{item.label}</h3>
                      {item.href ? (
                        <a href={item.href} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">{item.value}</a>
                      ) : (
                        <p className="text-sm text-gray-700 dark:text-dark-200">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </PanelCard>

            <CornerFrame accent className="p-6">
              <StatusDot color="green" label="ACTIVE" />
              <h3 className="font-display text-lg font-bold text-gray-900 dark:text-dark-50 mt-3 mb-2">{text.promoTitle}</h3>
              <p className="text-sm text-gray-600 dark:text-dark-300 mb-4">{text.promoText}</p>
              <div className="flex gap-2">
                <a href="https://github.com/TurkishKEBAB" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded border border-gray-200 dark:border-dark-600 text-gray-500 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-400/40 transition-all" aria-label="GitHub">
                  <FiGithub size={16} />
                </a>
                <a href="https://www.linkedin.com/in/yigit-okur-050b5b278" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded border border-gray-200 dark:border-dark-600 text-gray-500 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-400/40 transition-all" aria-label="LinkedIn">
                  <FiLinkedin size={16} />
                </a>
              </div>
            </CornerFrame>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
