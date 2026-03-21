import Link from "next/link";

import AnimatedSection from "@/components/AnimatedSection";
import { CornerFrame } from "@/components/ui";
import { uiDictionary, type Locale } from "@/content/site";

interface NotFoundPageProps {
  locale: Locale;
}

export default function NotFound({ locale }: NotFoundPageProps) {
  const text = uiDictionary[locale];

  return (
    <div className="pt-24 md:pt-32 pb-16">
      <div className="container-custom max-w-4xl">
        <AnimatedSection>
          <CornerFrame accent className="p-8 md:p-10">
            <span className="sys-label mb-4 block">// 404</span>
            <h1 className="font-display text-4xl font-bold tracking-tight text-gray-900 dark:text-dark-50 md:text-5xl">
              {text.notFoundTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-dark-300">
              {text.notFoundBody}
            </p>
            <div className="mt-8">
              <Link href="/" className="btn-primary">
                {text.notFoundAction}
              </Link>
            </div>
          </CornerFrame>
        </AnimatedSection>
      </div>
    </div>
  );
}
