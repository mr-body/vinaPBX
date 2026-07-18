import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAsteriskContact, deleteAsteriskContact, listAsteriskContacts, updateAsteriskContact } from "@/service/pjsip";
import { getEndpoints } from "@/service/asterisk/endpoints";

export const Route = createFileRoute("/new-contact")({
  component: NewContact,
});

const CONTACTS_QUERY_KEY = ["asterisk-contacts"];

function NewContact() {
  const queryClient = useQueryClient();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [editingUsername, setEditingUsername] = useState<string | null>(null);

  const isEditing = editingUsername !== null;

  const contactsQuery = useQuery({
    queryKey: CONTACTS_QUERY_KEY,
    queryFn: () => getEndpoints(),
    refetchInterval: 5000, // acompanha o estado online/offline
  });

  function resetForm() {
    setUsername("");
    setPassword("");
    setEditingUsername(null);
  }

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: createAsteriskContact,
    onSuccess: () => {
      invalidate();
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateAsteriskContact,
    onSuccess: () => {
      invalidate();
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAsteriskContact,
    onSuccess: () => {
      invalidate();
      if (editingUsername) resetForm();
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const saveError = createMutation.error ?? updateMutation.error;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isEditing) {
      updateMutation.mutate({
        data: { username: editingUsername!, password },
      });
    } else {
      createMutation.mutate({ data: { username, password } });
    }
  }

  function handleEditClick(contactUsername: string) {
    setEditingUsername(contactUsername);
    setUsername(contactUsername);
    setPassword("");
  }

  function handleDelete(contactUsername: string) {
    if (!confirm(`Remover o contacto ${contactUsername}?`)) return;
    deleteMutation.mutate({ data: { username: contactUsername } });
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">
        {isEditing ? `Editar contacto ${editingUsername}` : "Novo contacto SIP"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="border rounded p-2 w-full disabled:bg-gray-100"
          placeholder="Extensão (ex: 1001)"
          value={username}
          disabled={isEditing}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="border rounded p-2 w-full"
          placeholder={isEditing ? "Nova password" : "Password"}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
            type="submit"
            disabled={isSaving || !username || !password}
          >
            {isSaving
              ? "Salvando..."
              : isEditing
                ? "Atualizar contacto"
                : "Criar contacto"}
          </button>

          {isEditing && (
            <button
              type="button"
              className="border rounded px-4 py-2"
              onClick={resetForm}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {saveError && (
        <p className="mt-4 text-red-600">{(saveError as Error).message}</p>
      )}

      <hr className="my-6" />

      <h2 className="text-lg font-semibold mb-2">Contactos existentes</h2>

      {contactsQuery.isLoading && <p>Carregando...</p>}
      {contactsQuery.isError && (
        <p className="text-red-600">
          {(contactsQuery.error as Error).message}
        </p>
      )}

      <ul className="space-y-2">
        {contactsQuery.data?.map((contact) => (
          <li
            key={contact.resource}
            className="flex items-center justify-between border rounded p-2"
          >
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-2 h-2 rounded-full ${contact.state === "online" ? "bg-green-500" : "bg-gray-400"
                  }`}
              />
              <span>{contact.resource}</span>
            </div>

            <div className="flex gap-2">
              <button
                className="text-sm text-blue-600"
                onClick={() => handleEditClick(contact.resource)}
              >
                Editar
              </button>
              <button
                className="text-sm text-red-600"
                disabled={deleteMutation.isPending}
                onClick={() => handleDelete(contact.resource)}
              >
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>

      {contactsQuery.data?.length === 0 && (
        <p className="text-gray-500">Nenhum contacto encontrado.</p>
      )}
    </div>
  );
}