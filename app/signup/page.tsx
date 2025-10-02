import SignupClient from './SignupClient';

export const dynamic = 'force-dynamic'; // don't prerender
// (optional) export const fetchCache = 'force-no-store';

export default function Page() {
  return <SignupClient />;
}
