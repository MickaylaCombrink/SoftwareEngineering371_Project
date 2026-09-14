# SEN371 — User Acceptance Test Script

Scentigue online perfume store · Milestone 5

---

## How to run a session

Recruit **5–8 participants** who have not seen the application. Five is enough
to surface the majority of usability problems; more than eight rarely finds new
ones.

Before starting, tell the participant:

> We are testing the website, not you. There are no wrong answers. Please think
> aloud as you go — say what you are looking for, what you expect to happen,
> and anything that confuses you. If you get stuck, that is useful information,
> so please say so rather than asking me for help.

**Do not** demonstrate anything, point at the screen, or answer "where do I
click" questions. Record what happens; help only if the participant is fully
blocked, and mark that task as failed.

Set up before each session: reset the browser (signed out, empty cart), have
the app running, and have the observation sheet ready.

---

## Tasks

Each task has a starting state, the words read to the participant, and a
success criterion that does not depend on the observer's judgement.

### Task 1 — Find a product

**Start:** home page, signed out.
**Say:** "You are shopping for an oud fragrance for under R900. Find one you'd
consider buying."

**Success:** the participant reaches a product detail page for a product in the
Oud category priced under R900, without being told where to look.

**Watch for:** do they use the category tiles, the nav, or the catalogue
filters? Do they notice the price filter exists?

---

### Task 2 — Create an account

**Start:** wherever Task 1 ended.
**Say:** "You have decided to buy it. Set yourself up so you can place an order."

**Success:** a customer account is created and the participant is signed in.

**Watch for:** do they find Register from where they are? Is the password rule
clear *before* they submit? Does the strength meter mean anything to them?

---

### Task 3 — Add to cart and adjust

**Start:** signed in, on a product page.
**Say:** "Add two of this fragrance to your cart, then change your mind and
make it one."

**Success:** the cart contains exactly one unit of that product.

**Watch for:** do they find the quantity stepper? Do they understand the cart
badge in the header? Do they change quantity on the product page or in the cart?

---

### Task 4 — Complete a purchase

**Start:** cart with one item.
**Say:** "Buy it. Use the card number 4242 4242 4242 4242, any future expiry
date and any three-digit security code."

**Success:** the participant reaches the confirmation page and can state their
order number when asked.

**Watch for:** do they understand it is a simulation? Do they hesitate to enter
card details? Is the two-step delivery-then-payment split clear? Do they notice
the free delivery threshold?

---

### Task 5 — Recover from a declined payment

**Start:** a fresh cart with one item, at checkout.
**Say:** "Try to pay with the card 4000 0000 0000 0002."

**Success:** the participant recognises the payment failed and can say, in
their own words, what they would do next.

**Watch for:** is the decline message noticed at all? Do they believe the order
was placed anyway? This is the most common failure in e-commerce usability.

---

### Task 6 — Find a past order

**Start:** signed in, after Task 4.
**Say:** "Check what you have ordered and when it should arrive."

**Success:** the participant reaches order history and states the delivery
window.

---

### Task 7 — Administrator: restock a product *(admin participants only)*

**Start:** signed in as an administrator.
**Say:** "One of your fragrances has sold out. Put 15 units back in stock."

**Success:** the product's stock reads 15 in the admin product list.

**Watch for:** do they find the admin area? Is it obvious which products need
attention? Do they trust that the change saved?

---

### Task 8 — Administrator: fulfil an order *(admin participants only)*

**Start:** admin, orders screen.
**Say:** "An order has been packed and sent. Record that, and record that the
customer has paid."

**Success:** the order shows Shipping and Paid.

---

## Observation sheet

One row per task, per participant.

| Task | Completed unaided? | Time | Errors / wrong turns | Verbatim quote | Severity |
|---|---|---|---|---|---|
| 1 Find a product | ☐ Yes ☐ With help ☐ No | | | | |
| 2 Create an account | ☐ Yes ☐ With help ☐ No | | | | |
| 3 Add and adjust | ☐ Yes ☐ With help ☐ No | | | | |
| 4 Complete a purchase | ☐ Yes ☐ With help ☐ No | | | | |
| 5 Declined payment | ☐ Yes ☐ With help ☐ No | | | | |
| 6 Find a past order | ☐ Yes ☐ With help ☐ No | | | | |
| 7 Restock *(admin)* | ☐ Yes ☐ With help ☐ No | | | | |
| 8 Fulfil order *(admin)* | ☐ Yes ☐ With help ☐ No | | | | |

**Severity scale**

| | Meaning | Action |
|---|---|---|
| 1 | Cosmetic — noticed, did not impede | Fix if time allows |
| 2 | Minor — slowed them down | Fix before submission |
| 3 | Major — needed help or took a wrong path | Must fix |
| 4 | Critical — could not complete the task | Must fix, retest |

---

## Post-session questions

1. What, if anything, would stop you buying from this site?
2. Was there any point where you were not sure what would happen next?
3. Did you at any stage think you had been charged real money?
4. On a scale of 1 to 5, how easy was it to buy something?

---

## Reporting

Summarise findings in `docs/TEST_REPORT.md` section 5: the issue, how many of the
participants hit it, its severity, and what was changed in response. An issue
found by two or more participants is a pattern, not a one-off.
