/* AUTO-GENERATED from openapi/detent.json — do not edit. */
export interface paths {
    "/dashboard/billing/checkout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** `POST /dashboard/billing/checkout` — start a subscription Checkout Session. */
        post: operations["create_checkout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dashboard/billing/portal": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** `POST /dashboard/billing/portal` — start a Billing Portal Session. */
        post: operations["create_portal"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dashboard/billing/reconcile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * `POST /dashboard/billing/reconcile` — fast-path subscription sync on the
         *     checkout success redirect. Retrieves the Checkout Session, verifies it
         *     belongs to the caller, and — only if it was `paid` — fills in the account's
         *     subscription status. Idempotent and safe alongside the webhook: it sets a
         *     status only when none is set yet, so it never regresses a later
         *     past_due/canceled the webhook may have written, and doesn't stamp
         *     `last_stripe_event_at` (so subsequent webhook events still apply in order).
         */
        post: operations["reconcile"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dashboard/billing/usage": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * `GET /dashboard/billing/usage` — the session account's month rollup, for the
         *     billing quota-to-upgrade nudge. 404s when billing is disabled (consistent
         *     with the other `/dashboard/billing/*` routes); gated on the flag only, so it
         *     needs no Stripe client.
         */
        get: operations["dashboard_billing_usage"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dashboard/keys": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * `GET /dashboard/keys` — list the account's keys (active and revoked),
         *     newest first. Never returns the raw key or its hash.
         */
        get: operations["list_keys"];
        put?: never;
        /** `POST /dashboard/keys` — mint a new live API key for the account. */
        post: operations["create_key"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dashboard/keys/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * `DELETE /dashboard/keys/{id}` — soft-revoke the account's key (sets
         *     `revoked_at`). Idempotent for an owned key; 404 if unknown or owned by
         *     another account (no cross-tenant existence leak).
         */
        delete: operations["revoke_key"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dashboard/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** `GET /dashboard/me` — the authenticated account (proves JWT verification). */
        get: operations["me"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dashboard/namespaces": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** `GET /dashboard/namespaces` — the session account's namespace names, ascending. */
        get: operations["list_namespaces"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dashboard/namespaces/{ns}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * `DELETE /dashboard/namespaces/{ns}` — remove a namespace and its history for
         *     the session account. Idempotent: returns 204 whether or not it existed (a
         *     concurrent usage flush may already have removed or recreated it, and the SPA
         *     reloads the list afterward). Purges the default rule and `usage_daily`
         *     history; leaves `usage_monthly` (the per-account billing meter) and Redis TTL
         *     counters untouched. See
         *     docs/superpowers/specs/2026-07-03-dashboard-namespace-delete-design.md.
         */
        delete: operations["delete_namespace"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dashboard/namespaces/{ns}/rules": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * `PUT /dashboard/namespaces/{ns}/rules` — create or replace the namespace's
         *     default rule. Idempotent; also materializes the namespace. Validation mirrors
         *     `rules::create_rule`, plus a `concurrent_limit` guard (it is lease-based, not
         *     a `/v1/limit` default — see DECISIONS.md §2.3 / §4.3).
         */
        put: operations["put_rule"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dashboard/namespaces/{ns}/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** `GET /dashboard/namespaces/{ns}/stats` — aggregated usage for the session account. */
        get: operations["dashboard_stats"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dashboard/passkeys": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** `GET /dashboard/passkeys` — list the caller's enrolled passkeys. */
        get: operations["list_passkeys"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dashboard/passkeys/add/finish": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * `POST /dashboard/passkeys/add/finish` — complete the additional-passkey ceremony.
         * @description Step-up gated. Verifies the WebAuthn registration, CAS-claims the ceremony,
         *     stores the credential with the given name (or a User-Agent-derived fallback),
         *     emails a security notice, and returns the new row.
         */
        post: operations["add_passkey_finish"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dashboard/passkeys/add/start": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * `POST /dashboard/passkeys/add/start` — begin enrolling an additional passkey.
         * @description Step-up gated (`SudoAuth`). Excludes the account's existing credentials so a
         *     second passkey can't be minted on an authenticator already enrolled.
         */
        post: operations["add_passkey_start"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dashboard/passkeys/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * `DELETE /dashboard/passkeys/{id}` — remove a passkey.
         * @description Refused (409) when this would be the last passkey AND no unused recovery codes exist,
         *     to prevent an account from locking itself out of every factor-2 option.
         */
        delete: operations["delete_passkey"];
        options?: never;
        head?: never;
        /**
         * `PATCH /dashboard/passkeys/{id}` — rename an owned passkey.
         * @description Cosmetic, so access token only (no step-up). Name is trimmed and must be
         *     1–64 characters. Returns the updated row, or 404 if the id is not this
         *     account's.
         */
        patch: operations["rename_passkey"];
        trace?: never;
    };
    "/dashboard/rules": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * `GET /dashboard/rules` — every namespace for the session account with its
         *     optional default rule, ascending. One query (LEFT JOIN), no N+1.
         */
        get: operations["list_rules"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Liveness probe. */
        get: operations["health"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/leases": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** `POST /v1/leases` — acquire a concurrent-limit lease (`DECISIONS.md §1.3`). */
        post: operations["acquire_lease"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/leases/{lease_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * `DELETE /v1/leases/{lease_id}` — release a lease. Idempotent. Unlike acquire,
         *     a Redis outage is a `503` (NOT fail-open): a false "released" would mislead.
         */
        delete: operations["release_lease"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/limit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * `POST /v1/limit` handler. `AuthContext` is injected by the auth middleware
         *     (`crate::auth::require_auth`); the tenant `account_id` comes from the
         *     validated key, never the request body (`DECISIONS.md §3.3`).
         */
        post: operations["limit"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/namespaces/{ns}/keys/{key}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * `DELETE /v1/namespaces/{ns}/keys/{key}` — reset the limiter counter for one
         *     key. 204 (idempotent) on success; 503 if Redis is unavailable (NOT
         *     fail-open — a silent success while Redis is down would mislead the operator).
         */
        delete: operations["reset_key"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/namespaces/{ns}/rules": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** `GET /v1/namespaces/{ns}/rules` — fetch the namespace's rule (404 if none). */
        get: operations["read_rule"];
        put?: never;
        /** `POST /v1/namespaces/{ns}/rules` — create or replace the namespace's rule. */
        post: operations["create_rule"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/namespaces/{ns}/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** `GET /v1/namespaces/{ns}/stats` — aggregated daily usage from Postgres. */
        get: operations["get_stats"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/webhook": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** `GET /v1/webhook` — current config (404 if none). The secret is not returned. */
        get: operations["get_webhook"];
        /** `PUT /v1/webhook` — set or replace the account's webhook (rotates the secret). */
        put: operations["put_webhook"];
        post?: never;
        /** `DELETE /v1/webhook` — remove the webhook config. */
        delete: operations["delete_webhook"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        AccountResponse: {
            current_period_end?: string | null;
            email: string;
            /**
             * @description True once a Stripe customer exists — the SPA routes plan changes to the
             *     Billing Portal (existing customer) vs. Checkout (new).
             */
            has_billing_customer: boolean;
            id: string;
            in_good_standing: boolean;
            plan: string;
            subscription_status?: string | null;
            /** @description RFC3339; null while no trial / already subscribed past trial. */
            trial_ends_at?: string | null;
        };
        /**
         * @description Body for `POST /v1/leases`. `limit`/`window_ms` are optional: inline wins,
         *     else the namespace's `concurrent_limit` rule fills them (`§2.3`).
         */
        AcquireBody: {
            key: string;
            /**
             * Format: int64
             * @description Max concurrent slots. Optional when a concurrent rule exists.
             */
            limit?: number | null;
            namespace: string;
            /**
             * Format: int64
             * @description Lease TTL in milliseconds. Optional when a concurrent rule exists.
             */
            window_ms?: number | null;
        };
        /**
         * @description Response for `POST /v1/leases`. Always HTTP 200 (`§2.2`); `allowed` carries
         *     the verdict. `lease_id` is present only when `allowed` is true.
         *
         *     When `lease_id` is `null` due to fail-open (Redis unavailable), `active` and
         *     `reset_ms` are not meaningful measurements — they reflect no real state.
         */
        AcquireResponse: {
            /**
             * Format: int64
             * @description Active lease count after this call.
             */
            active: number;
            allowed: boolean;
            lease_id?: string | null;
            /** Format: int64 */
            limit: number;
            /**
             * Format: int64
             * @description When denied, ms until the soonest-expiring lease frees a slot.
             */
            reset_ms: number;
        };
        AddPasskeyFinishBody: {
            /** Format: uuid */
            challenge_id: string;
            credential: Record<string, never>;
            /** @description Optional device name (1–64 chars). Empty/absent → derived from User-Agent. */
            name?: string | null;
        };
        /**
         * @description Response body for both billing session endpoints: the Stripe-hosted URL to
         *     redirect the browser to.
         */
        BillingSessionUrl: {
            url: string;
        };
        CheckoutBody: {
            plan: string;
        };
        CreateKeyBody: {
            name?: string | null;
        };
        CreatedKey: {
            /** Format: date-time */
            created_at: string;
            id: string;
            /** @description The raw `dt_live_…` secret — shown ONCE, never retrievable again. */
            key: string;
            name?: string | null;
            prefix: string;
        };
        CredentialRow: {
            /** Format: date-time */
            created_at: string;
            /** Format: uuid */
            id: string;
            /** Format: date-time */
            last_used_at?: string | null;
            name?: string | null;
        };
        DayStat: {
            /** Format: int64 */
            blocked: number;
            day: string;
            /** Format: int64 */
            total: number;
        };
        /** @description The JSON body returned for every error response: `{ "error": "<message>" }`. */
        ErrorResponse: {
            /** @description Human-readable error message. Never contains internal/driver detail. */
            error: string;
        };
        KeySummary: {
            /** Format: date-time */
            created_at: string;
            id: string;
            /** Format: date-time */
            last_used_at?: string | null;
            name?: string | null;
            prefix: string;
            /** Format: date-time */
            revoked_at?: string | null;
        };
        /**
         * @description Request body for `POST /v1/limit`. The wire format uses `window_ms`
         *     (`DECISIONS.md §2.1`); `algorithm` deserializes from its snake_case name.
         *
         *     `algorithm`/`limit`/`window_ms` are optional: when omitted they fall back to
         *     the namespace's default rule (`§2.3`). Inline values win per-field.
         */
        LimitBody: {
            /** @example sliding_window */
            algorithm?: string | null;
            key: string;
            /** Format: int64 */
            limit?: number | null;
            namespace: string;
            /** Format: int64 */
            window_ms?: number | null;
        };
        /**
         * @description Response body. The endpoint always returns HTTP 200 (`DECISIONS.md §2.2`);
         *     `allowed` carries the verdict.
         */
        LimitResponse: {
            allowed: boolean;
            /** Format: int64 */
            limit: number;
            /** Format: int64 */
            remaining: number;
            /** Format: int64 */
            reset_ms: number;
        };
        /**
         * @description Current-month rollup + soft-quota state (`§4.2`), per account (across all
         *     namespaces). This is the data source for the dashboard quota banner.
         */
        MonthSummary: {
            month: string;
            over_quota: boolean;
            /** Format: int64 */
            quota?: number | null;
            /** Format: int64 */
            total: number;
        };
        /**
         * @description One namespace and its optional default rule. `rule` is null when the
         *     namespace exists (e.g. seen by a `/v1/limit` call) but has no default yet.
         */
        NamespaceRule: {
            namespace: string;
            rule?: null | components["schemas"]["Rule"];
        };
        ReconcileBody: {
            session_id: string;
        };
        /** @description Response for `DELETE /v1/leases/{lease_id}`. */
        ReleaseResponse: {
            /**
             * Format: int64
             * @description Active lease count after this call.
             */
            active: number;
            /** @description Whether a held lease was removed (false if already expired/released). */
            released: boolean;
        };
        RenamePasskeyBody: {
            /** @description New display name (1–64 characters after trimming). */
            name: string;
        };
        /**
         * @description The default rule for a namespace. `limit`/`window_ms` are `u64` on the wire
         *     but stored as `int`/`bigint`; values are range-checked before insert.
         */
        Rule: {
            /** @example sliding_window */
            algorithm: string;
            /** Format: int64 */
            limit: number;
            name?: string | null;
            namespace: string;
            /** Format: int64 */
            window_ms: number;
        };
        /** @description Body for `POST /v1/namespaces/{ns}/rules`. The namespace comes from the path. */
        RuleBody: {
            /** @example token_bucket */
            algorithm: string;
            /** Format: int64 */
            limit: number;
            name?: string | null;
            /** Format: int64 */
            window_ms: number;
        };
        StatsResponse: {
            /** Format: int64 */
            blocked: number;
            days: components["schemas"]["DayStat"][];
            month: components["schemas"]["MonthSummary"];
            namespace: string;
            /** Format: int64 */
            total: number;
        };
        WebhookConfig: {
            url: string;
        };
        WebhookConfigBody: {
            url: string;
        };
        WebhookCreated: {
            secret: string;
            url: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    create_checkout: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CheckoutBody"];
            };
        };
        responses: {
            /** @description Stripe Checkout Session URL */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BillingSessionUrl"];
                };
            };
            /** @description Unknown plan */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Billing is not enabled */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    create_portal: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Stripe Billing Portal URL */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BillingSessionUrl"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Billing is not enabled */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description No billing customer yet — subscribe first */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    reconcile: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReconcileBody"];
            };
        };
        responses: {
            /** @description Reconciled (or nothing to do yet) */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Session does not belong to this account */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Billing is not enabled */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    dashboard_billing_usage: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Account-wide current-month usage + soft quota (§4.2) */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MonthSummary"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Billing is not enabled */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    list_keys: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The account's keys, newest first */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["KeySummary"][];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    create_key: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateKeyBody"];
            };
        };
        responses: {
            /** @description Key created; the raw secret is shown once */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreatedKey"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Active key limit reached for plan */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    revoke_key: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description API key id */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Key revoked (idempotent for an owned key) */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Key not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    me: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The authenticated account */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccountResponse"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    list_namespaces: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The account's namespace names */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string[];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    delete_namespace: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Namespace name */
                ns: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Namespace deleted (idempotent) */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    put_rule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Namespace name */
                ns: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RuleBody"];
            };
        };
        responses: {
            /** @description Rule created or replaced */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Rule"];
                };
            };
            /** @description limit/window_ms invalid, or concurrent_limit */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Algorithm not available on the account's plan */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    dashboard_stats: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Namespace name */
                ns: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Aggregated daily usage + month/quota rollup (§4.2) */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StatsResponse"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    list_passkeys: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The account's enrolled passkeys */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CredentialRow"][];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    add_passkey_finish: {
        parameters: {
            query?: never;
            header: {
                /** @description Fresh WebAuthn step-up token (§3.5) */
                "X-Step-Up-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AddPasskeyFinishBody"];
            };
        };
        responses: {
            /** @description Passkey enrolled */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CredentialRow"];
                };
            };
            /** @description Bad ceremony state or name too long */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Missing/invalid access or step-up token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not this account's add-passkey ceremony */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Authenticator already enrolled (duplicate credential) */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Ceremony already completed */
            410: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    add_passkey_start: {
        parameters: {
            query?: never;
            header: {
                /** @description Fresh WebAuthn step-up token (§3.5) */
                "X-Step-Up-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description WebAuthn creation options */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing/invalid access or step-up token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    delete_passkey: {
        parameters: {
            query?: never;
            header: {
                /** @description Fresh WebAuthn step-up token (§3.5) */
                "X-Step-Up-Token": string;
            };
            path: {
                /** @description Passkey id */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Passkey removed (idempotent for an owned id) */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access/step-up token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Refused: would leave the account with no second factor */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    rename_passkey: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Passkey id */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RenamePasskeyBody"];
            };
        };
        responses: {
            /** @description Passkey renamed */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CredentialRow"];
                };
            };
            /** @description Name empty or longer than 64 chars */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description No such passkey for this account */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    list_rules: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The account's namespaces + optional default rules */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NamespaceRule"][];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    health: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Service is live */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    acquire_lease: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AcquireBody"];
            };
        };
        responses: {
            /** @description Lease decision — always 200; `allowed` carries the verdict, `lease_id` set when allowed */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AcquireResponse"];
                };
            };
            /** @description Malformed / missing limit+window_ms */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Missing or invalid API key */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description concurrent_limit is not available on the caller's plan (§4.3) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    release_lease: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Opaque lease handle from acquire */
                lease_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Release result (idempotent) */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReleaseResponse"];
                };
            };
            /** @description Malformed lease id */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Missing or invalid API key */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Redis unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    limit: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LimitBody"];
            };
        };
        responses: {
            /** @description Verdict — always 200, even when denied (DECISIONS.md §2.2) */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LimitResponse"];
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Missing or invalid API key */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Algorithm not available on the caller's plan (§4.3) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    reset_key: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Namespace name */
                ns: string;
                /** @description Limiter key to reset */
                key: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Counter reset (idempotent) */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description namespace/key empty */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Missing or invalid API key */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Redis unavailable (NOT fail-open here) */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    read_rule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Namespace name */
                ns: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The namespace's default rule */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Rule"];
                };
            };
            /** @description Missing or invalid API key */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description No rule for this namespace */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    create_rule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Namespace name */
                ns: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RuleBody"];
            };
        };
        responses: {
            /** @description Rule created or replaced */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Rule"];
                };
            };
            /** @description limit/window_ms invalid */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Missing or invalid API key */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Algorithm not available on the caller's plan (§4.3) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    get_stats: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Namespace name */
                ns: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Aggregated daily usage + month/quota rollup (§4.2) */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StatsResponse"];
                };
            };
            /** @description Missing or invalid API key */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    get_webhook: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Current webhook config (secret omitted) */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WebhookConfig"];
                };
            };
            /** @description Missing or invalid API key */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description No webhook configured */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    put_webhook: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WebhookConfigBody"];
            };
        };
        responses: {
            /** @description Webhook set/replaced; secret returned once */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WebhookCreated"];
                };
            };
            /** @description URL failed SSRF screening */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Missing or invalid API key */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Webhooks require the Pro or Scale plan */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    delete_webhook: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Webhook removed (idempotent) */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid API key */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
}
