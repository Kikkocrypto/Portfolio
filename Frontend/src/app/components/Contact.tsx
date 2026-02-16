import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { ScrollReveal } from '../../components/motion';
import { STAGGER } from '../../constants/motion';
import { useToast } from '../hooks/useToast.tsx';
import { submitContact, type ContactPayload } from '../api/contact';

const MAX_NAME_LENGTH = 255;
const MAX_EMAIL_LENGTH = 255;
const MAX_MESSAGE_LENGTH = 10000;

const INITIAL_FORM: ContactPayload & { website: string } = {
  name: '',
  email: '',
  message: '',
  website: '',
};

/** Email valida: almeno una @ e un punto dopo la @ (es. nome@dominio.com). */
function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const atIndex = trimmed.indexOf('@');
  if (atIndex === -1) return false;
  const afterAt = trimmed.slice(atIndex + 1);
  return afterAt.includes('.') && afterAt.indexOf('.') > 0;
}

export function Contact() {
  const { t } = useTranslation();
  const { showToast, Toast } = useToast();
  const abortRef = useRef<AbortController | null>(null);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{ name: boolean; email: boolean; message: boolean }>({
    name: false,
    email: false,
    message: false,
  });

  /** Email: validazione in tempo reale (attiva da primo carattere o da blur). */
  const emailValidationActive = touched.email || formData.email.length > 0;
  const emailValid = formData.email.trim() && isValidEmail(formData.email) && formData.email.length < MAX_EMAIL_LENGTH;

  const fieldErrors = {
    name:
      touched.name && !formData.name.trim()
        ? t('contact.validation.nameRequired')
        : touched.name && formData.name.trim().length < 2
          ? t('contact.validation.nameTooShort')
          : touched.name && formData.name.length >= MAX_NAME_LENGTH
            ? t('contact.validation.nameTooLong')
            : null,
    email: !emailValidationActive
      ? null
      : !formData.email.trim()
        ? t('contact.validation.emailRequired')
        : formData.email.length >= MAX_EMAIL_LENGTH
          ? t('contact.validation.emailTooLong')
          : !isValidEmail(formData.email)
            ? t('contact.validation.emailInvalid')
            : null,
    message:
      touched.message && !formData.message.trim()
        ? t('contact.validation.messageRequired')
        : touched.message && formData.message.trim().length < 10
          ? t('contact.validation.messageTooShort')
          : touched.message && formData.message.length >= MAX_MESSAGE_LENGTH
            ? t('contact.validation.messageTooLong')
            : null,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    setTouched({ name: true, email: true, message: true });
    const hasClientErrors =
      !formData.name.trim() ||
      formData.name.trim().length < 2 ||
      formData.name.length >= MAX_NAME_LENGTH ||
      !formData.email.trim() ||
      !isValidEmail(formData.email) ||
      formData.email.length >= MAX_EMAIL_LENGTH ||
      !formData.message.trim() ||
      formData.message.trim().length < 10 ||
      formData.message.length >= MAX_MESSAGE_LENGTH;
    if (hasClientErrors) return;

    abortRef.current = new AbortController();
    setLoading(true);

    try {
      await submitContact(
        {
          name: formData.name,
          email: formData.email,
          message: formData.message,
          website: formData.website || undefined,
        },
        abortRef.current.signal
      );

      showToast({
        message: t('contact.submitSuccess'),
        type: 'success',
        duration: 5000,
      });
      setFormData(INITIAL_FORM);
      setTouched({ name: false, email: false, message: false });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const errorKey = err instanceof Error ? err.message : 'UNKNOWN_ERROR';
      const messages: Record<string, string> = {
        API_NOT_CONFIGURED: t('contact.errors.apiNotConfigured'),
        VALIDATION_ERROR: t('contact.errors.validationError'),
        SERVER_ERROR: t('contact.errors.serverError'),
        SUBMIT_FAILED: t('contact.errors.submitFailed'),
        INVALID_RESPONSE_TYPE: t('contact.errors.invalidResponseType'),
        INVALID_JSON: t('contact.errors.invalidJson'),
        NETWORK_ERROR: t('contact.errors.networkError'),
        UNKNOWN_ERROR: t('contact.errors.unknownError'),
      };
      showToast({
        message: messages[errorKey] ?? messages.UNKNOWN_ERROR,
        type: 'error',
        duration: 6000,
      });
    } finally {
      if (!abortRef.current?.signal.aborted) {
        setLoading(false);
      }
      abortRef.current = null;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleBlur = (field: 'name' | 'email' | 'message') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const contactInfo = [
    { icon: Mail, label: t('contact.emailLabel'), value: 'damianofrancesco71@gmail.com', link: 'mailto:damianofrancesco71@gmail.com' },
    { icon: Phone, label: t('contact.phoneLabel'), value: '+39 329 242 3053', link: 'tel:+39329242305' },
    { icon: MapPin, label: t('contact.whereLabel'), value: 'Canosa di Puglia, Italia', link: null }
  ];

  return (
    <section id="contact" className="py-24 md:py-32 bg-gradient-to-br from-[#2C2416] via-[#3D3122] to-[#2C2416] text-[#FAF9F6] relative overflow-hidden">
      <Toast />

      {/* Subtle atmospheric elements */}
      <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-gradient-radial from-[#D4A574]/10 to-transparent blur-3xl"></div>
      <div className="absolute bottom-1/4 left-0 w-96 h-96 rounded-full bg-gradient-radial from-[#8B9DAF]/8 to-transparent blur-3xl"></div>

      {/* Texture */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="container mx-auto px-6 md:px-12 lg:px-16 relative">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="mb-20 max-w-3xl">
              <div className="inline-block h-px w-16 bg-[#D4A574] mb-6"></div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 leading-tight">
                {t('contact.title')}
              </h2>
              <p className="text-xl md:text-2xl text-[#FAF9F6]/70 font-light leading-relaxed">
                {t('contact.subtitle')}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Contact Info */}
            <div className="lg:col-span-5">
              <ScrollReveal delay={100}>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-light mb-8 tracking-wide">{t('contact.contactsTitle')}</h3>
                    <div className="space-y-6">
                      {contactInfo.map((info, idx) => {
                        const Icon = info.icon;
                        const content = (
                          <div className="flex items-start gap-4 p-5 border border-[#FAF9F6]/10 hover:border-[#FAF9F6]/20 transition-all duration-500 bg-white/5 backdrop-blur-sm hover-lift">
                            <div className="w-10 h-10 border border-[#D4A574]/30 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-4 h-4 text-[#D4A574]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-[#FAF9F6]/50 mb-1 tracking-wide">{info.label}</p>
                              <p className="text-[#FAF9F6] break-words">{info.value}</p>
                            </div>
                          </div>
                        );

                        return info.link ? (
                          <a key={idx} href={info.link} className="block">
                            {content}
                          </a>
                        ) : (
                          <div key={idx}>{content}</div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border border-[#FAF9F6]/10 p-8 bg-white/5 backdrop-blur-sm hover:border-[#FAF9F6]/20 transition-all duration-500">
                    <h4 className="font-normal mb-3 text-[#D4A574] tracking-wide">{t('contact.availability')}</h4>
                    <p className="text-[#FAF9F6]/70 leading-relaxed">
                      {t('contact.availabilityText')}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <ScrollReveal delay={200}>
                <form onSubmit={handleSubmit} className="relative space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-normal mb-3 tracking-wide text-[#FAF9F6]/70">
                      {t('contact.formName')}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={() => handleBlur('name')}
                      required
                      disabled={loading}
                      maxLength={255}
                      aria-invalid={!!fieldErrors.name}
                      aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                      className={`w-full px-5 py-4 bg-white/5 border text-[#FAF9F6] focus:outline-none focus:ring-2 transition-all backdrop-blur-sm placeholder:text-[#FAF9F6]/30 disabled:opacity-60 disabled:cursor-not-allowed ${
                        fieldErrors.name
                          ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30'
                          : 'border-[#FAF9F6]/10 focus:border-[#D4A574]/50 focus:ring-[#D4A574]/20'
                      }`}
                      placeholder={t('contact.placeholderName')}
                    />
                    {fieldErrors.name && (
                      <p id="name-error" className="mt-1.5 text-sm text-red-400" role="alert">
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-normal mb-3 tracking-wide text-[#FAF9F6]/70">
                      {t('contact.formEmail')}
                      {emailValid && (
                        <span id="email-valid" className="ml-2 text-emerald-400 text-xs font-normal" aria-live="polite">
                          ✓ {t('contact.validation.emailValid')}
                        </span>
                      )}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => handleBlur('email')}
                      required
                      disabled={loading}
                      maxLength={MAX_EMAIL_LENGTH}
                      aria-invalid={!!fieldErrors.email}
                      aria-describedby={fieldErrors.email ? 'email-error' : emailValid ? 'email-valid' : undefined}
                      className={`w-full px-5 py-4 bg-white/5 border text-[#FAF9F6] focus:outline-none focus:ring-2 transition-all backdrop-blur-sm placeholder:text-[#FAF9F6]/30 disabled:opacity-60 disabled:cursor-not-allowed ${
                        fieldErrors.email
                          ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30'
                          : emailValid
                            ? 'border-emerald-500/50 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                            : 'border-[#FAF9F6]/10 focus:border-[#D4A574]/50 focus:ring-[#D4A574]/20'
                      }`}
                      placeholder={t('contact.placeholderEmail')}
                    />
                    {fieldErrors.email && (
                      <p id="email-error" className="mt-1.5 text-sm text-red-400" role="alert">
                        {fieldErrors.email}
                      </p>
                    )}
                    {formData.email.length > 200 && (
                      <p className="mt-1.5 text-sm text-[#FAF9F6]/50" aria-live="polite">
                        {formData.email.length}/{MAX_EMAIL_LENGTH}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-normal mb-3 tracking-wide text-[#FAF9F6]/70">
                      {t('contact.formMessage')}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      onBlur={() => handleBlur('message')}
                      required
                      disabled={loading}
                      rows={6}
                      maxLength={10000}
                      aria-invalid={!!fieldErrors.message}
                      aria-describedby={fieldErrors.message ? 'message-error' : undefined}
                      className={`w-full px-5 py-4 bg-white/5 border text-[#FAF9F6] focus:outline-none focus:ring-2 transition-all resize-none backdrop-blur-sm placeholder:text-[#FAF9F6]/30 disabled:opacity-60 disabled:cursor-not-allowed ${
                        fieldErrors.message
                          ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30'
                          : 'border-[#FAF9F6]/10 focus:border-[#D4A574]/50 focus:ring-[#D4A574]/20'
                      }`}
                      placeholder={t('contact.placeholderMessage')}
                    />
                    {fieldErrors.message && (
                      <p id="message-error" className="mt-1.5 text-sm text-red-400" role="alert">
                        {fieldErrors.message}
                      </p>
                    )}
                  </div>

                  {/* Honeypot: nascosto, lasciare vuoto. Se compilato = bot → backend risponde 201 ma non salva. */}
                  <div className="absolute -left-[9999px] w-1 h-1 overflow-hidden" aria-hidden="true">
                    <label htmlFor="website">Website</label>
                    <input
                      type="text"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full px-7 py-4 bg-[#FAF9F6] text-[#2C2416] hover:bg-white transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover-lift disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        <span className="font-normal tracking-wide">{t('contact.submitSending')}</span>
                      </>
                    ) : (
                      <>
                        <span className="font-normal tracking-wide">{t('contact.submit')}</span>
                        <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </button>
                </form>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
