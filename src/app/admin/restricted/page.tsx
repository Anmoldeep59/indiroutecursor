import { PageTitle, Panel, Alert } from "@/components/ui/ui";

export default function RestrictedAdminPage() {
  return (
    <div>
      <PageTitle title="Restricted items"  variant="dark" />
      <Alert tone="warn">
        [FOUNDER INPUT REQUIRED] Confirm final AU air prohibited list before launch.
      </Alert>
      <Panel className="mt-4 !border-zinc-700 !bg-zinc-950 space-y-2 text-sm">
        <p>Prohibited: weapons, explosives, illegal drugs, generally currency/bullion.</p>
        <p>
          Restricted / often refuse at launch: alcohol, plants/seeds, many foods, medicines,
          aerosols, perfume, undeclared lithium batteries.
        </p>
        <p>Customer-facing copy lives on /prohibited.</p>
      </Panel>
    </div>
  );
}
