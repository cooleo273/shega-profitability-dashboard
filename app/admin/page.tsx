export default function AdminPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Admin Settings</h1>
      <p className="text-muted-foreground">Manage system settings and user permissions.</p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          "User Management",
          "Role Permissions",
          "System Configuration",
          "Billing Settings",
          "Integrations",
          "Audit Logs",
        ].map((setting, i) => (
          <div key={i} className="rounded-lg border bg-card p-4 shadow-sm">
            <h2 className="text-lg font-medium">{setting}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Configure and manage {setting.toLowerCase()}.</p>
          </div>
        ))}
      </div>
    </div>
  )
}
