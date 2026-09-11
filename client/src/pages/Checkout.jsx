import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { OrdersAPI } from '../api/endpoints';
import { Bottle } from '../components/Bottle';
import { PaymentForm } from '../components/PaymentForm';
import { formatPrice, deliveryFee } from '../utils/format';
import { validateCard, simulateCardPayment, simulateEftPayment } from '../utils/payment';

const PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
  'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape',
];

const DELIVERY_METHODS = [
  { id: 'courier', title: 'Courier to your door', detail: '2–4 working days, tracked' },
  { id: 'pargo', title: 'Collect from a Pargo point', detail: '3–5 working days, 3 000+ locations' },
];

const REQUIRED = ['firstName', 'lastName', 'street', 'suburb', 'city', 'province', 'postalCode', 'mobile'];

const LABELS = {
  firstName: 'First name',
  lastName: 'Last name',
  street: 'Street address',
  suburb: 'Suburb',
  city: 'City',
  province: 'Province',
  postalCode: 'Postal code',
  mobile: 'Mobile number',
};

const STEPS = ['Delivery', 'Payment', 'Confirm'];

export function Checkout() {
  const { cart, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    street: '',
    suburb: '',
    city: '',
    province: 'Western Cape',
    postalCode: '',
    mobile: '',
  });
  const [deliveryMethod, setDeliveryMethod] = useState('courier');
  const [touched, setTouched] = useState({});

  // Card details never leave this component.
  const [payMethod, setPayMethod] = useState('card');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [bank, setBank] = useState('Absa');
  const [cardTouched, setCardTouched] = useState({});

  const [error, setError] = useState(null);
  const [stage, setStage] = useState('idle'); // idle | paying | placing

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const blur = (field) => () => setTouched((t) => ({ ...t, [field]: true }));
  const blurCard = (field) => () => setCardTouched((t) => ({ ...t, [field]: true }));

  const shipping = deliveryFee(subtotal);
  const total = subtotal + shipping;

  const missing = REQUIRED.filter((field) => !form[field].trim());
  const cardErrors = payMethod === 'card' ? validateCard(card) : {};

  const busy = stage !== 'idle';

  const handleContinue = (e) => {
    e.preventDefault();
    setError(null);

    if (missing.length > 0) {
      // Mark everything touched so every gap shows at once
      setTouched(Object.fromEntries(REQUIRED.map((field) => [field, true])));
      setError('Please complete the highlighted delivery details.');
      return;
    }

    setStep(2);
    window.scrollTo({ top: 0 });
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setError(null);

    if (payMethod === 'card' && Object.keys(cardErrors).length > 0) {
      setCardTouched({ number: true, name: true, expiry: true, cvv: true });
      setError('Please check the card details below.');
      return;
    }

    let payment;

    // 1. Authorise with the simulated gateway
    setStage('paying');
    try {
      payment =
        payMethod === 'card'
          ? await simulateCardPayment(card, total)
          : await simulateEftPayment(bank, total);
    } catch (err) {
      setStage('idle');
      setError(err.message);
      return;
    }

    // 2. Only then create the order, which re-checks stock atomically
    setStage('placing');
    try {
      const order = await OrdersAPI.checkout();
      clearCart();

      // Neither the address nor the payment result is on the Order schema, so
      // both are handed to the confirmation screen through router state.
      navigate(`/orders/${order._id}/confirmation`, {
        replace: true,
        state: { delivery: form, deliveryMethod, payment },
      });
    } catch (err) {
      setStage('idle');
      // The order failed after authorisation, so say what happened to the money
      setError(
        `${err.message || 'We could not place your order.'} Your payment was reversed and nothing was charged.`
      );
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container-xxl py-5 text-center">
        <h1 className="display-page mb-3">Your cart is empty</h1>
        <p className="text-muted-gold mb-4">Add a fragrance before checking out.</p>
        <Link to="/products" className="btn btn-primary">
          Shop the collection
        </Link>
      </div>
    );
  }

  const invalid = (field) => touched[field] && !form[field].trim();

  const textField = (field, { type = 'text', span = 12, hint } = {}) => (
    <div className={`col-12 col-sm-${span}`} key={field}>
      <label className="form-label" htmlFor={`co-${field}`}>
        {LABELS[field]}
      </label>
      <input
        id={`co-${field}`}
        className={`form-control${invalid(field) ? ' is-invalid' : ''}`}
        type={type}
        value={form[field]}
        onChange={update(field)}
        onBlur={blur(field)}
        aria-invalid={invalid(field)}
      />
      {invalid(field) && <div className="invalid-feedback d-block">{LABELS[field]} is required.</div>}
      {hint && !invalid(field) && <div className="form-text">{hint}</div>}
    </div>
  );

  return (
    <>
      {/* Progress */}
      <div className="border-bottom" style={{ borderColor: 'var(--c-border)' }}>
        <div className="container-xxl d-flex align-items-center justify-content-center gap-3 gap-md-4 py-4 flex-wrap">
          {STEPS.map((label, index) => {
            const number = index + 1;
            const done = number <= step;
            return (
              <div className="d-flex align-items-center gap-2" key={label}>
                <span className={`step-dot${done ? ' step-dot--on' : ''}`}>{number}</span>
                <span className={`small${done ? '' : ' text-muted-gold'}`}>{label}</span>
                {number < STEPS.length && (
                  <span
                    className="d-none d-md-inline-block"
                    style={{
                      width: '3rem',
                      height: 1,
                      background: number < step ? 'var(--c-accent)' : 'var(--c-border)',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <form className="container-xxl py-4 py-lg-5" onSubmit={step === 1 ? handleContinue : handlePay} noValidate>
        <div className="row g-4 g-lg-5">
          <div className="col-12 col-lg-7">
            {error && (
              <div className="alert alert-error" role="alert">
                {error}
              </div>
            )}

            {step === 1 ? (
              <>
                <h2 className="serif fs-2 mb-3">Contact</h2>
                <div className="mb-5">
                  <label className="form-label" htmlFor="co-email">
                    Email address
                  </label>
                  <input
                    id="co-email"
                    className="form-control"
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    aria-describedby="co-email-hint"
                  />
                  <div id="co-email-hint" className="form-text">
                    Your order confirmation goes to this address.
                  </div>
                </div>

                <h2 className="serif fs-2 mb-3">Delivery address</h2>
                <div className="row g-3 mb-5">
                  {textField('firstName', { span: 6 })}
                  {textField('lastName', { span: 6 })}
                  {textField('street')}
                  {textField('suburb', { span: 6 })}
                  {textField('city', { span: 6 })}

                  <div className="col-12 col-sm-6">
                    <label className="form-label" htmlFor="co-province">
                      Province
                    </label>
                    <select
                      id="co-province"
                      className="form-select"
                      value={form.province}
                      onChange={update('province')}
                    >
                      {PROVINCES.map((province) => (
                        <option key={province}>{province}</option>
                      ))}
                    </select>
                  </div>

                  {textField('postalCode', { span: 6 })}
                  {textField('mobile', { type: 'tel', hint: 'For delivery updates.' })}
                </div>

                <h2 className="serif fs-2 mb-3">Delivery method</h2>
                <div className="d-flex flex-column gap-3">
                  {DELIVERY_METHODS.map((option) => (
                    <label
                      className="panel d-flex align-items-center gap-3 p-3 p-md-4 mb-0"
                      key={option.id}
                      style={{
                        cursor: 'pointer',
                        borderColor:
                          deliveryMethod === option.id ? 'var(--c-border-accent)' : 'var(--c-border)',
                      }}
                    >
                      <input
                        className="form-check-input mt-0 flex-shrink-0"
                        type="radio"
                        name="delivery-method"
                        checked={deliveryMethod === option.id}
                        onChange={() => setDeliveryMethod(option.id)}
                      />
                      <span className="flex-grow-1">
                        <span className="d-block">{option.title}</span>
                        <span className="d-block text-muted-gold small mt-1">{option.detail}</span>
                      </span>
                      <span className={shipping === 0 ? 'text-free' : ''}>
                        {shipping === 0 ? 'Free' : formatPrice(shipping)}
                      </span>
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h2 className="serif fs-2 mb-0">Payment</h2>
                  <button
                    type="button"
                    className="btn btn-link-gold btn-sm"
                    onClick={() => setStep(1)}
                    disabled={busy}
                  >
                    ← Edit delivery
                  </button>
                </div>

                <div className="panel p-3 p-md-4 mb-4">
                  <div className="meta mb-2">Delivering to</div>
                  <address className="mb-0 small" style={{ lineHeight: 1.7 }}>
                    {form.firstName} {form.lastName}
                    <br />
                    {form.street}, {form.suburb}
                    <br />
                    {form.city}, {form.postalCode}, {form.province}
                    <br />
                    {form.mobile}
                  </address>
                </div>

                <PaymentForm
                  method={payMethod}
                  setMethod={setPayMethod}
                  card={card}
                  setCard={setCard}
                  bank={bank}
                  setBank={setBank}
                  errors={cardErrors}
                  touched={cardTouched}
                  onBlur={blurCard}
                />
              </>
            )}
          </div>

          {/* Summary */}
          <div className="col-12 col-lg-5">
            <div className="panel p-3 p-md-4" style={{ position: 'sticky', top: '1.5rem' }}>
              <h2 className="serif fs-3 mb-4">Order summary</h2>

              <ul className="list-unstyled mb-4">
                {cart.map((item) => (
                  <li
                    className="d-flex gap-3 pb-3 mb-3 border-bottom"
                    style={{ borderColor: 'var(--c-border)' }}
                    key={item.productId}
                  >
                    <span className="bottle bottle--sm">
                      <Bottle seed={item.name} size={38} />
                    </span>
                    <span className="flex-grow-1">
                      <span className="d-block small">{item.name}</span>
                      <span className="d-block text-muted-gold small mt-1">Qty {item.quantity}</span>
                    </span>
                    <span className="small">{formatPrice(item.unitPrice * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              <dl className="mb-4">
                <div className="d-flex justify-content-between py-2">
                  <dt className="fw-normal text-muted-gold">Subtotal</dt>
                  <dd className="mb-0">{formatPrice(subtotal)}</dd>
                </div>
                <div className="d-flex justify-content-between py-2">
                  <dt className="fw-normal text-muted-gold">Delivery</dt>
                  <dd className={`mb-0${shipping === 0 ? ' text-free' : ''}`}>
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </dd>
                </div>
                <div
                  className="d-flex justify-content-between align-items-baseline border-top pt-3 mt-2"
                  style={{ borderColor: 'var(--c-border)' }}
                >
                  <dt className="serif fs-4 fw-normal">Total</dt>
                  <dd className="serif fs-3 mb-0">{formatPrice(total)}</dd>
                </div>
              </dl>

              <button className="btn btn-primary w-100" type="submit" disabled={busy}>
                {stage === 'paying' && (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                    Authorising…
                  </>
                )}
                {stage === 'placing' && (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                    Placing order…
                  </>
                )}
                {stage === 'idle' &&
                  (step === 1 ? 'Continue to payment' : `Pay ${formatPrice(total)}`)}
              </button>

              <Link to="/cart" className="btn btn-link-gold w-100 mt-2">
                Back to cart
              </Link>

              {step === 2 && (
                <p className="form-text text-center mt-3 mb-0">
                  Simulated payment — no card is charged.
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
