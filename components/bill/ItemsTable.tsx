import { ItemType } from "@/types/bill";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

const inputClass =
  "w-full h-8 rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1";

export default function ItemsTable({
  items,
  onItemChange,
  onAddItem,
  onRemoveItem,
}: ItemsTableProps) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-4">Items</h2>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
            <tr>
              <th className="border-b p-2 text-left font-semibold">Sr.</th>
              <th className="border-b p-2 text-left font-semibold">Description</th>
              <th className="border-b p-2 text-left font-semibold">HSN</th>
              <th className="border-b p-2 text-left font-semibold">MFG</th>
              <th className="border-b p-2 text-left font-semibold">QTY</th>
              <th className="border-b p-2 text-left font-semibold">UNIT</th>
              <th className="border-b p-2 text-left font-semibold">BATCH</th>
              <th className="border-b p-2 text-left font-semibold">EXP.</th>
              <th className="border-b p-2 text-left font-semibold">MRP</th>
              <th className="border-b p-2 text-left font-semibold">DISC</th>
              <th className="border-b p-2 text-left font-semibold">RATE</th>
              <th className="border-b p-2 text-left font-semibold">AMOUNT</th>
              <th className="border-b p-2 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className="border-b last:border-b-0">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">
                  <Input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      onItemChange(index, "description", e.target.value)
                    }
                    className={inputClass}
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="text"
                    value={item.hsn}
                    onChange={(e) => onItemChange(index, "hsn", e.target.value)}
                    className={inputClass}
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="text"
                    value={item.mfg}
                    onChange={(e) => onItemChange(index, "mfg", e.target.value)}
                    className={inputClass}
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    value={item.qty ?? ""}
                    onChange={(e) => onItemChange(index, "qty", e.target.value)}
                    className={inputClass}
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="text"
                    value={item.unit}
                    onChange={(e) =>
                      onItemChange(index, "unit", e.target.value)
                    }
                    className={inputClass}
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="text"
                    value={item.batch}
                    onChange={(e) =>
                      onItemChange(index, "batch", e.target.value)
                    }
                    className={inputClass}
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="text"
                    value={item.exp}
                    onChange={(e) => onItemChange(index, "exp", e.target.value)}
                    className={inputClass}
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    value={item.mrp ?? ""}
                    onChange={(e) => onItemChange(index, "mrp", e.target.value)}
                    className={inputClass}
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    value={item.disc ?? ""}
                    onChange={(e) =>
                      onItemChange(index, "disc", e.target.value)
                    }
                    className={inputClass}
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    value={item.rate ?? ""}
                    onChange={(e) =>
                      onItemChange(index, "rate", e.target.value)
                    }
                    className={inputClass}
                  />
                </td>
                <td className="p-2 py-2.5">
                  {item.amount?.toFixed(2) || ""}
                </td>
                <td className="p-2">
                  {items.length > 10 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onRemoveItem(index)}
                    >
                      Remove
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button onClick={onAddItem} className="mt-4">
        Add Item
      </Button>
    </div>
  );
}
