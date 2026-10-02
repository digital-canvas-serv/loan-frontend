import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowRight, CheckCircle2, ClipboardCheck, FileCheck2, Gem, Landmark,
  Lock, Scale, ShieldCheck, Wallet,
} from 'lucide-react';
import { Bullet, Numbered, PageHero, Prose, Section, useScrollTop } from '../../components/site/blocks';

const steps = [
  {
    icon: FileCheck2,
    title: 'Register with your documents',
    body: 'Create an account and upload identity and ownership evidence — a government ID, proof of address, and proof that you own the asset you intend to pledge. Files stay private until a reviewer opens them.',
  },
  {
    icon: ClipboardCheck,
    title: 'Get verified',
    body: 'An administrator reviews your profile and documents. Most checks are completed within one working day. You can sign in as soon as your account is approved.',
  },
  {
    icon: Scale,
    title: 'Apply, and we appraise the collateral',
    body: 'Submit a loan request against your asset. We appraise the asset independently — the value you declare is recorded as your claim, never as the basis for the amount we approve.',
  },
  {
    icon: Wallet,
    title: 'Receive funds and repay on schedule',
    body: 'Once approved, your repayment schedule is generated and the funds are released. Pay by bank transfer, card, cash or wallet, and track every payment and receipt in your dashboard.',
  },
];

const products = [
  { name: 'Asset-backed personal loan', range: '$1,000 – $100,000', tenure: '6 – 60 months', rate: 'from 8.50%' },
  { name: 'Vehicle-backed loan', range: '$2,500 – $150,000', tenure: '12 – 72 months', rate: 'from 9.25%' },
  { name: 'Business equipment loan', range: '$5,000 – $500,000', tenure: '12 – 84 months', rate: 'from 10.50%' },
];

const pillars = [
  { icon: Gem, title: 'Collateral, not credit scoring', body: 'Your repayment capacity is backed by an asset we hold and have valued, which is why a thin credit file does not automatically disqualify you.' },
  { icon: Scale, title: 'Independent appraisal', body: 'Declared value is your claim. Our approved amount follows the appraised value, so nobody is ever lent against a number they wrote themselves.' },
  { icon: ShieldCheck, title: 'Plain, itemised pricing', body: 'Interest, origination fees and every installment are itemised before you accept. No compounding surprises buried in the schedule.' },
  { icon: Lock, title: 'Documents stay private', body: 'Uploaded evidence is stored as encrypted database records and served only to you and the administrators reviewing your case.' },
];

const trust = [
  'Passwords are hashed with bcrypt and never stored or logged in plain text.',
  'Session tokens are signed, expire automatically, and are sent only over encrypted connections.',
  'Every administrative action — approvals, declines, document reviews, reconciliations — is written to an append-only audit trail.',
  'Payment reconciliation is a two-person workflow: a submitted payment does not reduce your balance until an administrator confirms it against the bank reference.',
];

export function AboutUsPage() {
  useScrollTop();
  const { user } = useAuth();

  return (
    <>
      <PageHero
        eyebrow="About Coloan"
        title="Borrow against what you own, not what someone else scores"
        intro="Coloan is a collateral-backed lending platform. We lend against assets we can hold and verify — jewellery, vehicles, electronics and business equipment — so that access to finance does not depend entirely on a credit file."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to={user ? '/loans/new' : '/register'} className="btn-primary">
            {user ? 'Apply for a loan' : 'Create an account'} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/terms" className="btn-secondary">Read the terms</Link>
        </div>
      </PageHero>

      <Prose>
        <Section title="Why we exist">
          <p>
            Plenty of people have a valuable asset and a perfectly good reason to borrow against it,
            but no access to mainstream credit — because credit history rewards having borrowed
            before, and a missed payment years ago closes doors that take years to reopen.
          </p>
          <p>
            Coloan removes that circularity. We assess the asset, we take possession, and we lend
            against the value of what we are actually holding. That means the decision rests on
            something verifiable instead of something inferred, and it is the same principle for
            every applicant regardless of who they are.
          </p>
          <p>
            We are deliberately narrow. We do not offer unsecured lending, we do not lend against
            assets we cannot physically verify, and we never approve a loan above the appraised
            value of the collateral.
          </p>
        </Section>

        <Section title="How it works">
          <div className="grid gap-4 sm:grid-cols-2">
            {steps.map(({ icon: Icon, title, body }, index) => (
              <div key={title} className="card flex items-start gap-4">
                <div className="stat-icon bg-emerald-100 text-emerald-700 flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-emerald-700">Step {index + 1}</p>
                  <h3 className="mt-1 font-semibold text-gray-900">{title}</h3>
                  <p className="mt-1.5 text-sm text-gray-600">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="What we lend against">
          <p>
            Eligibility is decided asset by asset. The figures below are the standard ranges;
            the final terms on any application depend on the appraised value, the asset and your
            repayment history with us.
          </p>
          <div className="table-container mt-5">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Tenure</th>
                  <th>Interest</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.name}>
                    <td className="font-medium">{product.name}</td>
                    <td>{product.range}</td>
                    <td>{product.tenure}</td>
                    <td>{product.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500">
            Monthly, biweekly, quarterly and bullet repayment structures are available. Repayment
            schedules are generated at approval and every installment is shown to you before you
            accept the loan.
          </p>
        </Section>

        <Section title="What we stand for">
          <div className="grid gap-4 sm:grid-cols-2">
            {pillars.map(({ icon: Icon, title, body }) => (
              <div key={title} className="card">
                <div className="stat-icon bg-gray-100 text-gray-700">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>
                <p className="mt-1.5 text-sm text-gray-600">{body}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="How we protect your information and your money">
          <Numbered
            items={[
              { title: 'Your documents are not public', children: <p>Identity and ownership documents are stored as database records rather than in a public bucket. Only you and the administrators reviewing your file can open them, and every download is attributable.</p> },
              { title: 'Nothing important happens without a record', children: <p>Approvals, rejections, status changes, document reviews and payment reconciliations are all written to an audit trail with the acting account and timestamp. Administrators cannot quietly move a file.</p> },
              { title: 'A payment is not a payment until it settles', children: <p>When you submit a payment it is recorded as pending. It only reduces your outstanding balance once an administrator reconciles it against the bank reference. If something does not match, you are not silently charged for it.</p> },
              { title: 'Collateral is released, not kept', children: <p>Once a loan is repaid in full, the pledged asset moves to released status and is returned to you. We do not treat a settled loan as a reason to retain the asset.</p> },
            ]}
          />
          <div className="space-y-3 mt-6">
            {trust.map((item) => <Bullet key={item}>{item}</Bullet>)}
          </div>
        </Section>

        <Section title="Who this platform is for">
          <p>
            Coloan suits people and small businesses who hold a verifiable asset and want
            predictable, itemised finance rather than revolving debt. It is a poor fit if you want
            unsecured credit, if you cannot evidence ownership of the asset, or if you need funds
            the same day — verification and appraisal exist precisely to protect both sides, and
            they take time.
          </p>
          <div className="card bg-gray-50 mt-5">
            <div className="flex items-start gap-3">
              <Landmark className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600">
                If you are unsure whether your asset qualifies, register your account and submit the
                asset details — a reviewer will tell you honestly whether we can help before you
                commit to anything.
              </p>
            </div>
          </div>
        </Section>

        <Section title="Start here">
          <div className="card bg-emerald-50 border-emerald-200">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-700 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-emerald-900">Registration takes a couple of minutes</h3>
                <p className="mt-1 text-sm text-emerald-800">
                  You will need a valid email, a password of at least 8 characters, and at least
                  one identity or ownership document to upload.
                </p>
              </div>
              <Link to={user ? '/loans/new' : '/register'} className="btn-primary flex-shrink-0">
                {user ? 'Apply now' : 'Create account'} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Section>
      </Prose>
    </>
  );
}