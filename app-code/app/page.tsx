import { redirect } from 'next/navigation';

export default async function RootPage() {
  // Directly redirect to the secure login gateway page.
  // The middleware will handle session checks and redirect logged-in users back to /admin.
  redirect('/admin/login');
}
