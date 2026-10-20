# Survey Flow Backend Guidelines

This file defines the current coding conventions for contributors and coding agents. Keep it practical and update it when the team establishes a new pattern through real implementation work.

## Package Structure

All application code lives under `com.surveyflow`.

- `common.enums`: shared domain enums.
- `config`: Spring and application configuration.
- `config.properties`: typed configuration properties.
- `controller`: REST API endpoints.
- `dto.request`: incoming API contracts.
- `dto.response`: outgoing API contracts.
- `exception`: application exceptions and global exception handling.
- `factory`: object creation and mapping helpers when a dedicated factory is useful.
- `model`: JPA entities.
- `model.id`: composite identifier classes.
- `repository`: Spring Data JPA repositories.
- `security`: authentication and authorization components.
- `service`: service contracts.
- `service.impl`: service implementations.

Place new code in the closest existing package. Add a new package only when it represents a clear responsibility that does not fit the current structure.

## Entity Associations

- Use `FetchType.LAZY` by default for entity associations, including `@ManyToOne` and `@OneToOne`.
- Declare the fetch type explicitly instead of relying on JPA defaults.
- Load related data intentionally in repository queries or service use cases when it is required.
- Avoid adding bidirectional associations unless both navigation directions are needed by a concrete use case.

## API Contracts

- Controllers must not return JPA entities directly.
- Request and response payloads must use classes from `dto.request` and `dto.response`.
- Request and response DTOs must be standalone classes or records in the corresponding DTO packages; do not declare request/response types inside controller classes.
- Perform entity-to-response mapping before returning data from a controller.
- Do not expose persistence-only fields or entity relationships through the API accidentally.
- Give every Bean Validation constraint in request DTOs a concise English client-facing message.
- Do not repeat the field name in validation messages because the global handler already includes the property path.
- Use annotation placeholders such as `{min}`, `{max}`, and `{value}` instead of hard-coded limits.
- Prefer enum-typed request DTO fields so Jackson converts JSON strings directly to Java enums; malformed enum values must return HTTP 400 through the global request-body error handler.
- Optional enum fields may be null; add `@NotNull` only when required. Use `String` with `@EnumValue` only when a use case explicitly needs string-specific normalization or validation messages.
- Use plain request records with Bean Validation annotations; keep parsing logic out of DTOs. Use `PUT` for full replacement of editable fields and document how null and omitted fields are handled.
- Use Spring Data `Pageable` and `Page` for database-backed pagination; do not load every record and slice the list in memory.
- If eligibility requires in-memory filtering, redesign the query or explicitly document why database pagination is not yet possible.
- Controllers receive and validate pagination request parameters only; services own `Pageable` construction, default sorting, and the sortable-field allowlist.
- Public pagination is 1-based: accept `page >= 1`, convert it before creating `PageRequest`, and return `PageResponse.page` as 1-based.

## JavaDoc

- Write concise, one-sentence Vietnamese JavaDoc that explains a method's purpose.
- Document every service interface method and every public method of a service without an interface.
- Do not repeat interface JavaDoc on overriding service implementation methods.
- Document controller endpoint methods by their business action; do not repeat the HTTP method or path.
- Document repository methods only when they use a custom query, locking, side effects, or business meaning that is not obvious from the method name.
- Document private service methods only when they contain a notable business rule, transaction, concurrency behavior, or side effect.
- Omit `@param`, `@return`, and `@throws` when names and types already make them clear.
- Do not add JavaDoc to trivial mapping, normalization, getter, or derived-query methods.

## Method Layout

- Separate distinct business steps in a method with one blank line, such as loading data, validating state, applying changes, persisting, and returning a response.
- Keep statements that implement the same small operation together; do not add blank lines mechanically between every statement.
- Add a short `//` comment immediately above a complex `if` to explain its business rule; do not restate simple boolean checks.

## Exceptions

- Use `BusinessException` when a request is structurally valid but violates a business rule.
- Use `ConflictException` when an operation conflicts with existing state, such as a duplicate unique value or an invalid state transition caused by concurrent or existing data.
- Let Spring Security handle unauthenticated and forbidden requests unless the project later establishes a custom security response contract.
- Do not use exceptions as a replacement for normal control flow.

## Logging

- Use Lombok `@Slf4j(topic = "...")` on classes that record application events. Build the uppercase topic from the class responsibility and layer, separated by hyphens (for example, `SURVEY-CONTROLLER`, `SURVEY-PARTICIPATION-SERVICE`, `SURVEY-SECURITY-SUPPORT-SERVICE`).
- Log important requests at the controller boundary and business outcomes or state transitions in services. Avoid routine read-only request logs and duplicate success messages across layers.
- For credit movements, include the relevant IDs, amount, and balances before and after the change. Use `warn` for rejected operations caused by inconsistent or insufficient funds.
- Never log credentials, tokens, completion codes, raw webhook payloads, personal profile fields, or untrusted request bodies. Prefer stable IDs and counts.
- Logs emitted inside a transaction describe work attempted in that transaction; the persisted transaction remains the source of truth if a later rollback occurs.

## Database Migrations

- Every database schema or shared-data change must be implemented through a Flyway migration in `src/main/resources/db/migration`.
- Do not rely on Hibernate to modify the schema. Keep `spring.jpa.hibernate.ddl-auto` set to `validate` outside isolated experiments.
- Never edit a migration that has already been applied to a shared environment. Add a new versioned migration instead.
- Keep JPA mappings and Flyway migrations consistent in the same change.

## Spring Profiles

- `application.yml`: configuration shared by all environments.
- `application-dev.yml`: local development configuration.
- `application-test.yml`: automated test configuration, including the in-memory test database.
- `application-staging.yml`: staging deployment configuration when a staging environment is introduced.
- `application-prod.yml`: production configuration.

Environment-specific credentials and infrastructure values must be supplied through environment variables. The `test` profile is for automated tests; it is not the staging environment.

## Secrets

- Never commit passwords, API keys, JWT secrets, access tokens, private keys, or environment-specific credentials.
- Local environment files such as `.env` and `.dev.env` must remain ignored by Git.
- Commit only safe placeholders and variable names in example configuration files such as `.env.example`.
- Before committing, review staged changes for accidental secrets.

## Verification

- Run `./mvnw test` before considering a code change complete.
- Add or update tests when changing business rules, repository behavior, API contracts, security behavior, or database mappings.
- A change is not complete while relevant tests are failing.
- If a required test cannot be run, state that clearly when handing off the change.
