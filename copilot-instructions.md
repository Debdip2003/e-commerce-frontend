# GitHub Copilot Instructions - Forever Ecommerce

## General Principles
- Follow modular, component-based architecture.
- Keep every file focused on a single responsibility.
- Reuse existing components, hooks, utilities, and services before creating new ones.
- Prefer readability and maintainability over cleverness.
- Use environment variables for configuration and secrets; never hardcode them.
- Add comments only when the logic is not self-explanatory.

## Frontend: React + Tailwind CSS
- Use functional components and React hooks only.
- Break UI into small, reusable, composable components.
- Keep route-level logic in pages/ and shared UI in components/.
- Keep reusable logic in hooks/.
- Keep API calls centralized in services/ or api/; do not fetch directly inside components.
- Use Tailwind utility classes directly in JSX.
- Prefer props for anything that varies; avoid duplicated hardcoded markup.
- Handle loading, error, and empty states explicitly.
- Ensure accessibility with semantic HTML, keyboard support, and aria labels where needed.
- Use PropTypes for every component that accepts props.
- Optimize renders only when there is a real need.

## Testing
- Add or update tests alongside new reusable components and hooks.
- Prefer Jest and React Testing Library for user-facing behavior.
- Test success, loading, empty, and error states when applicable.
- Keep tests close to the behavior users observe, not implementation details.

## Project Structure
- components/ for reusable presentational pieces.
- pages/ for route-level composition.
- hooks/ for reusable logic.
- context/ for global state.
- utils/ for pure helpers.
- services/ for API and data access.

## Before Suggesting Code
- Check for an existing reusable implementation first.
- Suggest the right folder and file based on the structure above.
- Call out security or performance concerns when relevant.
- Include test coverage with the implementation, not after it.

## Backend Guidance
- If backend work appears in this repo, follow MVC plus service-layer separation.
- Keep routes thin, controllers focused on request/response, and business logic in services.
- Validate input, secure auth, and centralize error handling.
