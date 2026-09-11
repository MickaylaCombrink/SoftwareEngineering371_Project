import {
  formatCardNumber,
  formatExpiry,
  detectBrand,
  digitsOnly,
  BANKS,
  TEST_CARDS,
} from '../utils/payment';

// Card entry for the simulated gateway. The values stay in the parent's state
// for the length of checkout and are never sent to our API.
export function PaymentForm({ method, setMethod, card, setCard, bank, setBank, errors, touched, onBlur }) {
  const brand = detectBrand(card.number);
  const cvvLength = brand === 'Amex' ? 4 : 3;

  const update = (field, formatter) => (e) => {
    const value = formatter ? formatter(e.target.value) : e.target.value;
    setCard((c) => ({ ...c, [field]: value }));
  };

  const invalid = (field) => Boolean(touched[field] && errors[field]);

  return (
    <>
      <div className="alert alert-success d-flex gap-2 align-items-start" role="note">
        <span aria-hidden="true">ⓘ</span>
        <span className="small">
          <strong>Simulated payment.</strong> No gateway is contacted and no card is charged. Card
          details are never sent to the server — only the brand and last four digits are kept with
          the order.
        </span>
      </div>

      <div className="d-flex flex-column gap-3 mb-4">
        {/* Card */}
        <div
          className="panel p-3 p-md-4"
          style={{ borderColor: method === 'card' ? 'var(--c-border-accent)' : 'var(--c-border)' }}
        >
          <label className="d-flex align-items-center gap-3" style={{ cursor: 'pointer' }}>
            <input
              className="form-check-input mt-0 flex-shrink-0"
              type="radio"
              name="payment-method"
              checked={method === 'card'}
              onChange={() => setMethod('card')}
            />
            <span className="flex-grow-1">Debit or credit card</span>
            {brand && <span className="badge">{brand}</span>}
          </label>

          {method === 'card' && (
            <div className="row g-3 mt-2">
              <div className="col-12">
                <label className="form-label" htmlFor="pay-number">
                  Card number
                </label>
                <input
                  id="pay-number"
                  className={`form-control${invalid('number') ? ' is-invalid' : ''}`}
                  value={card.number}
                  onChange={update('number', formatCardNumber)}
                  onBlur={onBlur('number')}
                  placeholder="4242 4242 4242 4242"
                  inputMode="numeric"
                  autoComplete="off"
                  aria-invalid={invalid('number')}
                />
                {invalid('number') && <div className="invalid-feedback d-block">{errors.number}</div>}
              </div>

              <div className="col-12">
                <label className="form-label" htmlFor="pay-name">
                  Name on card
                </label>
                <input
                  id="pay-name"
                  className={`form-control${invalid('name') ? ' is-invalid' : ''}`}
                  value={card.name}
                  onChange={update('name')}
                  onBlur={onBlur('name')}
                  autoComplete="off"
                  aria-invalid={invalid('name')}
                />
                {invalid('name') && <div className="invalid-feedback d-block">{errors.name}</div>}
              </div>

              <div className="col-6">
                <label className="form-label" htmlFor="pay-expiry">
                  Expiry
                </label>
                <input
                  id="pay-expiry"
                  className={`form-control${invalid('expiry') ? ' is-invalid' : ''}`}
                  value={card.expiry}
                  onChange={update('expiry', formatExpiry)}
                  onBlur={onBlur('expiry')}
                  placeholder="MM / YY"
                  inputMode="numeric"
                  autoComplete="off"
                  aria-invalid={invalid('expiry')}
                />
                {invalid('expiry') && <div className="invalid-feedback d-block">{errors.expiry}</div>}
              </div>

              <div className="col-6">
                <label className="form-label" htmlFor="pay-cvv">
                  Security code
                </label>
                <input
                  id="pay-cvv"
                  className={`form-control${invalid('cvv') ? ' is-invalid' : ''}`}
                  value={card.cvv}
                  onChange={(e) =>
                    setCard((c) => ({ ...c, cvv: digitsOnly(e.target.value).slice(0, cvvLength) }))
                  }
                  onBlur={onBlur('cvv')}
                  placeholder={'•'.repeat(cvvLength)}
                  inputMode="numeric"
                  autoComplete="off"
                  aria-invalid={invalid('cvv')}
                />
                {invalid('cvv') && <div className="invalid-feedback d-block">{errors.cvv}</div>}
              </div>
            </div>
          )}
        </div>

        {/* EFT */}
        <div
          className="panel p-3 p-md-4"
          style={{ borderColor: method === 'eft' ? 'var(--c-border-accent)' : 'var(--c-border)' }}
        >
          <label className="d-flex align-items-center gap-3" style={{ cursor: 'pointer' }}>
            <input
              className="form-check-input mt-0 flex-shrink-0"
              type="radio"
              name="payment-method"
              checked={method === 'eft'}
              onChange={() => setMethod('eft')}
            />
            <span className="flex-grow-1">Instant EFT</span>
            <span className="text-muted-gold small">Pay from your bank</span>
          </label>

          {method === 'eft' && (
            <div className="mt-3">
              <label className="form-label" htmlFor="pay-bank">
                Your bank
              </label>
              <select
                id="pay-bank"
                className="form-select"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
              >
                {BANKS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Demo aid: the numbers that drive each outcome */}
      {method === 'card' && (
        <details className="panel p-3">
          <summary className="small text-muted-gold" style={{ cursor: 'pointer' }}>
            Test card numbers
          </summary>
          <table className="table table-sm mt-3 mb-0 small">
            <tbody>
              {TEST_CARDS.map((test) => (
                <tr key={test.number}>
                  <td className="ps-0" style={{ fontFamily: 'monospace' }}>
                    <button
                      type="button"
                      className="btn btn-link-gold btn-sm p-0 text-lowercase"
                      style={{ letterSpacing: 0, fontFamily: 'monospace' }}
                      onClick={() => setCard((c) => ({ ...c, number: test.number }))}
                    >
                      {test.number}
                    </button>
                  </td>
                  <td className="text-muted-gold">{test.outcome}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="form-text mb-0">
            Any future expiry and any {cvvLength}-digit code will do.
          </p>
        </details>
      )}
    </>
  );
}
