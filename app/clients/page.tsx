"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClientsList } from "@/components/clients/clients-list"
import { CreateClientForm } from "@/components/clients/create-client-form"

export default function ClientsPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const handleClientCreated = (newClient: any) => {
    setClients((prevClients) => [...prevClients, newClient])
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Clients</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientsList 
            clients={clients} 
            setClients={setClients}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </CardContent>
      </Card>

      {isCreating && (
        <CreateClientForm 
          onClose={() => setIsCreating(false)}
          onClientCreated={handleClientCreated}
        />
      )}
    </div>
  )
}