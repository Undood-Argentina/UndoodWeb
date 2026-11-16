import { redirect } from 'next/navigation';

// Campaign disabled — redirect to home instead of /christmas
const CHRISTMAS_DISABLED = false;

export default function NavidadPage() {
  redirect(CHRISTMAS_DISABLED ? '/' : '/campana/navidad');
}
