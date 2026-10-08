# HUAR Founding Circle Requests

Founding Circle inquiries are stored in the Cloudflare D1 database `huar-archive`.

## Status model

- `new` — newly received request, awaiting review
- `contacted` — Roman has replied personally
- `accepted` — founding place confirmed/reserved
- `declined` — request closed without a founding place

## Review queue

```sql
SELECT id, name, email, country, note, created_at, source_referral
FROM founder_requests
WHERE status = 'new'
ORDER BY created_at ASC;
```

Mark as contacted:

```sql
UPDATE founder_requests
SET status = 'contacted'
WHERE id = 'REQUEST_ID';
```

Confirm:

```sql
UPDATE founder_requests
SET status = 'accepted'
WHERE id = 'REQUEST_ID';
```

Decline:

```sql
UPDATE founder_requests
SET status = 'declined'
WHERE id = 'REQUEST_ID';
```

The public First 100 counter is intentionally controlled separately in `src/config.ts`. A submitted request does not automatically consume a founding place; only a genuinely confirmed reservation should increase the reserved count.

## Privacy

The email address, country and optional note are private lead data and must never be exposed through a public endpoint.

The public website does not display a founding contribution amount. Founding details and payment steps are shared privately after personal review.

## Direct email fallback

`founders@huar.space` continues to route to Roman's personal Gmail for people who prefer to contact the founder directly.


## Email notification

Every new web-form request is also sent through the private Cloudflare service `huar-founder-notify` to the verified destination `romanderothschild@gmail.com`.

The notification is sent from `founders@huar.space` and contains the applicant's name, email, country, optional note and request ID. Roman should reply personally from his Gmail to the applicant's email.

The notifier is connected to Pages through a private service binding and protected by an internal secret; the notification endpoint is not exposed in the client.
