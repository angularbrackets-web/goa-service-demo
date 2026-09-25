import {
  GoabAppHeader,
  GoabBadge,
  GoabCallout,
  GoabPageBlock,
} from '@abgov/react-components';
import { Link, Outlet } from 'react-router';

/**
 * Page chrome. The header comes from the GoA Design System. Three deliberate
 * choices keep this from being mistaken for a real government service:
 * - no microsite (phase) banner - its fixed text says "Alberta Government service"
 * - a non-dismissible "unofficial demo" callout on every page
 * - our own footer instead of GoabAppFooter, which always renders the GoA
 *   logo and "© Government of Alberta" with no option to change them
 */
export function Layout({ width = '704px' }: { width?: string }) {
  return (
    <>
      <a href="#main" className="visually-hidden skip-link">
        Skip to main content
      </a>
      <GoabAppHeader
        url="/"
        heading="Report a road issue"
        secondaryText="Unofficial demo"
        phase={<GoabBadge type="important" content="Demo" icon={false} />}
      />

      <div className="demo-banner">
        <GoabPageBlock width={width}>
          <GoabCallout
            type="important"
            size="medium"
            heading="Unofficial personal demo"
          >
            This is not a Government of Alberta service and is not affiliated
            with or endorsed by the Government of Alberta. Do not enter real
            personal information.
          </GoabCallout>
        </GoabPageBlock>
      </div>

      <main id="main">
        <GoabPageBlock width={width}>
          <Outlet />
        </GoabPageBlock>
      </main>

      <footer className="site-footer">
        <GoabPageBlock width="full">
          <nav aria-label="Footer" className="site-footer__links">
            <Link to="/privacy">Privacy notice</Link>
            <Link to="/staff">Staff triage (demo)</Link>
            <a href="https://design.alberta.ca">
              GoA Design System (open source, Apache 2.0)
            </a>
          </nav>
          <p>
            © {new Date().getFullYear()} Mohammad Najimudeen · Unofficial demo
          </p>
        </GoabPageBlock>
      </footer>
    </>
  );
}
