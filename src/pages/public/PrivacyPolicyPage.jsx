import { Link } from 'react-router-dom';
import { Bullet, Numbered, PageHero, Prose, Section, useScrollTop } from '../../components/site/blocks';

const EFFECTIVE = 'Last updated 1 January 2026';

export function PrivacyPolicyPage() {
  useScrollTop();

  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        intro="How Coloan collects, uses, stores and protects your personal information, and what you can require us to do with it."
      >
        <p className="mt-6 text-sm text-gray-500">{EFFECTIVE}</p>
      </PageHero>

      <Prose>
        <Section title="1. Who we are">
          <p>
            Coloan operates a collateral-backed lending platform. In this policy, &ldquo;Coloan&rdquo;,
            &ldquo;we&rdquo;, &ldquo;us&rdquo; and &ldquo;our&rdquo; mean the entity that operates this platform, and
            &ldquo;you&rdquo; means a prospective applicant, registered borrower, or any administrator who
            uses the platform in that capacity.
          </p>
          <p>
            This policy describes the platform as it operates today, which means the application
            itself, the database behind it, and the records our administrators create when they
            review your account. Where we say a document is &ldquo;private&rdquo;, we mean it is stored in
            the application database and is served only to your account and to named administrators
            performing a review.
          </p>
        </Section>

        <Section title="2. What we collect">
          <Numbered
            items={[
              { title: 'Information you give us', children: (
                <>
                  <p>Your name, email address, password (stored only as a bcrypt hash), date of birth, phone number, postal address, occupation, and any business information you choose to provide.</p>
                  <p>We do not ask for and you should not send us card numbers, bank PINs, passwords to other services, or the contents of documents unrelated to your application.</p>
                </>
              ) },
              { title: 'Documents you upload', children: (
                <p>Identity documents, proof of address, proof of ownership, evidence attached to a loan application, and an optional profile photograph. Each upload is stored with its filename, media type, byte size, upload timestamp, review status, and — once reviewed — the reviewing administrator and verification timestamp. The file contents are retained for as long as we need them for verification, servicing and any dispute or audit obligation.</p>
              ) },
              { title: 'Financial and collateral information', children: (
                <p>Loan requests, requested and approved amounts, tenures, interest rates, collateral type and description, quantity, weight, your declared value, ownership information, the value we assign on appraisal, and repayment schedules.</p>
              ) },
              { title: 'Payment information', children: (
                <p>Repayment amounts, dates, method, bank references you provide, and the recorded outcome of reconciliation. We do not store full card numbers or bank credentials; a payment method is identified by its type and your reference.</p>
              ) },
              { title: 'Technical and security information', children: (
                <p>Your IP address, browser user agent, authentication events, account status changes, and the administrative actions taken on your account. Administrative actions are recorded in an append-only audit trail.</p>
              ) },
              { title: 'Notifications', children: (
                <p>Notifications generated for you — for example that your profile was submitted, that collateral was verified, or that a payment needs attention — including whether and when you marked them read.</p>
              ) },
            ]}
          />
        </Section>

        <Section title="3. Why we use it, and on what basis">
          <p>We process personal information for the following purposes:</p>
          <div className="space-y-3">
            <Bullet><strong>Identity verification and account approval.</strong> Without your documents we cannot establish who you are or that you own the asset you have pledged, so we cannot lend. New accounts remain pending until a reviewer approves them.</Bullet>
            <Bullet><strong>Credit and collateral assessment.</strong> To appraise the pledged asset, decide whether to approve, and set terms that reflect the appraised value rather than the declared value.</Bullet>
            <Bullet><strong>Servicing your loan.</strong> To generate and present your repayment schedule, record payments, reconcile them against bank references, and calculate what remains outstanding.</Bullet>
            <Bullet><strong>Legal and regulatory compliance.</strong> To meet our obligations as a lender, to retain records we are required to keep, and to answer valid legal process.</Bullet>
            <Bullet><strong>Security and fraud prevention.</strong> To detect credential stuffing, account takeover, document reuse, or attempts to obtain funds against unverified collateral.</Bullet>
            <Bullet><strong>Service communications.</strong> To notify you about decisions, requests for updated documents, payment status, and security events on your account.</Bullet>
            <Bullet><strong>Improving the platform.</strong> In aggregate form only, to understand which parts of the application are slow or broken. We do not use your documents or financial details to train models.</Bullet>
          </div>
          <p>
            Where we rely on consent, you may withdraw it at any time. Consent is not the basis we
            use for identity verification or for meeting our legal obligations — those are
            necessary to enter into and service a lending relationship. Withdrawing consent for
            anything optional will not affect a loan already in force.
          </p>
        </Section>

        <Section title="4. How long we keep it">
          <Numbered
            items={[
              { title: 'If your application is declined or withdrawn', children: <p>We keep your record for a limited period so that you can ask us to reconsider and so we can defend a decision, then delete or irreversibly anonymise it.</p> },
              { title: 'If you are an active or former borrower', children: <p>We keep identity, collateral and loan records for the full life of the loan and afterwards for as long as our legal and tax obligations require, including the period in which a debt could be enforced. Repayment records are retained even once a loan is closed.</p> },
              { title: 'Uploaded documents', children: <p>Documents supporting a live loan are retained for the life of that loan. Documents that were never needed — for example an upload that was rejected or replaced — are deleted once we no longer have a reason to keep them.</p> },
              { title: 'Security and audit records', children: <p>Authentication events and administrative actions are retained on a longer cycle than operational data, so that we can investigate an incident years later.</p> },
            ]}
          />
        </Section>

        <Section title="5. Who we share it with">
          <p>We do not sell personal information. We share it only where necessary, and never with advertisers or data brokers.</p>
          <div className="space-y-3">
            <Bullet><strong>Administrators of this platform.</strong> Reviewers and super administrators can see applicant details and open documents in order to assess and service accounts. Their actions are logged.</Bullet>
            <Bullet><strong>Service providers.</strong> Our database and hosting providers process data on our instructions under contractual confidentiality and security obligations. They may not use your data for their own purposes.</Bullet>
            <Bullet><strong>Payment and banking partners.</strong> To confirm that a payment you submitted actually settled, and to trace a reference where it does not match.</Bullet>
            <Bullet><strong>Professional advisers.</strong> Auditors, accountants and lawyers, under professional duty of confidence.</Bullet>
            <Bullet><strong>Law enforcement and regulators.</strong> Where we are legally obliged to disclose, or where disclosure is necessary to prevent fraud or protect the security of the platform. Where we can, we will tell you first unless prohibited.</Bullet>
            <Bullet><strong>A buyer in a corporate transaction.</strong> If we sell or merge, your information may transfer to the successor entity, which will be bound by this policy.</Bullet>
          </div>
          <p>
            We do not disclose the name or documents of a borrower to another borrower, and we do
            not disclose one applicant's details to another applicant.
          </p>
        </Section>

        <Section title="6. Your documents are treated as sensitive">
          <p>
            Identity documents, proof of ownership and collateral photographs are treated as
            sensitive regardless of how they were submitted. In particular:
          </p>
          <div className="space-y-3">
            <Bullet>They are stored as records inside the application database, not in a publicly addressable location. A document cannot be retrieved by guessing a URL.</Bullet>
            <Bullet>Access is limited to your own account and to named administrators reviewing your file, and every retrieval is recorded.</Bullet>
            <Bullet>They are served over encrypted connections only.</Bullet>
            <Bullet>They are never shown to another applicant or borrower, and never used for marketing.</Bullet>
          </div>
        </Section>

        <Section title="7. How we protect it">
          <p>Security controls we apply include:</p>
          <div className="space-y-3">
            <Bullet>Passwords are hashed with bcrypt and are never stored, logged or transmitted in plain text.</Bullet>
            <Bullet>All traffic is served over TLS; session tokens expire automatically and are invalidated on sign-out.</Bullet>
            <Bullet>Authorisation is enforced per record, so a borrower cannot read another borrower's documents by changing an identifier in a request.</Bullet>
            <Bullet>Administrative actions are captured in an append-only audit trail with the acting account, timestamp, and request metadata.</Bullet>
            <Bullet>Uploads are restricted by type and size, and scanned before they are stored.</Bullet>
          </div>
          <p>
            No system is perfectly secure. If a breach affects your personal information we will
            notify you and the relevant authority without undue delay and explain what we know and
            what we are doing about it.
          </p>
        </Section>

        <Section title="8. Your rights">
          <p>Subject to the law that applies to us, you can require us to:</p>
          <div className="space-y-3">
            <Bullet>Confirm what personal information we hold about you, and give you a copy.</Bullet>
            <Bullet>Correct anything inaccurate or incomplete — you can edit most of your profile yourself from the Profile &amp; KYC page.</Bullet>
            <Bullet>Delete information where we are not required to keep it. We cannot delete records we must retain for legal, tax or audit reasons, and we will tell you when that applies.</Bullet>
            <Bullet>Restrict or object to a particular use of your information, including any processing for marketing.</Bullet>
            <Bullet>Withdraw consent you have given, where consent is the basis we rely on.</Bullet>
            <Bullet>Receive certain information in a portable, machine-readable format.</Bullet>
            <Bullet>Complain to your data protection regulator if you believe we have handled your information improperly.</Bullet>
          </div>
          <p>
            To exercise any of these rights, use the contact details in the footer. We will verify
            your identity before acting, because the request itself creates a security risk — we
            will never change account details in response to an unverified email. We respond within
            the period the applicable law allows.
          </p>
        </Section>

        <Section title="9. Cookies and local storage">
          <p>
            This platform does not use advertising or cross-site tracking cookies. The browser
            storage it does use is limited to what is needed to keep you signed in:
          </p>
          <div className="table-container mt-4">
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Purpose</th><th>Lifetime</th></tr>
              </thead>
              <tbody>
                <tr><td className="font-medium">token</td><td>Holds your session so you do not have to sign in on every page change.</td><td>Cleared on sign-out</td></tr>
                <tr><td className="font-medium">user</td><td>Caches your name, role and status so navigation renders without a request on first paint.</td><td>Cleared on sign-out</td></tr>
              </tbody>
            </table>
          </div>
          <p>
            Because these are functional rather than tracking cookies, clearing your browser storage
            signs you out but does not delete anything we hold.
          </p>
        </Section>

        <Section title="10. Changes to this policy">
          <p>
            We update this policy when our practices change. The revised version is posted here
            with an updated date, and if a change materially affects how we use information you have
            already given us, we will notify you directly before it takes effect. Continuing to use
            the platform after a change means the updated policy applies from that date.
          </p>
        </Section>

        <Section title="11. How to reach us">
          <p>
            Use the email address or telephone number in the footer for any privacy question,
            access request or complaint. If you are not satisfied with our response, you have the
            right to escalate it to your local data protection authority.
          </p>
          <p>
            Related: our <Link to="/terms" className="text-emerald-700 font-medium hover:underline">Terms &amp; Conditions</Link>{' '}
            govern the lending relationship itself, and our{' '}
            <Link to="/about" className="text-emerald-700 font-medium hover:underline">About Us</Link>{' '}
            page describes how the platform works.
          </p>
        </Section>
      </Prose>
    </>
  );
}