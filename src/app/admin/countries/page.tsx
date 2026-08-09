import { PageTitle, Panel, Alert } from "@/components/ui/ui";

export default function CountriesAdminPage() {
  return (
    <div>
      <PageTitle title="Countries" subtitle="Beta corridor lock" />
      <Alert tone="info">Australia (AU) enabled. All other destinations blocked at checkout.</Alert>
      <Panel className="mt-4 !border-zinc-700 !bg-zinc-950 text-sm">
        <p>IN → AU: live</p>
        <p className="text-zinc-400">NZ / UK / CA / US: not in Beta</p>
      </Panel>
    </div>
  );
}
