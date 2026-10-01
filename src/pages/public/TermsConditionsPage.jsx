import { Link } from 'react-router-dom';
import { Bullet, Clause, Numbered, PageHero, Prose, Section, useScrollTop } from '../../components/site/blocks';

const EFFECTIVE = 'Last updated 1 January 2026';

export function TermsConditionsPage() {
  useScrollTop();

  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms & Conditions"
        intro="The rules that govern use of this platform and any loan we make. Read these before you register, and keep them — they form part of the agreement for every loan we approve."
      >
        <p className="mt-6 text-sm text-gray-500">{EFFECTIVE}</p>
      </PageHero>

      <Prose>
        <Section title="1. Agreement and acceptance">
          <p>
            By registering an account, uploading documents, or submitting a loan application through
            this platform, you agree to these Terms &amp; Conditions, to our{' '}
            <Link to="/privacy" className="text-emerald-700 font-medium hover:underline">Privacy Policy</Link>,
            and to any terms set out in the approval letter and loan schedule issued for a specific
            loan. If you do not accept these terms, do not use the platform.
          </p>
          <p>
            These terms apply alongside — and are subordinate to — any specific terms agreed in
            writing for an individual loan. Where a specific loan term conflicts with these general
            terms, the specific term prevails for that loan.
          </p>
        </Section>

        <Section title="2. Eligibility">
          <Numbered
            items={[
              { title: 'Legal capacity', children: <p>You must be at least 18 years old, of legal capacity in your jurisdiction, and able to enter a binding contract. You may not register on behalf of another person or entity.</p> },
              { title: 'Accuracy of information', children: <p>The information and documents you provide must be true, complete, current, and your own. Misleading information — including an inflated declared value or an asset you do not own — is a breach of these terms and may render any loan void and the debt immediately due.</p> },
              { title: 'One account per person', children: <p>You may maintain one account. Multiple accounts, or applications submitted with intent to obtain duplicate advances against the same asset, will be declined and referred for fraud review.</p> },
              { title: 'Sanctions and prohibited use', children: <p>You may not use the platform if you are subject to sanctions or a prohibition applicable where we operate, or if funds from the platform would be used for unlawful purposes. Funds may not be used for weapons, narcotics, human trafficking, or to settle obligations owed to us.</p> },
            ]}
          />
        </Section>

        <Section title="3. Account registration and security">
          <p>
            Your account begins in a pending state. You are not an approved borrower, and cannot
            sign in, until an administrator has reviewed your profile and verified your documents.
            We may decline, suspend or close an application or account at our discretion, and we are
            not required to give a reason, though we will normally tell you what we need.
          </p>
          <p>You are responsible for:</p>
          <div className="space-y-3">
            <Bullet>Keeping your password confidential and telling us immediately if you believe it has been compromised.</Bullet>
            <Bullet>All activity that occurs under your account. If you suspect unauthorised access, change your password and contact us.</Bullet>
            <Bullet>Signing out of shared or public devices. Sessions expire automatically after a period of inactivity, but that is not a substitute for signing out.</Bullet>
            <Bullet>Keeping your contact details current so we can reach you about a decision, an overdue installment, or a document request.</Bullet>
          </div>
          <p>
            We may require you to change your password, re-verify your identity, or re-submit
            documents at any time, including on request by an administrator.
          </p>
        </Section>

        <Section title="4. Identity verification and documents">
          <Clause title="What we require">
            <p>
              Registration requires at least one identity or ownership document. Approving a loan
              requires enough evidence for us to establish your identity, your address, your
              ownership of the pledged asset, and — where a product requires it — your income or
              business activity. We list the document types we ask for in your dashboard.
            </p>
          </Clause>
          <Clause title="Your representations">
            <p>Every document you upload must be:</p>
            <div className="space-y-3">
              <Bullet>Genuine, unaltered, and not password-protected.</Bullet>
              <Bullet>Current — not expired or superseded.</Bullet>
              <Bullet>Belonging to you, or to the business or asset you are pledging.</Bullet>
              <Bullet>Legally yours to submit. Do not upload documents belonging to another person.</Bullet>
            </div>
          </Clause>
          <Clause title="If a document is rejected">
            <p>
              A rejected or returned document comes with a stated reason. You must upload a
              replacement. Repeated submission of unacceptable documents may lead to suspension or
              closure of your account.
            </p>
          </Clause>
          <Clause title="Right to withhold">
            <p>
              We may decline to proceed with an application if, in our judgement, the documents are
              inconsistent with the other information supplied, appear to belong to another person,
              or give us reason to suspect fraud. A decision to decline carries no obligation to
              disclose the underlying reason in detail.
            </p>
          </Clause>
        </Section>

        <Section title="5. Your collateral">
          <Clause title="Declared value is your claim only">
            <p>
              When you submit an asset you state a declared value. We record it, but it is a claim
              and nothing more. The amount we may approve is determined by our independent
              appraisal of the asset, never by the figure you declared. We are not obliged to lend
              any proportion of either figure.
            </p>
          </Clause>
          <Clause title="Eligibility and appraisal">
            <p>
              You warrant that the asset is eligible, is not subject to any lien, charge, lease or
              third-party interest, and is not pledged as security for any other debt. We may
              require a physical inspection or third-party valuation. If the appraised value is
              lower than requested, we may approve a lower amount, approve a shorter tenure, decline
              the application, or withdraw it. You may withdraw your application at any point before
              funds are released.
            </p>
          </Clause>
          <Clause title="Custody and release">
            <p>
              Assets are held as security for the full life of the loan. When the loan is repaid in
              full, including all fees and interest, the asset moves to released status and is
              returned to you. If we sell or otherwise dispose of an asset following enforcement,
              the asset ceases to exist as collateral and we will account to you for the net
              proceeds in accordance with these terms.
            </p>
          </Clause>
          <Clause title="Risk in the asset">
            <p>
              You bear the risk of loss, theft, and depreciation of the pledged asset from the date
              it is pledged, unless we have expressly agreed otherwise in writing. Please hold
              appropriate insurance. If the asset is lost or destroyed, the loan does not
              automatically extinguish; we may require you to replace the asset or repay early.
            </p>
          </Clause>
        </Section>

        <Section title="6. Loan terms, interest and fees">
          <Clause title="What determines your terms">
            <p>
              Interest rate, approved amount, tenure, repayment frequency, origination fee, late
              fee, grace period and total payable are shown to you when an application is approved
              and are recorded in your repayment schedule. A loan is only advanced when you accept
              those terms.
            </p>
          </Clause>
          <Clause title="How we calculate">
            <p>
              Interest is calculated on the outstanding principal balance. Where a schedule applies
              fees, origination charges are itemised separately from interest so you can see the
              cost of borrowing separately from the cost of the facility.
            </p>
          </Clause>
          <Clause title="No variation without agreement">
            <p>
              We may change the terms applicable to a new application at any time. We may vary the
              terms of an existing loan only where the change is required by law or by a regulator,
              in which case we will notify you before the change takes effect.
            </p>
          </Clause>
          <Clause title="Prepayment">
            <p>
              You may repay early at any time. Any prepayment charge or fee that applies to your
              product is disclosed in your schedule; if none is stated, you may prepay without
              charge. Early repayment reduces the total interest you pay.
            </p>
          </Clause>
        </Section>

        <Section title="7. Repayments">
          <Numbered
            items={[
              { title: 'Pay on the due date', children: <p>Each installment has a due date and an itemised split between principal, interest and fees. Monthly, biweekly, quarterly and bullet structures are available depending on the product.</p> },
              { title: 'Pay by an approved method', children: <p>Bank transfer, card, cash and wallet payments are supported. Payments made through third parties are not accepted unless we agree in writing, and funds received from an unapproved source may be returned or held pending investigation.</p> },
              { title: 'Give us a reference', children: <p>Where a payment method requires a reference or transaction identifier, provide it. Without a reference we may be unable to identify your payment and it may delay reconciliation.</p> },
              { title: 'A submitted payment is pending', children: <p>When you submit a payment it is recorded as pending and does not reduce your outstanding balance immediately. An administrator reconciles it against the corresponding bank reference. Only once reconciled as successful does the balance reduce and the relevant schedule update.</p> },
              { title: 'Late payment', children: <p>Paying after the due date may incur the late fee stated in your schedule, may reduce your credit standing with us, and — if it persists — may trigger default. If you cannot pay an installment, contact us before the due date; we would rather agree a restructuring than enforce against your collateral.</p> },
            ]}
          />
          <p>
            Funds received are applied first to the oldest unpaid installment, and within an
            installment to fees, then interest, then principal, unless we agree otherwise.
          </p>
        </Section>

        <Section title="8. Default and enforcement">
          <p>You are in default if you fail to pay an amount when due, or breach any other material term.</p>
          <p>On default we may, subject to applicable law and the terms of your loan:</p>
          <div className="space-y-3">
            <Bullet>Charge late fees and other costs of recovering the debt.</Bullet>
            <Bullet>Require immediate repayment of the entire outstanding balance, accelerating any future installments.</Bullet>
            <Bullet>Suspend your account and any further access to the platform.</Bullet>
            <Bullet>Recover the pledged asset, following the applicable legal process and notice.</Bullet>
            <Bullet>Recover reasonable costs of enforcement, including legal fees.</Bullet>
            <Bullet>Report the default to a credit reference agency where the law permits.</Bullet>
          </div>
          <p>
            Enforcement is always subject to the law applying where the asset and you are located.
            Nothing in these terms removes any statutory right or remedy you have, and we will
            follow the required process before taking any enforcement step.
          </p>
        </Section>

        <Section title="9. Your acknowledgements">
          <p>You acknowledge and agree that:</p>
          <div className="space-y-3">
            <Bullet>Using this platform is entirely voluntary and you may stop at any time before funds are released.</Bullet>
            <Bullet>Submitting an application does not oblige us to lend, and an approval may be withdrawn before funds are released if we discover a material inaccuracy or a problem with the collateral.</Bullet>
            <Bullet>Nothing on this site is a credit offer, financial promotion, or advice tailored to your circumstances. Figures shown are illustrative; only the approval letter and schedule are binding.</Bullet>
            <Bullet>You have had the opportunity to read these terms and to ask questions, and you have had independent advice if you wished to take it.</Bullet>
            <Bullet>Information on this platform may contain errors. We correct them, but we are not liable for reliance on an obvious error.</Bullet>
            <Bullet>We may suspend or restrict your access to the platform to protect you, other customers, or the platform, including where we suspect fraud or account compromise.</Bullet>
          </div>
        </Section>

        <Section title="10. Liability">
          <p>
            Nothing in these terms excludes or limits our liability for fraud, for death or personal
            injury caused by our negligence, or for anything else that cannot lawfully be excluded.
            Subject to that:
          </p>
          <div className="space-y-3">
            <Bullet>We are not liable for indirect or consequential loss, loss of profit, loss of opportunity, or loss of anticipated savings.</Bullet>
            <Bullet>We are not liable for loss caused by your failure to keep your password confidential or to tell us about suspected compromise.</Bullet>
            <Bullet>We are not liable for the actions of a third party where we have taken reasonable steps to prevent it.</Bullet>
            <Bullet>We are not liable for the value we assign on appraisal, or for a decline, except where our negligence or misconduct caused it.</Bullet>
          </div>
          <p>
            Your total liability to us for a given loan cannot exceed the total amount payable under
            that loan.
          </p>
        </Section>

        <Section title="11. Indemnity">
          <p>
            You agree to indemnify us against claims, losses and reasonable costs arising from your
            breach of these terms, from any misrepresentation in your application or documents, or
            from any claim by a third party arising from your use of the platform.
          </p>
        </Section>

        <Section title="12. Suspension and termination">
          <p>You may close your account at any time by contacting us, provided no loan is outstanding.</p>
          <p>We may suspend or terminate your account, and require immediate repayment of any outstanding amount, if you:</p>
          <div className="space-y-3">
            <Bullet>Provide false information, forged or altered documents, or an asset you do not own.</Bullet>
            <Bullet>Attempt to obtain funds against the same asset more than once.</Bullet>
            <Bullet>Fail to make a payment when due and do not engage with us after we contact you.</Bullet>
            <Bullet>Breach these terms, our Privacy Policy, or the law.</Bullet>
            <Bullet>Engage in activity that threatens the security or stability of the platform.</Bullet>
          </div>
          <p>
            Where a platform account is suspended by an administrator rather than blocked by a super
            administrator, you may request that decision be reviewed.
          </p>
        </Section>

        <Section title="13. Notices">
          <p>
            We may give you a notice through this platform, by email, or by phone to the details on
            your account, and that notice is treated as delivered when it appears in your
            notifications, is sent to your email address, or is made orally and recorded. You must
            keep your details current; we are not responsible for the consequences of a notice that
            fails to reach you because your details are wrong or out of date.
          </p>
        </Section>

        <Section title="14. Governing law and disputes">
          <p>
            These terms and any dispute arising from them are governed by the laws of the
            jurisdiction in which the lending entity operates. The courts of that jurisdiction have
            exclusive jurisdiction.
          </p>
          <p>
            We would rather resolve a problem directly than litigate. If you have a complaint, raise
            it with us first using the contact details in the footer and give us a reasonable
            opportunity to respond. That does not prevent you from taking proceedings at any time,
            particularly where a limitation period is running.
          </p>
        </Section>

        <Section title="15. Changes to these terms">
          <p>
            We may amend these terms from time to time. The current version is always published here
            with its date. Material changes affecting existing borrowers will be notified before
            they take effect. Continuing to use the platform after a change means you accept the
            amended terms, but terms in force when a loan was made continue to govern that loan
            unless the change is required by law or expressly extends to existing loans.
          </p>
        </Section>

        <Section title="16. General">
          <div className="space-y-3">
            <Bullet>If any provision is found unenforceable, the rest of these terms remain in force.</Bullet>
            <Bullet>A delay in enforcing a right is not a waiver of it.</Bullet>
            <Bullet>You may not assign your account or your obligations under these terms without our written consent.</Bullet>
            <Bullet>A person who is not a party to these terms has no right to enforce them.</Bullet>
            <Bullet>Headings are for convenience and do not affect interpretation.</Bullet>
          </div>
        </Section>

        <Section title="17. Contact">
          <p>
            Questions about these terms, or about an application or loan in progress, can be raised
            using the email address or telephone number in the footer. Please quote your email
            address and the reference for the loan so we can identify you.
          </p>
          <p>
            See also our <Link to="/privacy" className="text-emerald-700 font-medium hover:underline">Privacy Policy</Link>{' '}
            and <Link to="/about" className="text-emerald-700 font-medium hover:underline">About Us</Link>.
          </p>
        </Section>
      </Prose>
    </>
  );
}