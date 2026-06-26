/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, SubscriptionTier, Subscription } from '../types';
import { ShieldCheck, Check, Sparkles, CreditCard, Ticket, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';

interface SubscriptionGateProps {
  userProfile: UserProfile;
  onUpgradeSuccess: (newTier: SubscriptionTier) => void;
  onClose: () => void;
}

interface Invoice {
  id: string;
  plan: SubscriptionTier;
  amount: number;
  date: string;
  couponCode?: string;
  status: 'paid' | 'refunded';
}

export default function SubscriptionGate({ userProfile, onUpgradeSuccess, onClose }: SubscriptionGateProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>('gold');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  
  // Checkout process simulation
  const [checkoutSess, setCheckoutSess] = useState<any>(null);
  const [paying, setPaying] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);

  // Card Inputs
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('100');

  // Billing history
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeSub, setActiveSub] = useState<Subscription | null>(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/billing/history');
      const data = await res.json();
      setInvoices(data.invoices);
      if (data.activeSubscription && data.activeSubscription.plan !== 'free') {
        setActiveSub(data.activeSubscription);
      } else {
        setActiveSub(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userProfile]);

  const handleValidateCoupon = async () => {
    if (!couponCode) return;
    setCouponError('');
    try {
      const res = await fetch(`/api/billing/coupon/${couponCode}`);
      const data = await res.json();
      if (data.valid) {
        setCouponApplied(data.coupon);
        setCouponError('');
      } else {
        setCouponApplied(null);
        setCouponError(data.error);
      }
    } catch (err) {
      setCouponError('Error validating coupon');
    }
  };

  const handleCreateCheckoutSession = async (plan: SubscriptionTier) => {
    setSelectedPlan(plan);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          billingCycle,
          couponCode: couponApplied?.code || undefined
        })
      });
      const sess = await res.json();
      if (sess.success) {
        setCheckoutSess(sess);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmSimulatedPayment = async () => {
    if (!checkoutSess) return;
    setPaying(true);
    
    // Simulate payment sheet gateway authorization (2s)
    setTimeout(async () => {
      try {
        const res = await fetch('/api/billing/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan: checkoutSess.plan,
            billingCycle: checkoutSess.billingCycle,
            price: checkoutSess.price,
            couponApplied: checkoutSess.couponApplied
          })
        });
        const data = await res.json();
        if (data.success) {
          setPaying(false);
          setPaidSuccess(true);
          onUpgradeSuccess(checkoutSess.plan);
          fetchHistory();
          setTimeout(() => {
            setPaidSuccess(false);
            setCheckoutSess(null);
          }, 3000);
        }
      } catch (err) {
        console.error(err);
        setPaying(false);
      }
    }, 2000);
  };

  const handleCancelSub = async () => {
    if (!window.confirm('Are you sure you want to cancel your premium subscription?')) return;
    try {
      const res = await fetch('/api/billing/cancel', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        onUpgradeSuccess('free');
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Preset plans features list
  const PLAN_DETAILS = {
    free: {
      title: 'Free Plan',
      price: '$0',
      desc: 'Standard social matches with ads',
      features: ['5 Daily swipes', 'Local dating only', 'Basic profile options']
    },
    plus: {
      title: 'Aura Plus',
      price: '$9.99',
      desc: 'Unlimited swipes & visual matches',
      features: ['Unlimited Swipes', 'Dating Passport', 'Rewind Swipes', 'Exclusve badge marker']
    },
    gold: {
      title: 'Aura Gold',
      price: '$19.99',
      desc: 'Top co-pilot matching features',
      features: ['See Who Liked You', '5 Super Likes / Day', 'Monthly Profile Boost', 'AI Icebreaker generation', 'Ad-free experience']
    },
    platinum: {
      title: 'Aura Platinum',
      price: '$29.99',
      desc: 'The ultimate dating elite suite',
      features: ['AI Chat Assistant co-pilot', 'Priority Profile Visibility', 'Incognito Mode option', 'Weekly profile boosts', 'Unlimited messaging suggestions']
    }
  };

  return (
    <div id="subscription_gate_container" className="flex-1 flex flex-col bg-zinc-950 overflow-y-auto p-6 relative">
      {/* Decorative glows */}
      <div className="absolute top-0 left-1/4 w-52 h-52 rounded-full bg-violet-600/10 blur-[80px] pointer-events-none"></div>

      {/* Header bar */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center space-x-1.5">
            <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400/10 animate-pulse" />
            <span>Aura Club Membership</span>
          </h2>
          <p className="text-xs text-zinc-500">Upgrade to unlock matching multipliers</p>
        </div>
        <button
          id="close_sub_gate"
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold transition-colors"
        >
          Skip / Close
        </button>
      </div>

      {/* User tier overview banner */}
      {activeSub ? (
        <div id="user_active_sub_banner" className="p-4 rounded-2xl bg-zinc-900 border border-violet-500/15 mb-6 text-left space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono text-violet-400 uppercase tracking-widest font-bold">CURRENT ACTIVE PLAN</span>
              <h3 className="text-lg font-bold text-white capitalize">{userProfile.subscriptionTier} tier</h3>
            </div>
            <button
              id="sub_cancel_trigger_btn"
              onClick={handleCancelSub}
              className="text-[10px] text-zinc-500 underline hover:text-zinc-300 cursor-pointer"
            >
              Cancel Subscription
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10.5px] text-zinc-400 pt-2 border-t border-zinc-800/60">
            <div>
              <span className="text-zinc-500">Renews on:</span>{' '}
              <span className="font-semibold">{new Date(activeSub.endDate).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-zinc-500">Billing frequency:</span>{' '}
              <span className="font-semibold capitalize">{activeSub.billingCycle}</span>
            </div>
          </div>
        </div>
      ) : (
        <div id="user_free_sub_banner" className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-left mb-6 flex items-start space-x-2 text-xs text-zinc-400">
          <AlertCircle className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
          <span>You are currently on the <strong>Free Plan</strong>. Upgrade to access unlimited swiping deck rewinds, custom dating passport coordinates, and AI assistant co-pilots.</span>
        </div>
      )}

      {/* Plans selector area */}
      {!checkoutSess && (
        <div id="plans_select_hub" className="space-y-6">
          {/* Toggle monthly/yearly cycle */}
          <div className="flex justify-center p-1 bg-zinc-900 rounded-xl border border-zinc-850 max-w-[280px] mx-auto">
            <button
              id="sub_monthly_toggle"
              onClick={() => setBillingCycle('monthly')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                billingCycle === 'monthly' ? 'bg-violet-600 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Monthly billing
            </button>
            <button
              id="sub_yearly_toggle"
              onClick={() => setBillingCycle('yearly')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1 ${
                billingCycle === 'yearly' ? 'bg-violet-600 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span>Yearly pass</span>
              <span className="text-[9px] px-1 bg-amber-500 text-zinc-950 font-bold rounded">SAVE 33%</span>
            </button>
          </div>

          {/* Pricing cards grid */}
          <div className="space-y-4 text-left">
            {(['plus', 'gold', 'platinum'] as SubscriptionTier[]).map((plan) => {
              const info = PLAN_DETAILS[plan];
              const multiplier = billingCycle === 'yearly' ? 8.0 : 1.0;
              const priceNum = Number(info.price.slice(1)) * multiplier;
              const formattedPrice = `$${priceNum.toFixed(2)}`;

              return (
                <div
                  id={`plan_card_${plan}`}
                  key={plan}
                  className={`p-5 rounded-2xl border transition-all ${
                    selectedPlan === plan 
                      ? 'bg-zinc-900/90 border-violet-500 ring-2 ring-violet-500/10' 
                      : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-base font-bold text-white uppercase tracking-wide">{info.title}</h3>
                      <p className="text-[11px] text-zinc-500 leading-normal">{info.desc}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-white">{formattedPrice}</span>
                      <p className="text-[9px] text-zinc-500 font-mono">
                        {billingCycle === 'yearly' ? '/Year (billed upfront)' : '/Month'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 mt-4 pt-4 border-t border-zinc-800/50">
                    {info.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start space-x-1.5">
                        <Check className="w-3.5 h-3.5 text-violet-500 mt-0.5 flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-1 flex justify-end">
                    <button
                      id={`select_plan_btn_${plan}`}
                      onClick={() => handleCreateCheckoutSession(plan)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold shadow transition-all ${
                        selectedPlan === plan 
                          ? 'bg-violet-600 hover:bg-violet-500 text-white' 
                          : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-300'
                      }`}
                    >
                      Instant Purchase
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STRIPE CHECKOUT MODAL SHEET */}
      {checkoutSess && (
        <div id="stripe_payment_sheet" className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-left space-y-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-2">
            <span className="text-xs font-bold text-zinc-300 flex items-center space-x-1.5 font-mono uppercase tracking-wider">
              <CreditCard className="w-4.5 h-4.5 text-violet-500" />
              <span>Secure Stripe Sandbox Checkout</span>
            </span>
            <button onClick={() => setCheckoutSess(null)} className="text-zinc-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {paidSuccess ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
              <CheckCircle className="w-16 h-16 text-emerald-400 animate-bounce" />
              <h3 className="text-lg font-bold text-white">Payment Authorized!</h3>
              <p className="text-xs text-zinc-400 max-w-xs">
                Your account was upgraded to premium successfully. Your printable invoice is now logged.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Receipt Summary */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Selected Tier:</span>
                  <span className="font-semibold text-zinc-200 uppercase">{checkoutSess.plan}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Billing cycle:</span>
                  <span className="font-semibold text-zinc-200 capitalize">{checkoutSess.billingCycle}</span>
                </div>
                {checkoutSess.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-400 text-[11px]">
                    <span>Coupon Discount Applied:</span>
                    <span>-${checkoutSess.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold pt-2 border-t border-zinc-800">
                  <span>Total Bill Amount:</span>
                  <span className="text-violet-400 font-mono">${checkoutSess.price.toFixed(2)}</span>
                </div>
              </div>

              {/* Coupon code inputs */}
              {!couponApplied ? (
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Apply Discount Coupon</label>
                  <div className="flex space-x-1.5">
                    <input
                      id="sub_coupon_input"
                      type="text"
                      placeholder="e.g. AURA50"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-violet-500 focus:outline-none text-xs uppercase font-mono text-zinc-300"
                    />
                    <button
                      id="sub_coupon_apply_btn"
                      onClick={handleValidateCoupon}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[10px] text-rose-500 mt-1">{couponError}</p>}
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-xs flex items-center justify-between font-mono">
                  <span className="flex items-center space-x-1">
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Coupon Applied: {couponApplied.code}</span>
                  </span>
                  <span>{couponApplied.discountPercent}% OFF</span>
                </div>
              )}

              {/* Secure simulated Credit Card input form */}
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Card number</label>
                  <input
                    id="stripe_card_num"
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 font-mono focus:border-violet-500 focus:outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Expiration</label>
                    <input
                      id="stripe_card_exp"
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 font-mono focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">CVC</label>
                    <input
                      id="stripe_card_cvc"
                      type="password"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 font-mono focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Secure transaction submit button */}
              <button
                id="stripe_payment_submit_btn"
                onClick={handleConfirmSimulatedPayment}
                disabled={paying}
                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-violet-700 text-white text-xs font-semibold shadow transition-all uppercase tracking-wider"
              >
                {paying ? 'Authorizing Secure Payment...' : 'Secure Pay with Credit Card'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* BILLING INVOICES & RECEIPT PRINT LOGS */}
      {invoices.length > 0 && (
        <div id="billing_invoice_history_list" className="mt-8 text-left space-y-3">
          <h4 className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-wider flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Transaction & Invoice History</span>
          </h4>

          <div className="space-y-2.5">
            {invoices.map((inv) => (
              <div 
                id={`invoice_item_${inv.id}`}
                key={inv.id} 
                className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-850 flex justify-between items-center text-xs"
              >
                <div className="space-y-1">
                  <span className="font-mono text-[10px] text-zinc-500">{inv.id}</span>
                  <p className="font-bold text-zinc-200 capitalize">{inv.plan} Upgrade pass</p>
                  <p className="text-[10px] text-zinc-500">Processed on {inv.date}</p>
                </div>
                
                <div className="text-right space-y-1.5">
                  <span className="font-bold text-white font-mono">${inv.amount.toFixed(2)}</span>
                  <div>
                    <button
                      id={`print_invoice_btn_${inv.id}`}
                      onClick={() => {
                        alert(`Generating printable Invoice receipt PDF mockup:\n\nInvoice ID: ${inv.id}\nUpgrade Tier: ${inv.plan.toUpperCase()}\nBilled Price: $${inv.amount.toFixed(2)}\nInvoice Status: PAID (STRIPE GATEWAY SECURE)`);
                      }}
                      className="text-[9.5px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 font-semibold border border-zinc-700/60 cursor-pointer"
                    >
                      Print Receipt
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
