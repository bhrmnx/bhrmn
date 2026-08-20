# Bhrmn — Privacy Notice

**Last updated: 16 August 2026**
**Applies to: the Bhrmn private beta (invite-only)**

> This notice is written to meet the notice and consent requirements of India's
> Digital Personal Data Protection Act, 2023 and the DPDP Rules, 2025. It is a
> founder-drafted document, not legal advice, and has not been reviewed by a
> lawyer. Have it reviewed before the beta opens to people outside your own network.

---

## Who we are

Bhrmn is a travel identity platform operated by Yash Thakur, an individual based in
India. Under the DPDP Act we are the **Data Fiduciary** for the personal data described
here. You are the **Data Principal**.

Contact for any privacy question, request or complaint: **hello@bhrmn.in**

## You must be 18 or over

Bhrmn is not for anyone under 18. The DPDP Act treats every person under 18 as a child
and requires verifiable parental consent plus a ban on profiling — obligations this beta
is not built to meet. You confirm you are 18 or over when you create an account. If we
learn an account belongs to someone under 18, we will delete it and its data.

## What we collect, and why

We collect only what a travel identity needs to work. Each item below is listed with the
specific purpose it serves — we do not collect anything "just in case".

| What | Why | Basis |
|---|---|---|
| Email address | To sign you in, and to send the one-time codes that do it | Consent |
| Display name and handle | To identify you to other travellers | Consent |
| Home city | To show you travellers passing through your city | Consent |
| Travel DNA (traveller types you pick) | To describe how you travel on your profile | Consent |
| Trips: places, dates, notes, companions, visibility | This is your travel record — the product itself | Consent |
| Travel documents you upload (tickets, boarding passes, booking confirmations) | To read the dates and route off them so a trip can be marked verified | Consent |
| Data read from those documents (route, dates, carrier, booking reference, the name printed on the ticket) | To propose a trip for you to confirm, and to keep an auditable record of what backed a verified trip | Consent |

**We do not collect** government identity documents (Aadhaar, PAN, passport data pages),
payment card details, precise location, contacts, or your device's photo library. Bhrmn
never reads your camera roll — you choose individual files to upload.

## Your travel documents

These get the strictest handling in the product, because a boarding pass carries your
name and booking reference.

- Stored in private cloud storage, partitioned per user. Access rules are enforced at the
  database level, so another Bhrmn user cannot read your documents even in error.
- **Never shown on your profile**, in the feed, or to anyone you travel with.
- Sent once to an AI model operated by Anthropic to extract the travel facts. The model
  is not trained on your document. It is processed to produce a result and not retained
  by us for any other purpose.
- Kept while the trip they verify exists, so a verified badge can be substantiated.
  Delete the trip or your account and they are deleted with it.

## Who else sees your data

- **Other Bhrmn users** see only what you choose: your profile, and trips you set to
  public or followers-only. Private trips are yours alone.
- **Companions you tag** see that trip, and must confirm before it appears on their profile.
- **Supabase** hosts our database, authentication and file storage.
- **Anthropic** processes uploaded documents to extract travel facts.
- **Resend** delivers your sign-in emails.

We do not sell your data. We do not share it with advertisers. We run no behavioural
advertising and no third-party ad tracking.

## Where your data lives

Our database and file storage are currently hosted in Singapore (Supabase, ap-southeast-1).
Document processing and email delivery may involve providers outside India. The DPDP Act
permits transfers outside India except to countries the Government restricts; we will
comply with any such restriction if one is notified.

## How long we keep it

- Your account data: until you delete your account.
- Trips and documents: until you delete the trip, or your account.
- Verification records: for as long as the verified trip exists, because they are what a
  verified badge stands on.
- Failed or discarded upload drafts: deleted with your account.

When you delete your account we erase your profile, trips, documents, uploaded files and
verification records. We do not keep a shadow copy.

## Your rights under the DPDP Act

You can, at any time:

- **Access** a summary of the personal data we hold about you and what we do with it
- **Correct** anything inaccurate, and complete anything incomplete — most of it is
  editable directly in the app
- **Erase** your data by deleting your account, in Profile → Delete account
- **Withdraw consent**, which for a consent-based service means deleting your account
- **Nominate** another person to exercise your rights if you die or become incapacitated
- **Complain** to us at hello@bhrmn.in, and if unsatisfied, to the **Data Protection
  Board of India**

We aim to answer any request within 30 days.

## Security

- All traffic is encrypted in transit.
- Access to your rows and files is enforced by database-level row security, not by
  application code alone, so a bug in the app cannot expose another user's data.
- Verification cannot be self-declared: the app is structurally unable to mark a trip
  verified, which prevents both fraud and accidental corruption of the record.
- We use one-time email codes rather than passwords, so there is no password of yours to leak.

If a breach affecting your data occurs, we will notify you and the Data Protection Board
as required.

## Changes

If this notice changes in a way that affects what we collect or why, we will tell you in
the app before the change takes effect and ask for consent again where the law requires it.

---

## Open items before public launch

Tracked honestly rather than hidden:

1. Legal review by an Indian data protection practitioner.
2. A named Grievance Officer with published contact details, once an entity exists.
3. A machine-readable data export, to serve access requests properly.
4. Re-assessment of hosting region — currently Singapore, Mumbai would keep data in India.
5. Consent-manager integration, if Bhrmn's scale later brings it into scope
   (registration obligations begin November 2026).
