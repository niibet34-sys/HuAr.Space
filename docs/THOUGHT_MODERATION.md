# HUAR Thought Moderation

Thoughts are stored in the Cloudflare D1 database `huar-archive`.

## Status model

- `pending` — submitted and immediately shareable by its unlisted token, but not eligible for public HUAR discovery.
- `approved` — approved for future public HUAR surfaces and indexable permalink.
- `rejected` — unavailable from the public permalink/API.

New submissions always start as `pending`.

## Review queue

```sql
SELECT id, thought, display_name, created_at, share_token, source_referral
FROM thoughts
WHERE status = 'pending'
ORDER BY created_at ASC;
```

Approve:

```sql
UPDATE thoughts
SET status = 'approved'
WHERE id = 'THOUGHT_ID';
```

Reject:

```sql
UPDATE thoughts
SET status = 'rejected'
WHERE id = 'THOUGHT_ID';
```

## Privacy

`optional_email` is never returned by the public API and must never be rendered on public HUAR pages.

## Growth analytics

Referral and sharing events are recorded in `analytics_events`.
The main funnel can be queried by `event_name`, `referral_token`, and `thought_id`.
