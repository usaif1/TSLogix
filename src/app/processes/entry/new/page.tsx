export default function MyForm() {
  return (
    <form className="p-6 border rounded-lg shadow-md bg-gray-100">
      <div className="mb-4 flex">
        <label className="w-40 block text-sm font-medium mb-1">Origin</label>
        <select className="text-sm w-40 border rounded">
          <option value="">Select</option>
        </select>
      </div>

      <div className="mb-4 flex">
        <label className="w-40 block text-sm font-medium mb-1">Document</label>
        <select className="text-sm w-40 border rounded">
          <option value="">Select</option>
        </select>
      </div>

      <div className="mb-4 flex">
        <label className="w-40 block text-sm font-medium mb-1">
          Document Number
        </label>
        <input type="text" className="text-sm w-40 border rounded" />
      </div>

      <div className="mb-4 flex">
        <label className="w-40 block text-sm font-medium mb-1">
          Document Date
        </label>
        <input type="date" className="text-sm w-40 border rounded" />
      </div>

      <div className="mb-4 flex">
        <label className="w-40 block text-sm font-medium mb-1">
          Responsible Person
        </label>
        <select className="text-sm w-40 border rounded">
          <option value="">Select</option>
        </select>
      </div>

      <div className="mb-4 flex">
        <label className="w-40 block text-sm font-medium mb-1">
          Observation
        </label>
        <textarea className="text-sm w-[80%] border rounded"></textarea>
      </div>

      <div className="mb-4 flex gap-4">
        <div className="flex-1">
          <label className="w-40 block text-sm font-medium mb-1">
            Total Volume (M3)
          </label>
          <input type="text" className="text-sm w-40 border rounded" />
        </div>
        <div className="flex-1">
          <label className="w-40 block text-sm font-medium mb-1">
            Total Weight (Kg)
          </label>
          <input type="text" className="text-sm w-40 border rounded" />
        </div>
      </div>

      <div className="mb-4 flex">
        <label className="w-40 block text-sm font-medium mb-1">File</label>
        <input type="file" className="text-sm w-40 border rounded" />
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Register
        </button>
        <button
          type="button"
          className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
