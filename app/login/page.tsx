import LoginClient from './LoginClient';

export const dynamic = 'force-dynamic'; // don't prerender
// (optional) export const fetchCache = 'force-no-store';

export default function Page() {
  return <LoginClient />;
}
