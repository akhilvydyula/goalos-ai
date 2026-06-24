/** Demo accounts for local / staging — also seeded in Postgres via `npm run saas:db:seed` */
export const DEMO_PASSWORD = "Demo1234!";

export const DEMO_ACCOUNTS = [
  {
    id: "owner",
    label: "Owner (full admin)",
    email: "admin@demo.goalos",
    password: DEMO_PASSWORD,
    displayName: "Demo Admin",
    orgName: "Atopush Demo",
    role: "OWNER" as const,
    plan: "ENTERPRISE",
  },
  {
    id: "member",
    label: "Member (workspace only)",
    email: "member@demo.goalos",
    password: DEMO_PASSWORD,
    displayName: "Demo Member",
    orgName: "Atopush Demo",
    role: "MEMBER" as const,
    plan: "ENTERPRISE",
  },
] as const;

export function findDemoAccount(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  return DEMO_ACCOUNTS.find(
    (a) => a.email === normalized && a.password === password
  );
}
