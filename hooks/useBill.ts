import { useState, useEffect, ChangeEvent } from "react";
import { BillInfoType, ItemType } from "@/types/bill";
import { createInitialItems } from "@/utils/bill";

export const useBill = () => {
  const [billInfo, setBillInfo] = useState<BillInfoType>({
    billNo: "",
    billDate: "",
    billTime: "",
    // gstNo: "19HGRPS5830J1ZF",
    nameType: "Doctor",
    doctorName: "",
    refDoctor: "",
    address: "",
    mobile: "",
    email: "shelly.sarkardec77@gmail.com",
    mode: "CREDIT",
    deliveredBy: "",
    salesPerson: "",
  });

  const [items, setItems] = useState<ItemType[]>(createInitialItems(10));
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait"
  );

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
    if (field === "rate" || field === "qty") {
      const rate = newItems[index].rate || 0;
      const qty = newItems[index].qty || 0;
      newItems[index].amount = rate && qty ? rate * qty : null;
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

  return {
    billInfo,
    items,
    orientation,
    setOrientation,
    handleBillInfoChange,
    handleItemChange,
    addItem,
    removeItem,
  };
};
