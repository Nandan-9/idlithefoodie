import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — IDLI",
  description:
    "How Idli collects, uses and protects your personal information, and the choices you have.",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-ink/80">
        {children}
      </div>
    </section>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="pt-2 font-semibold text-ink">{children}</h3>;
}

function List({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc space-y-1.5 pl-6">{children}</ul>;
}

export default function PrivacyPage() {
  return (
    <main className="flex-1 bg-cream">
      <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        <Link
          href="/"
          className="text-sm font-medium text-indigo hover:underline"
        >
          ← Back to Idli
        </Link>

        <h1 className="mt-6 font-display text-4xl font-bold text-ink sm:text-5xl">
          Idli Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-ink/60">Effective 30 September 2026</p>

        <Section title="Introduction">
          <p>
            Idli is a food discovery app for Android and iOS, owned and operated
            by SOKFOS LLP (&ldquo;SOKFOS&rdquo;, &ldquo;we&rdquo;,
            &ldquo;us&rdquo;, &ldquo;our&rdquo;). This Privacy Policy explains
            what personal information we collect when you use Idli, why we
            collect it, how we protect it, and the choices you have.
          </p>
          <p>
            By creating an account or using Idli, you agree to this Policy. If
            you do not agree, please do not use the app. This Policy applies to
            the Idli mobile apps and any related services that link to it.
          </p>
          <p>
            <strong>Effective date:</strong> 30 September 2026
          </p>
        </Section>

        <Section title="Information we collect">
          <p>
            We collect only what we need to run Idli and show you good food
            nearby.
          </p>
          <SubHeading>Information you give us</SubHeading>
          <List>
            <li>
              Account details when you log in or sign up, such as your name,
              phone number and/or email address, and any profile details you
              choose to add.
            </li>
            <li>
              Content you create in the app, such as reviews, ratings, saved
              places, photos and messages to our support team.
            </li>
          </List>
          <SubHeading>Information collected automatically</SubHeading>
          <List>
            <li>
              Live location: your device&rsquo;s precise location, used to show
              the best food near you in your feed (see &ldquo;Location
              data&rdquo; below).
            </li>
            <li>
              Device and technical data: device model, operating system, app
              version, language, IP address, crash logs and diagnostic data.
            </li>
            <li>
              Usage data: screens you view, places and dishes you open,
              searches, taps and how long you spend in the app.
            </li>
          </List>
          <SubHeading>Information from third parties</SubHeading>
          <p>
            If you sign in with a third-party account (for example Google or
            Apple), we receive the basic profile details that account shares
            with us, based on your permissions.
          </p>
        </Section>

        <Section title="How we use your information">
          <p>We use your information to:</p>
          <List>
            <li>Create and manage your account and let you log in securely.</li>
            <li>
              Show you the best food, restaurants and dishes near your current
              location, and rank and personalise your feed, including sponsored
              listings and advertisements.
            </li>
            <li>
              Operate, maintain, troubleshoot and improve Idli, including fixing
              crashes and bugs.
            </li>
            <li>
              Understand how the app is used so we can build better features.
            </li>
            <li>Respond to your questions, feedback and support requests.</li>
            <li>
              Send service messages such as security alerts and policy updates,
              and, where you have agreed, offers and promotions.
            </li>
            <li>
              Detect, prevent and investigate fraud, abuse and security
              incidents.
            </li>
            <li>
              Comply with applicable law and enforce our Terms of Use.
            </li>
          </List>
          <p>
            We process your personal data only on the basis of your consent, or
            for legitimate uses permitted by Indian law, such as complying with
            legal obligations.
          </p>
        </Section>

        <Section title="Location data">
          <p>
            Idli&rsquo;s core feature depends on your live location. When you
            allow location access, the app fetches your device&rsquo;s location
            to show food near you in the feed.
          </p>
          <List>
            <li>
              We ask for permission through your Android or iOS system prompt.
              You can allow it always, only while using the app, or not at all.
            </li>
            <li>
              You can turn location off at any time in your device settings.
              Idli will still open, but the feed will not be able to show food
              near you, and you may need to enter a location manually if that
              option is available.
            </li>
            <li>
              We use your location to serve nearby results and improve
              relevance. We do not sell your location data.
            </li>
            <li>
              We do not track your location in the background unless you have
              clearly allowed it and the app tells you why.
            </li>
          </List>
        </Section>

        <Section title="How we share information">
          <p>
            We do not sell your personal information. Idli shows advertisements,
            including paid promotions by hotels and other businesses. We use
            your approximate location and app activity to choose relevant ads
            and sponsored listings, and we do not give advertisers your name,
            contact details or precise location. We share your information only
            in these situations:
          </p>
          <List>
            <li>
              <strong>Service providers:</strong> companies that help us run
              Idli, such as cloud hosting, analytics, crash reporting, maps,
              authentication and messaging providers. They may use your data
              only to provide services to us and are bound by confidentiality
              and security obligations.
            </li>
            <li>
              <strong>Other users:</strong> content you choose to make public,
              such as reviews and your public profile name, is visible to other
              Idli users.
            </li>
            <li>
              <strong>Legal and safety reasons:</strong> where required by law,
              court order or government authority, or to protect the rights,
              safety and property of SOKFOS, our users or the public.
            </li>
            <li>
              <strong>Business transfers:</strong> if SOKFOS is involved in a
              merger, acquisition or sale of assets, your information may be
              transferred, and we will tell you if your data becomes subject to
              a different policy.
            </li>
            <li>
              <strong>With your consent:</strong> any other sharing that you
              have approved.
            </li>
          </List>
          <p>
            We may also share aggregated or de-identified data that cannot
            reasonably be used to identify you.
          </p>
        </Section>

        <Section title="Retention, security and your rights">
          <p>
            <strong>Data retention.</strong> We keep your information only as
            long as your account is active or as needed to provide Idli, meet
            legal obligations, resolve disputes and enforce our agreements. When
            you delete your account, we delete or anonymise your personal data
            within a reasonable period, except where the law requires us to keep
            it.
          </p>
          <p>
            <strong>Security.</strong> We use reasonable technical and
            organisational safeguards, such as encryption in transit and access
            controls, to protect your data. No system is completely secure, so
            we cannot guarantee absolute security.
          </p>
          <p>
            <strong>Children.</strong> Idli is not intended for children under
            18. We do not knowingly collect personal data from children. If you
            believe a child has given us data, contact us and we will delete it.
          </p>
          <p>
            <strong>Your rights.</strong> Under applicable Indian law, including
            the Digital Personal Data Protection Act, 2023, you may:
          </p>
          <List>
            <li>
              Ask for access to the personal data we hold about you and a
              summary of how it is processed.
            </li>
            <li>
              Ask us to correct or update inaccurate or incomplete data.
            </li>
            <li>Ask us to erase your data and delete your account.</li>
            <li>
              Withdraw your consent at any time, including location permission,
              without affecting earlier lawful processing.
            </li>
            <li>
              Nominate another person to exercise your rights if you die or
              become incapacitated.
            </li>
            <li>
              Raise a grievance with us, and if it is not resolved, complain to
              the Data Protection Board of India.
            </li>
          </List>
          <p>
            <strong>Grievance Officer.</strong> To exercise your rights or raise
            a concern, contact our Grievance Officer:
          </p>
          <List>
            <li>Name: A.D Dev Nandan</li>
            <li>
              Email:{" "}
              <a
                href="mailto:support@idli.food"
                className="text-indigo hover:underline"
              >
                support@idli.food
              </a>
            </li>
            <li>
              Address: SOKFOS LLP, Akhandadeepam, Vettnadu, Vattappara P.O,
              Venjangaramoodu, Trivandrum
            </li>
          </List>
          <p>
            We aim to acknowledge requests within 48 hours and resolve them
            within 30 days.
          </p>
          <p>
            <strong>Changes to this Policy.</strong> We may update this Policy
            from time to time. If we make material changes, we will notify you
            in the app or by other means before they take effect. Continued use
            of Idli after an update means you accept the revised Policy.
          </p>
          <p>
            <strong>Governing law.</strong> This Policy is governed by the laws
            of India.
          </p>
        </Section>
      </div>
    </main>
  );
}
