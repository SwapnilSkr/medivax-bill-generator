import { ItemType } from "@/types/bill";

interface ItemsTableProps {
  items: ItemType[];
  onItemChange: (
    index: number,
    field: keyof ItemType,
    value: string | number
  ) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
}

export default function ItemsTable({
  items,
  onItemChange,
  onAddItem,
  onRemoveItem,
}: ItemsTableProps) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-2">Items</h2>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse text-sm mt-8">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Sr.</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">HSN</th>
              <th className="border p-2">MFG</th>
              <th className="border p-2">QTY</th>
              <th className="border p-2">UNIT</th>
              <th className="border p-2">BATCH</th>
              <th className="border p-2">EXP.</th>
              <th className="border p-2">MRP</th>
              <th className="border p-2">DISC</th>
              <th className="border p-2">RATE</th>
              <th className="border p-2">AMOUNT</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id}>
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      onItemChange(index, "description", e.target.value)
                    }
                    className="w-full p-1 border"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={item.hsn}
                    onChange={(e) => onItemChange(index, "hsn", e.target.value)}
                    className="w-full p-1 border"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={item.mfg}
                    onChange={(e) => onItemChange(index, "mfg", e.target.value)}
                    className="w-full p-1 border"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={item.qty ?? ""}
                    onChange={(e) => onItemChange(index, "qty", e.target.value)}
                    className="w-full p-1 border"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => onItemChange(index, "unit", e.target.value)}
                    className="w-full p-1 border"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={item.batch}
                    onChange={(e) =>
                      onItemChange(index, "batch", e.target.value)
                    }
                    className="w-full p-1 border"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={item.exp}
                    onChange={(e) => onItemChange(index, "exp", e.target.value)}
                    className="w-full p-1 border"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={item.mrp ?? ""}
                    onChange={(e) => onItemChange(index, "mrp", e.target.value)}
                    className="w-full p-1 border"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={item.disc ?? ""}
                    onChange={(e) => onItemChange(index, "disc", e.target.value)}
                    className="w-full p-1 border"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={item.rate ?? ""}
                    onChange={(e) => onItemChange(index, "rate", e.target.value)}
                    className="w-full p-1 border"
                  />
                </td>
                <td className="border p-2">
                  {item.amount?.toFixed(2) || ""}
                </td>
                <td className="border p-2">
                  {items.length > 10 && (
                    <button
                      onClick={() => onRemoveItem(index)}
                      className="bg-[#ef4444] text-white px-2 py-1 rounded hover:bg-[#dc2626]"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={onAddItem}
        className="mt-2 bg-[#3b82f6] text-white px-4 py-2 rounded hover:bg-[#2563eb]"
      >
        Add Item
      </button>
    </div>
  );
}

