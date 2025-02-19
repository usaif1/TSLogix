import React from "react";

const EntryRecordsTable: React.FC = () => {
  const users = [
    {
      name: "Alexander",
      surname: "Foley",
      email: "alexander.foley@gmail.com",
      phone: "+237 6 99 88 77 66",
      status: "Validé",
      statusColor: "bg-green-100 text-green-700",
    },
    {
      name: "Alexander",
      surname: "Foley",
      email: "alexander.foley@gmail.com",
      phone: "+237 6 99 88 77 66",
      status: "Actif",
      statusColor: "bg-orange-100 text-orange-700",
    },
    {
      name: "Alexander",
      surname: "Foley",
      email: "alexander.foley@gmail.com",
      phone: "+237 6 99 88 77 66",
      status: "Inactif",
      statusColor: "bg-red-100 text-red-700",
    },
    {
      name: "Alexander",
      surname: "Foley",
      email: "alexander.foley@gmail.com",
      phone: "+237 6 99 88 77 66",
      status: "Validé",
      statusColor: "bg-green-100 text-green-700",
    },
    {
      name: "Alexander",
      surname: "Foley",
      email: "alexander.foley@gmail.com",
      phone: "+237 6 99 88 77 66",
      status: "Inactif",
      statusColor: "bg-red-100 text-red-700",
    },
    {
      name: "Alexander",
      surname: "Foley",
      email: "alexander.foley@gmail.com",
      phone: "+237 6 99 88 77 66",
      status: "Validé",
      statusColor: "bg-green-100 text-green-700",
    },
  ];

  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="px-4 py-2 text-left">Noms</th>
            <th className="px-4 py-2 text-left">Prénoms</th>
            <th className="px-4 py-2 text-left">E-mails</th>
            <th className="px-4 py-2 text-left">Téléphone</th>
            <th className="px-4 py-2 text-left">Statut</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index} className="border-b border-gray-300">
              <td className="px-4 py-2">{user.name}</td>
              <td className="px-4 py-2">{user.surname}</td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">{user.phone}</td>
              <td className="px-4 py-2">
                <span
                  className={`px-2 py-1 rounded-full text-sm ${user.statusColor}`}
                >
                  {user.status}
                </span>
              </td>
              <td className="px-4 py-2">
                <button className="text-blue-700 px-3 py-1 rounded-lg border border-blue-500 mr-2 hover:bg-blue-200">
                  Suspendre
                </button>
                <button className="bg-red-600 text-white px-3 py-1 rounded-lg border border-red-700 hover:bg-red-700">
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EntryRecordsTable;
