# PostHog Setup Report

## Integration Summary

PostHog analytics has been integrated into this Astro static site using the PostHog web snippet approach (no npm package required). The snippet is loaded on every page via a shared layout component.

## Configuration

| Setting | Value |
|---|---|
| Host | `PUBLIC_POSTHOG_HOST` env var |
| Token | `PUBLIC_POSTHOG_PROJECT_TOKEN` env var |
| Snippet defaults | `2026-01-30` |
| Rendering mode | Static (SSG) |

Environment variables are stored in `.env` and must also be set in your deployment environment.

## Files Changed

| File | Change |
|---|---|
| `src/components/posthog.astro` | **Created** — PostHog web snippet, loaded in `<head>` on every page |
| `src/layouts/Layout.astro` | Added `<PostHog />` import and component to `<head>` |
| `src/components/GuestbookApp.tsx` | Added identity, sign-in/out, message submission, and error tracking |
| `src/components/Achievements.astro` | Added `achievement_unlocked` capture in the `unlock()` function |
| `src/pages/blog/[slug].astro` | Added `blog_post_viewed` capture with slug, title, and tags |
| `src/pages/blog/index.astro` | Added `blog_post_card_clicked` capture on post card clicks |
| `src/pages/Contact.astro` | Added `contact_page_viewed` capture |
| `.env` | Added `PUBLIC_POSTHOG_PROJECT_TOKEN` and `PUBLIC_POSTHOG_HOST` |

## Events Tracked

| Event | Where | Properties |
|---|---|---|
| `achievement_unlocked` | `Achievements.astro` | `achievement_id`, `achievement_name` |
| `guestbook_message_submitted` | `GuestbookApp.tsx` | `has_site_url`, `has_button_url` |
| `guestbook_sign_in_clicked` | `GuestbookApp.tsx` | `provider` (`github` \| `hackclub`) |
| `guestbook_sign_out_clicked` | `GuestbookApp.tsx` | — |
| `blog_post_viewed` | `blog/[slug].astro` | `slug`, `title`, `tags` |
| `blog_post_card_clicked` | `blog/index.astro` | `title`, `slug` |
| `contact_page_viewed` | `Contact.astro` | — |

Pageviews and sessions are captured automatically by the PostHog web snippet.

## User Identity

When a visitor signs in to the guestbook, `posthog.identify()` is called with their username and OAuth provider. When they sign out, `posthog.reset()` is called to clear the identity.

## Dashboard

**Analytics basics** — [https://us.posthog.com/project/354349/dashboard/1391772](https://us.posthog.com/project/354349/dashboard/1391772)

| Insight | Type | Description |
|---|---|---|
| Pageviews (last 30 days) | Line chart | Daily pageview trend |
| Blog post views | Line chart | `blog_post_viewed` events over time |
| Guestbook messages submitted | Line chart | `guestbook_message_submitted` events over time |
| Achievement unlock breakdown | Bar chart | Which achievements are unlocked most, broken down by `achievement_id` |
| Sign-in provider breakdown | Pie chart | GitHub vs Hack Club sign-in preference |
