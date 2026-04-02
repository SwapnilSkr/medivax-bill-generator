import { useState, useEffect, useCallback, ChangeEvent } from "react";
import { BillInfoType, ItemType } from "@/types/bill";
import { computeLineAmount, createInitialItems } from "@/utils/bill";
import type { BillDocument, DraftDocument } from "@/types/bill";

const defaultBillInfo: BillInfoType = {
  billNo: "",
  billDate: "",
  billTime: "",
  gstNo: "19HGRPS5830J1ZF",
  nameType: "Doctor",
  doctorName: "",
  refDoctor: "",
  address: "",
  mobile: "",
  email: "shelly.sarkardec77@gmail.com",
  mode: "CREDIT",
  deliveredBy: "",
  salesPerson: "",
};

export const useBill = () => {
  const [billInfo, setBillInfo] = useState<BillInfoType>(defaultBillInfo);
  const [items, setItems] = useState<ItemType[]>(createInitialItems(10));
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait"
  );
  const [includeGst, setIncludeGst] = useState(true);
  const [editingBillId, setEditingBillId] = useState<string | null>(null);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);

  useEffect(() => {
    setBillInfo((prev) => ({
      ...prev,
      billDate: new Date().toISOString().split("T")[0],
      billTime: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    }));
  }, []);

  const handleBillInfoChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setBillInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (
    index: number,
    field: keyof ItemType,
    value: string | number
  ) => {
    const newItems = [...items];
    if (
      field === "qty" ||
      field === "mrp" ||
      field === "disc" ||
      field === "rate"
    ) {
      newItems[index][field] =
        typeof value === "string" ? parseFloat(value) || null : value;
    } else {
      newItems[index][field as keyof ItemType] = value as never;
    }
    if (
      field === "qty" ||
      field === "rate" ||
      field === "mrp" ||
      field === "disc" ||
      field === "unit"
    ) {
      newItems[index].amount = computeLineAmount(newItems[index]);
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: items.length + 1,
        description: "",
        hsn: "",
        mfg: "",
        qty: 0,
        unit: "",
        batch: "",
        exp: "",
        mrp: 0,
        disc: 0,
        rate: 0,
        amount: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 10) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  const loadFromDraft = useCallback((draft: DraftDocument) => {
    setBillInfo(draft.billInfo);
    setItems(draft.items);
    setOrientation(draft.orientation);
    setIncludeGst(draft.includeGst);
    setEditingDraftId(draft.id);
    setEditingBillId(null);
  }, []);

  const loadFromBill = useCallback((bill: BillDocument) => {
    setBillInfo(bill.billInfo);
    setItems(bill.items);
    setOrientation(bill.orientation);
    setIncludeGst(bill.includeGst);
    setEditingBillId(bill.id);
    setEditingDraftId(null);
  }, []);

  const reset = useCallback(() => {
    setBillInfo({
      ...defaultBillInfo,
      billDate: new Date().toISOString().split("T")[0],
      billTime: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    });
    setItems(createInitialItems(10));
    setOrientation("portrait");
    setIncludeGst(true);
    setEditingBillId(null);
    setEditingDraftId(null);
  }, []);

  return {
    billInfo,
    items,
    orientation,
    setOrientation,
    includeGst,
    setIncludeGst,
    editingBillId,
    editingDraftId,
    setEditingBillId,
    setEditingDraftId,
    handleBillInfoChange,
    handleItemChange,
    addItem,
    removeItem,
    loadFromDraft,
    loadFromBill,
    reset,
  };
};
