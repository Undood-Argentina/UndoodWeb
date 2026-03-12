import { redirect } from 'next/navigation';

// Campaign disabled — redirect to home instead of /christmas
const CHRISTMAS_DISABLED = true;

export default function NavidadPage() {
  redirect(CHRISTMAS_DISABLED ? '/' : '/christmas');
}
