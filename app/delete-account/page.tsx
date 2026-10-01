import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Delete your account — IDLI",
  description:
    "How to delete your Idli account and the data linked to it, what is removed, and what may be kept.",
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

function List({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc space-y-1.5 pl-6">{children}</ul>;
}

function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="list-decimal space-y-1.5 pl-6">{children}</ol>;
}

const retention = [
  {
    data: "Encrypted backups containing your data",
    period: "Removed automatically within 30 days of deletion",
  },
  {
    data: "Records we must keep to meet legal, tax or security obligations, or to prevent fraud and abuse",
    period: "Kept only for as long as the law requires, then deleted",
  },
  {
    data: "Anonymised or aggregated data that cannot identify you",
    period: "May be kept for analytics",
  },
];

export default function DeleteAccountPage() {
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
          Delete your Idli account
        </h1>
        <p className="mt-4 leading-relaxed text-ink/80">
          Idli is a food discovery app operated by SOKFOS LLP.
        </p>
        <p className="mt-3 leading-relaxed text-ink/80">
          You can ask us to delete your Idli account and the data linked to it
          at any time. Follow the steps below.
        </p>

        <Section title="Option 1: Delete your account in the app">
          <Steps>
            <li>Open the Idli app and log in.</li>
            <li>Go to your Profile.</li>
            <li>Tap Settings.</li>
            <li>Tap Delete account and confirm.</li>
          </Steps>
          <p>
            Your account and data will be deleted within 30 days of your
            request.
          </p>
        </Section>

        <Section title="Option 2: Request deletion by email">
          <p>
            If you cannot access the app, you can also ask us to delete your
            account by email:
          </p>
          <Steps>
            <li>
              Send an email to{" "}
              <a
                href="mailto:support@idli.food?subject=Delete%20my%20Idli%20account"
                className="font-medium text-indigo hover:underline"
              >
                support@idli.food
              </a>{" "}
              from the email address linked to your Idli account. If you signed
              up with a phone number, include that number in the email.
            </li>
            <li>
              Use the subject line &ldquo;Delete my Idli account&rdquo;.
            </li>
            <li>
              We will confirm that the request came from you. We may ask you to
              verify your identity, for example by replying from your
              registered email or confirming a one-time code.
            </li>
            <li>
              Once verified, we will delete your account and data within 30
              days and send you a confirmation.
            </li>
          </Steps>
          <p className="rounded-xl border border-ink/10 bg-white/60 p-4">
            <strong>Note:</strong> Deleting your account is permanent. You will
            lose access to your profile, saved places and activity, and this
            cannot be undone.
          </p>
        </Section>

        <Section title="What data is deleted">
          <p>When your account is deleted, we permanently remove:</p>
          <List>
            <li>
              Your profile information (name, email address, phone number,
              profile photo)
            </li>
            <li>Your login credentials</li>
            <li>
              Your saved or favourite places, reviews and other activity in the
              app
            </li>
            <li>
              Location data collected through the app to show you nearby food
            </li>
            <li>Your preferences and app settings</li>
          </List>
        </Section>

        <Section title="What data may be kept, and for how long">
          <div className="overflow-hidden rounded-xl border border-ink/10 bg-white/60">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink/5 text-ink">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Data
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Retention
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {retention.map((row) => (
                  <tr key={row.data} className="align-top">
                    <td className="px-4 py-3">{row.data}</td>
                    <td className="px-4 py-3">{row.period}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Want to delete only some of your data?">
          <p>
            If you do not want to delete your whole account, you can ask us to
            delete specific data, such as your location history, by emailing{" "}
            <a
              href="mailto:support@idli.food"
              className="font-medium text-indigo hover:underline"
            >
              support@idli.food
            </a>{" "}
            and telling us which data you want removed.
          </p>
        </Section>

        <Section title="Questions?">
          <p>
            Contact us at{" "}
            <a
              href="mailto:support@idli.food"
              className="font-medium text-indigo hover:underline"
            >
              support@idli.food
            </a>
            . See also our{" "}
            <Link href="/privacy" className="font-medium text-indigo hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </Section>
      </div>
    </main>
  );
}
