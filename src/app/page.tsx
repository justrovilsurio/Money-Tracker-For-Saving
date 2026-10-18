import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ScrollProgress } from "@/components/scroll-progress";
import ArrowNarrowDownIcon from "@/components/ui/arrow-narrow-down-icon";
import ArrowNarrowRightIcon from "@/components/ui/arrow-narrow-right-icon";
import ArrowNarrowUpIcon from "@/components/ui/arrow-narrow-up-icon";
import CheckedIcon from "@/components/ui/checked-icon";
import ClockIcon from "@/components/ui/clock-icon";
import CoffeeIcon from "@/components/ui/coffee-icon";
import CreditCardIcon from "@/components/ui/credit-card";
import DotsVerticalIcon from "@/components/ui/dots-vertical-icon";
import DownChevron from "@/components/ui/down-chevron";
import GearIcon from "@/components/ui/gear-icon";
import HomeIcon from "@/components/ui/home-icon";
import LayersIcon from "@/components/ui/layers-icon";
import ShieldCheck from "@/components/ui/shield-check";
import ShoppingCartIcon from "@/components/ui/shopping-cart-icon";
import WalletIcon from "@/components/ui/wallet-icon";
import { RouletteAmount } from "@/components/ui/roulette-amount";

const bills = [
  { name: "ShopeePay installment", source: "ShopeePay", date: "Oct 22", cutoff: "Oct 15", amount: "₱2,450", icon: CreditCardIcon, tone: "orange" },
  { name: "MariBank credit card", source: "MariBank CC", date: "Oct 25", cutoff: "Oct 15", amount: "₱4,200", icon: WalletIcon, tone: "blue" },
  { name: "MariBank loan", source: "MariBank Loan", date: "Nov 05", cutoff: "Oct 30", amount: "₱3,200", icon: LayersIcon, tone: "green" },
];

const spending = [
  { name: "Groceries", detail: "Today · 10:42 AM", amount: "−₱1,280", icon: WalletIcon },
  { name: "Commute", detail: "Yesterday · 8:14 AM", amount: "−₱240", icon: ArrowNarrowDownIcon },
  { name: "Coffee", detail: "Yesterday · 7:52 AM", amount: "−₱185", icon: CoffeeIcon },
];

export default async function Home() {
  if (getSupabasePublicEnv()) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data } = await supabase.auth.getClaims();
      if (typeof data?.claims?.sub === "string" && data.claims.sub.length > 0) {
        redirect("/dashboard");
      }
    } catch (error) {
      // Next redirect is an exception used to stop rendering; let it propagate.
      if (error && typeof error === "object" && "digest" in error && String(error.digest).startsWith("NEXT_REDIRECT")) throw error;
      // Keep the public sample preview available if auth cannot be checked.
    }
  }
  return (
    <main className="app-frame" id="main-content" tabIndex={-1}>
      <ScrollProgress />
      <aside className="sidebar" aria-label="Main navigation">
        <Link className="brand" href="/" aria-label="Siklo home">
          <span className="brand-mark" aria-hidden="true"><LayersIcon size={18} strokeWidth={2.3} /></span>
          <span>Siklo<span className="brand-period">.</span></span>
        </Link>

        <div className="workspace-switcher">
          <span className="avatar avatar-small">S</span>
          <span className="workspace-copy"><strong>My money</strong><small>Personal workspace</small></span>
          <DownChevron size={15} aria-hidden="true" />
        </div>

        <p className="nav-caption">WORKSPACE</p>
        <nav className="nav-list">
          <a className="nav-item active" href="#overview" aria-current="page"><HomeIcon size={17} />Overview</a>
          <a className="nav-item" href="#year-plan"><ClockIcon size={17} />Year plan</a>
          <a className="nav-item" href="#upcoming"><LayersIcon size={17} />Bills & installments<span className="nav-count">3</span></a>
          <a className="nav-item" href="#activity"><WalletIcon size={17} />Daily spending</a>
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-help">
          <div className="help-icon"><ShieldCheck size={17} /></div>
          <strong>Your money stays yours</strong>
          <p>Each account is private. Your financial records are never shared with another user.</p>
          <Link href="/setup">Read about security <ArrowNarrowRightIcon size={13} /></Link>
        </div>
        <a className="nav-item" href="#settings"><GearIcon size={17} />Settings</a>
        <div className="profile-row">
          <span className="avatar">S</span>
          <span className="workspace-copy"><strong>Sample account</strong><small>Preview only</small></span>
          <DotsVerticalIcon size={17} aria-hidden="true" />
        </div>
      </aside>

      <section className="main-panel" id="overview">
        <header className="topbar">
          <div className="breadcrumb"><span>My money</span><span className="crumb-separator">/</span><strong>Overview</strong></div>
          <div className="topbar-actions">
            <span className="preview-badge"><span className="preview-dot" />ILLUSTRATIVE SAMPLE · NO PERSONAL DATA</span>
            <Link className="button button-outline button-small" href="/sign-in">Sign in</Link>
            <Link className="button button-primary button-small" href="/sign-up">Create account</Link>
          </div>
        </header>

        <div className="page-content">
          <div className="welcome-row reveal">
            <div>
              <p className="eyebrow">FRIDAY, OCTOBER 16, 2026</p>
              <h1>Your money, <span>in rhythm.</span></h1>
              <p className="welcome-subtitle">A clear plan for every cutoff, bill, and little purchase.</p>
            </div>
            <Link className="button button-primary" href="/setup"><ArrowNarrowRightIcon size={16} />Set up your tracker</Link>
          </div>

          <section className="cutoff-banner reveal" aria-labelledby="cutoff-title">
            <div className="cutoff-banner-left">
              <div className="cutoff-icon"><ClockIcon size={19} /></div>
              <div>
                <p className="eyebrow eyebrow-light">CURRENT PAY PERIOD</p>
                <h2 id="cutoff-title">October 16 <span>—</span> October 31</h2>
                <p className="banner-caption">Your next cutoff is in 14 days</p>
              </div>
            </div>
            <div className="cutoff-banner-right">
              <p>SAFE TO SPEND</p>
              <strong><RouletteAmount value="₱25,110.00" /></strong>
              <small>after bills, savings & purchases</small>
            </div>
            <div className="banner-sparkle banner-sparkle-one" aria-hidden="true" />
            <div className="banner-sparkle banner-sparkle-two" aria-hidden="true" />
          </section>

          <section className="summary-grid reveal" aria-label="October 16 to 31 cutoff summary">
            <article className="summary-card">
              <div className="summary-card-top"><span>Cutoff income</span><span className="summary-icon summary-blue"><ArrowNarrowDownIcon size={34} /></span></div>
              <strong><RouletteAmount value="₱34,500.00" /></strong>
              <small>Expected on Oct 30</small>
            </article>
            <article className="summary-card">
              <div className="summary-card-top"><span>Bills to reserve</span><span className="summary-icon summary-amber"><LayersIcon size={34} /></span></div>
              <strong><RouletteAmount value="₱3,200.00" /></strong>
              <small>1 payment assigned</small>
            </article>
            <article className="summary-card">
              <div className="summary-card-top"><span>Savings plan</span><span className="summary-icon summary-green"><ArrowNarrowUpIcon size={34} /></span></div>
              <strong><RouletteAmount value="₱5,000.00" /></strong>
              <small>₱2,500 transferred so far</small>
            </article>
            <article className="summary-card summary-card-highlight">
              <div className="summary-card-top"><span>Spent this cutoff</span><span className="summary-icon summary-violet"><WalletIcon size={34} /></span></div>
              <strong><RouletteAmount value="₱1,190.00" /></strong>
              <small>Across 3 purchases</small>
            </article>
          </section>

          <div className="content-grid">
            <section className="panel year-panel reveal" id="year-plan" aria-labelledby="year-heading">
              <div className="panel-heading">
                <div><p className="eyebrow">YOUR BIG PICTURE</p><h2 id="year-heading">2026 year plan</h2></div>
                <Link className="text-link" href="/setup">View year <ArrowNarrowRightIcon size={14} /></Link>
              </div>
              <p className="panel-description">Two cutoffs a month, planned all the way through December.</p>
              <div className="year-months" aria-label="Monthly plan overview">
                {[
                  ["JUL", 72, 66], ["AUG", 62, 78], ["SEP", 78, 58], ["OCT", 88, 73], ["NOV", 66, 62], ["DEC", 58, 83],
                ].map(([month, first, second]) => (
                  <div className={`month-column ${month === "OCT" ? "month-current" : ""}`} key={month}>
                    <div className="month-bars" aria-hidden="true">
                      <span className={`month-bar bar-${first}`} />
                      <span className={`month-bar month-bar-muted bar-${second}`} />
                    </div>
                    <span className="month-label">{month}</span>
                  </div>
                ))}
              </div>
              <div className="chart-legend"><span><i className="legend-dot legend-primary" />15th cutoff</span><span><i className="legend-dot legend-muted" />Month-end cutoff</span><span className="legend-caption">Illustrative reserve level</span></div>
              <div className="year-note"><span className="year-note-icon"><CheckedIcon size={14} /></span><span><strong>Next year is in view</strong><small>Your installment plans can continue into 2027.</small></span><ArrowNarrowRightIcon size={15} className="year-note-arrow" /></div>
            </section>

            <section className="panel obligations-panel reveal" id="upcoming" aria-labelledby="upcoming-heading">
              <div className="panel-heading">
                <div><p className="eyebrow">STAY A STEP AHEAD</p><h2 id="upcoming-heading">Upcoming payments</h2></div>
                <button className="icon-button" type="button" aria-label="More payment options"><DotsVerticalIcon size={19} /></button>
              </div>
              <p className="panel-description">Due dates and the cutoff you’ll fund them from.</p>
              <div className="bill-list">
                {bills.map((bill) => {
                  const Icon = bill.icon;
                  return (
                    <article className="bill-row" key={bill.name}>
                      <span className={`bill-icon bill-${bill.tone}`}><Icon size={17} /></span>
                      <span className="bill-copy"><strong>{bill.name}</strong><small>{bill.source} <i /> Due {bill.date}</small></span>
                      <span className="bill-amount"><strong>{bill.amount}</strong><small>reserve from {bill.cutoff}</small></span>
                    </article>
                  );
                })}
              </div>
              <Link className="panel-footer-link" href="/setup">See all bills <ArrowNarrowRightIcon size={14} /></Link>
            </section>

            <section className="panel activity-panel reveal" id="activity" aria-labelledby="activity-heading">
              <div className="panel-heading">
                <div><p className="eyebrow">THE LITTLE THINGS ADD UP</p><h2 id="activity-heading">Recent spending</h2></div>
                <Link className="text-link" href="/setup">All activity <ArrowNarrowRightIcon size={14} /></Link>
              </div>
              <div className="activity-list">
                {spending.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article className="activity-row" key={item.name}>
                      <span className="activity-icon"><Icon size={16} /></span>
                      <span className="activity-copy"><strong>{item.name}</strong><small>{item.detail}</small></span>
                      <strong className="activity-amount">{item.amount}</strong>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="panel quick-add-panel reveal" aria-labelledby="quick-add-heading">
              <div className="quick-add-mark"><ArrowNarrowRightIcon size={20} /></div>
              <p className="eyebrow">MAKE IT A HABIT</p>
              <h2 id="quick-add-heading">A little update keeps the plan honest.</h2>
              <p>Log a purchase, adjust a bill, or add income whenever things change.</p>
              <Link className="button button-outline" href="/sign-in">Start tracking <ArrowNarrowRightIcon size={15} /></Link>
            </section>
          </div>

          <footer className="page-footer"><span>Siklo is a planning tool, not a live bank balance.</span><span><ShieldCheck size={14} />Private by design</span></footer>
        </div>
      </section>
    </main>
  );
}
