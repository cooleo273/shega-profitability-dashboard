"use client"

import { useState, useEffect } from "react"
import { Loader2, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

interface ClientsListProps {
  clients: Client[]
  setClients: (clients: Client[]) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function ClientsList({ clients, setClients, isLoading, setIsLoading }: ClientsListProps) {
  
  // Fetch clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/clients')
        if (response.ok) {
          const data = await response.json()
          setClients(data)
        }
      } catch (error) {
        console.error('Error fetching clients:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClients()
  }, [setClients, setIsLoading])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Address</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id}>
            <TableCell>{client.name}</TableCell>
            <TableCell>{client.email}</TableCell>
            <TableCell>{client.phone}</TableCell>
            <TableCell>{client.address}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}