import { ItemType } from "@/types/bill";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ItemsTableProps {
  items: ItemType[];
  includeGst?: boolean;
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
  includeGst = true,
  onItemChange,
  onAddItem,
  onRemoveItem,
}: ItemsTableProps) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-2">Items</h2>
      <p className="mb-3 max-w-4xl text-sm leading-relaxed text-muted-foreground">
        Each line&apos;s <strong className="text-foreground">Amount</strong> is the{" "}
        <strong className="text-foreground">taxable value</strong> (GST is added later in the
        bill footer). Price after discount is{" "}
        <span className="font-mono text-xs">MRP or Rate</span> ×{" "}
        <span className="font-mono text-xs">(1 − Disc%/100)</span>, then × quantity (and ×{" "}
        <span className="font-mono text-xs">UNIT</span> when UNIT is a number, e.g. strips per
        pack). <strong className="text-foreground">Rate</strong> means your agreed{" "}
        <em>per-unit</em> price before GST;{" "}
        <strong className="text-foreground">if Rate is filled (any number &gt; 0), it replaces MRP</strong>{" "}
        for that row—leave Rate empty to bill from MRP + Disc %.
      </p>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
            <tr>
              <th className="border-b p-2 text-left font-semibold">Sr.</th>
              <th className="border-b p-2 text-left font-semibold">Description</th>
              <th className="border-b p-2 text-left font-semibold">HSN</th>
              {includeGst && (
                <th className="border-b p-2 text-left font-semibold">GST %</th>
              )}
              <th className="border-b p-2 text-left font-semibold">MFG</th>
              <th className="border-b p-2 text-left font-semibold">QTY</th>
              <th className="border-b p-2 text-left font-semibold">UNIT</th>
              <th className="border-b p-2 text-left font-semibold">BATCH</th>
              <th className="border-b p-2 text-left font-semibold">EXP.</th>
              <th className="border-b p-2 text-left font-semibold">MRP</th>
              <th className="border-b p-2 text-left font-semibold">Disc %</th>
              <th
                className="border-b p-2 text-left font-semibold"
                title="Per-unit price before GST. If set (&gt; 0), overrides MRP for this row."
              >
                Rate / unit
              </th>
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
                {includeGst && (
                  <td className="p-2 text-sm text-muted-foreground tabular-nums">
                    {(item.amount ?? 0) > 0 ||
                    (item.description && item.description.trim())
                      ? "5%"
                      : "—"}
                  </td>
                )}
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
                    placeholder="Blank → MRP"
                    className={inputClass}
                    title="Leave blank to use MRP × (1 − Disc %). Any value &gt; 0 overrides MRP."
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
