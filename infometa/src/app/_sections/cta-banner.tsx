import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { CTABannerText } from "./cta-banner-text";

export function CTABanner() {
  return (
    <section className="bg-primary py-20">
      <ScrollReveal>
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Ready to protect your brand?
          </h2>
          <CTABannerText />
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg"
              asChild
            >
              <Link href="/contact?subject=demo">Book a Free Demo</Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="border border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white font-semibold"
              asChild
            >
              <Link href="/pricing">See Pricing</Link>
            </Button>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
