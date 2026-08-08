"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { FiCopy, FiMail, FiSend } from "react-icons/fi";

import { useToast } from "@/components/Toast";
import { contactContent, siteConfig, type Locale } from "@/content/site";
import { contactService } from "@/services/contactService";

import TurnstileWidget from "./TurnstileWidget";

type FieldName = "name" | "email" | "subject" | "message";

interface ContactFormProps {
  readonly locale: Locale;
  readonly captchaSiteKey?: string;
}

const getDraftKey = (locale: Locale) => `contact-form-draft:${locale}`;

export default function ContactForm({ locale, captchaSiteKey: captchaSiteKeyOverride }: ContactFormProps) {
  const text = contactContent[locale];
  const { showToast } = useToast();
  const captchaSiteKey =
    captchaSiteKeyOverride ?? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [submitError, setSubmitError] = useState("");
  const [validationNotice, setValidationNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState(false);
  const [captchaRenderKey, setCaptchaRenderKey] = useState(0);

  useEffect(() => {
    const savedDraft = window.localStorage.getItem(getDraftKey(locale));
    if (savedDraft) {
      try {
        setFormData(JSON.parse(savedDraft));
      } catch (error) {
        console.error("Failed to parse saved contact draft", error);
      }
    }
  }, [locale]);

  useEffect(() => {
    const draftKey = getDraftKey(locale);
    const hasContent = Object.values(formData).some((value) => value.trim().length > 0);

    if (hasContent) {
      window.localStorage.setItem(draftKey, JSON.stringify(formData));
      return;
    }

    window.localStorage.removeItem(draftKey);
  }, [formData, locale]);

  const messagePayload = useMemo(
    () =>
      `${text.fields.name}: ${formData.name}\n${text.fields.email}: ${formData.email}\n${text.fields.subject}: ${formData.subject || "-"}\n\n${formData.message}`.trim(),
    [formData, text.fields.email, text.fields.name, text.fields.subject],
  );

  const validateField = (field: FieldName, value: string): string => {
    const trimmed = value.trim();
    if (field === "name" && trimmed.length < 2) return text.validation.name;
    if (field === "email" && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/i.test(trimmed)) {
      return text.validation.email;
    }
    if (field === "subject" && trimmed && trimmed.length < 3) {
      return text.validation.subject;
    }
    if (field === "message" && trimmed.length < 10) return text.validation.message;
    return "";
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<FieldName, string>> = {};
    (Object.keys(formData) as FieldName[]).forEach((field) => {
      const nextError = validateField(field, formData[field]);
      if (nextError) nextErrors[field] = nextError;
    });
    return nextErrors;
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    const field = name as FieldName;

    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationNotice("");
    setErrors((prev) => {
      const next = { ...prev };
      const nextError = validateField(field, value);
      if (nextError) next[field] = nextError;
      else delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (loading) return;

    // A form the browser never sent is not an API outage, so it must not claim
    // one or offer the copy/mailto fallback.
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setSubmitError("");
      setValidationNotice(text.validationSummary);
      return;
    }

    setValidationNotice("");

    // Only block on a widget that is actually working. When Turnstile itself
    // fails (revoked site key, provider outage) the message is still delivered
    // to the admin inbox rather than the form sealing itself shut.
    if (captchaSiteKey && !captchaToken && !captchaError) {
      setSubmitError(text.captchaRequired);
      return;
    }

    setLoading(true);
    setSubmitError("");
    setCopied(false);

    try {
      const response = await contactService.sendMessage({
        ...formData,
        ...(captchaToken ? { captcha_token: captchaToken } : {}),
      });
      showToast("success", response.message || text.success);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setErrors({});
      setSubmitError("");
      setCaptchaToken("");
      setCaptchaError(false);
      setCaptchaRenderKey((value) => value + 1);
      window.localStorage.removeItem(getDraftKey(locale));
    } catch (error) {
      console.error("Contact form submission failed", error);
      setSubmitError(text.failure);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messagePayload);
      setCopied(true);
      showToast("success", locale === "tr" ? "Mesaj panoya kopyalandı." : "Message copied to clipboard.");
    } catch (error) {
      console.error("Failed to copy contact message", error);
      showToast("error", locale === "tr" ? "Mesaj kopyalanamadı." : "Unable to copy the message.");
    }
  };

  const mailtoHref = `mailto:${siteConfig.email}?subject=${encodeURIComponent(
    formData.subject || (locale === "tr" ? "Portfolyo iletişimi" : "Portfolio outreach"),
  )}&body=${encodeURIComponent(messagePayload)}`;

  const inputClass = (field: FieldName) =>
    `w-full px-4 py-3 rounded border ${
      errors[field] ? "border-red-400" : "border-gray-200 dark:border-dark-600"
    } bg-white dark:bg-dark-800/60 text-gray-900 dark:text-dark-50 placeholder-gray-400 dark:placeholder-dark-400 font-mono text-sm focus:outline-none focus:border-primary-400 transition-colors`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {(["name", "email", "subject"] as FieldName[]).map((field) => (
        <div key={field}>
          <label htmlFor={field} className="block font-mono text-xs tracking-wide text-gray-500 dark:text-dark-400 mb-1.5 uppercase">
            {text.fields[field]}
          </label>
          <input
            id={field}
            type={field === "email" ? "email" : "text"}
            name={field}
            value={formData[field]}
            onChange={handleChange}
            required={field !== "subject"}
            className={inputClass(field)}
            placeholder={text.placeholders[field]}
          />
          {errors[field] && (
            <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors[field]}</p>
          )}
        </div>
      ))}

      <div>
        <label htmlFor="message" className="block font-mono text-xs tracking-wide text-gray-500 dark:text-dark-400 mb-1.5 uppercase">
          {text.fields.message}
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={6}
          className={`${inputClass("message")} resize-none`}
          placeholder={text.placeholders.message}
        />
        {errors.message && (
          <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.message}</p>
        )}
      </div>

      {captchaSiteKey && (
        <div className="space-y-2">
          <TurnstileWidget
            key={`${captchaSiteKey}-${captchaRenderKey}`}
            siteKey={captchaSiteKey}
            onToken={(token) => {
              setCaptchaToken(token);
              setCaptchaError(false);
            }}
            onError={() => {
              setCaptchaToken("");
              setCaptchaError(true);
            }}
          />
          {captchaError && (
            <p className="text-xs text-gray-500 dark:text-dark-400">
              {text.captchaUnavailable}
            </p>
          )}
        </div>
      )}

      {validationNotice && (
        <p role="alert" className="text-sm text-red-500 dark:text-red-400">
          {validationNotice}
        </p>
      )}

      {submitError && (
        <div className="rounded border border-amber-400/30 bg-amber-400/10 p-4 space-y-3">
          <p className="text-sm text-amber-700 dark:text-amber-300">{submitError}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleCopy} className="btn-secondary text-xs">
              <FiCopy size={12} />
              {copied ? (locale === "tr" ? "Kopyalandı" : "Copied") : (locale === "tr" ? "Mesajı kopyala" : "Copy message")}
            </button>
            <a href={mailtoHref} className="btn-secondary text-xs">
              <FiMail size={12} />
              {locale === "tr" ? "E-posta taslağı aç" : "Open email draft"}
            </a>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full border-2 border-dark-950/40 border-t-transparent animate-spin" aria-hidden="true" />
            {text.sending}
          </span>
        ) : (
          <>
            <FiSend size={14} />
            {text.submit}
          </>
        )}
      </button>
    </form>
  );
}
