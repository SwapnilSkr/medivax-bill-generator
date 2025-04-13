"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import domToImage from "dom-to-image";
import { jsPDF } from "jspdf";

interface BillInfoType {
  billNo: string;
  billDate: string;
  billTime: string;
  gstNo: string;
  nameType: "Doctor" | "Patient";
  doctorName: string;
  refDoctor: string;
  address: string;
  mobile: string;
  mode: "CREDIT" | "CASH/ONLINE";
  deliveredBy: string;
  salesPerson: string;
}

interface ItemType {
  id: number;
  description: string;
  hsn: string;
  mfg: string;
  qty: number | null;
  unit: string;
  batch: string;
  exp: string;
  mrp: number | null;
  disc: number | null;
  rate: number | null;
  amount: number | null;
}

export default function BillGenerator() {
  const [billInfo, setBillInfo] = useState<BillInfoType>({
    billNo: "",
    billDate: "",
    billTime: "",
    gstNo: "19AAFFH8112F1ZI",
    nameType: "Doctor",
    doctorName: "",
    refDoctor: "",
    address: "",
    mobile: "",
    mode: "CREDIT",
    deliveredBy: "",
    salesPerson: "",
  });

  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait"
  ); // New state for orientation

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

  const [items, setItems] = useState<ItemType[]>([
    {
      id: 1,
      description: "",
      hsn: "",
      mfg: "",
      qty: null as unknown as number,
      unit: "",
      batch: "",
      exp: "",
      mrp: null as unknown as number,
      disc: null as unknown as number,
      rate: null as unknown as number,
      amount: null as unknown as number,
    },
    {
      id: 2,
      description: "",
      hsn: "",
      mfg: "",
      qty: null as unknown as number,
      unit: "",
      batch: "",
      exp: "",
      mrp: null as unknown as number,
      disc: null as unknown as number,
      rate: null as unknown as number,
      amount: null as unknown as number,
    },
    {
      id: 3,
      description: "",
      hsn: "",
      mfg: "",
      qty: null as unknown as number,
      unit: "",
      batch: "",
      exp: "",
      mrp: null as unknown as number,
      disc: null as unknown as number,
      rate: null as unknown as number,
      amount: null as unknown as number,
    },
    {
      id: 4,
      description: "",
      hsn: "",
      mfg: "",
      qty: null as unknown as number,
      unit: "",
      batch: "",
      exp: "",
      mrp: null as unknown as number,
      disc: null as unknown as number,
      rate: null as unknown as number,
      amount: null as unknown as number,
    },
    {
      id: 5,
      description: "",
      hsn: "",
      mfg: "",
      qty: null as unknown as number,
      unit: "",
      batch: "",
      exp: "",
      mrp: null as unknown as number,
      disc: null as unknown as number,
      rate: null as unknown as number,
      amount: null as unknown as number,
    },
    {
      id: 6,
      description: "",
      hsn: "",
      mfg: "",
      qty: null as unknown as number,
      unit: "",
      batch: "",
      exp: "",
      mrp: null as unknown as number,
      disc: null as unknown as number,
      rate: null as unknown as number,
      amount: null as unknown as number,
    },
    {
      id: 7,
      description: "",
      hsn: "",
      mfg: "",
      qty: null as unknown as number,
      unit: "",
      batch: "",
      exp: "",
      mrp: null as unknown as number,
      disc: null as unknown as number,
      rate: null as unknown as number,
      amount: null as unknown as number,
    },
    {
      id: 8,
      description: "",
      hsn: "",
      mfg: "",
      qty: null as unknown as number,
      unit: "",
      batch: "",
      exp: "",
      mrp: null as unknown as number,
      disc: null as unknown as number,
      rate: null as unknown as number,
      amount: null as unknown as number,
    },
    {
      id: 9,
      description: "",
      hsn: "",
      mfg: "",
      qty: null as unknown as number,
      unit: "",
      batch: "",
      exp: "",
      mrp: null as unknown as number,
      disc: null as unknown as number,
      rate: null as unknown as number,
      amount: null as unknown as number,
    },
    {
      id: 10,
      description: "",
      hsn: "",
      mfg: "",
      qty: null as unknown as number,
      unit: "",
      batch: "",
      exp: "",
      mrp: null as unknown as number,
      disc: null as unknown as number,
      rate: null as unknown as number,
      amount: null as unknown as number,
    },
  ]);

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

  const calculateTotal = (): number => {
    return items.reduce((total, item) => {
      return total + (item.amount !== null ? item.amount : 0);
    }, 0);
  };

  const calculateTotalItems = (): number => {
    return items.reduce((total, item) => {
      return total + (item.qty !== null ? item.qty : 0);
    }, 0);
  };

  const getActiveItemCount = (): number => {
    return items.filter(item => item.qty !== null || item.description !== "").length;
  };

  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  const handlePrintClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handlePrint();
  };

  const handleExportPDF = async (): Promise<void> => {
    const input = componentRef.current;
    if (!input) return;

    try {
      const dataUrl = await domToImage.toPng(input, {
        quality: 0.95,
        bgcolor: "#ffffff",
        width: input.scrollWidth,
        height: input.scrollHeight,
        style: {
          position: "static",
          left: "0",
          top: "0",
        },
      });

      const pdf = new jsPDF({
        orientation: orientation, // Use the selected orientation
        unit: "mm",
        format: "a4",
      });

      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Medivax-Bill-${orientation}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const numberToWords = (num: number): string => {
    const units = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    if (num === 0) return "Zero";

    const sayNumberInWords = (num: number): string => {
      if (num < 20) return units[num];
      if (num < 100)
        return (
          tens[Math.floor(num / 10)] + (num % 10 ? " " + units[num % 10] : "")
        );
      if (num < 1000)
        return (
          units[Math.floor(num / 100)] +
          " Hundred" +
          (num % 100 ? " " + sayNumberInWords(num % 100) : "")
        );
      if (num < 100000)
        return (
          sayNumberInWords(Math.floor(num / 1000)) +
          " Thousand" +
          (num % 1000 ? " " + sayNumberInWords(num % 1000) : "")
        );
      if (num < 10000000)
        return (
          sayNumberInWords(Math.floor(num / 100000)) +
          " Lakh" +
          (num % 100000 ? " " + sayNumberInWords(num % 100000) : "")
        );
      return (
        sayNumberInWords(Math.floor(num / 10000000)) +
        " Crore" +
        (num % 10000000 ? " " + sayNumberInWords(num % 10000000) : "")
      );
    };

    const totalAmount = Math.round(num);
    const rupees = Math.floor(totalAmount);
    const paise = Math.round((totalAmount - rupees) * 100);

    let result = sayNumberInWords(rupees) + " Rupees";
    if (paise > 0) {
      result += " and " + sayNumberInWords(paise) + " Paise";
    }

    return result + " Only";
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Medivax Pharma Bill Generator</h1>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Bill No:</label>
          <input
            type="text"
            name="billNo"
            value={billInfo.billNo}
            onChange={handleBillInfoChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Bill Date:</label>
          <input
            type="date"
            name="billDate"
            value={billInfo.billDate}
            onChange={handleBillInfoChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Bill Time:</label>
          <input
            type="time"
            name="billTime"
            value={billInfo.billTime}
            onChange={handleBillInfoChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">GST No:</label>
          <input
            type="text"
            name="gstNo"
            value={billInfo.gstNo}
            onChange={handleBillInfoChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Name Type:</label>
          <select
            name="nameType"
            value={billInfo.nameType}
            onChange={handleBillInfoChange}
            className="w-full p-2 border rounded"
          >
            <option value="Doctor">Doctor Name</option>
            <option value="Patient">Patient Name</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">{billInfo.nameType} Name:</label>
          <input
            type="text"
            name="doctorName"
            value={billInfo.doctorName}
            onChange={handleBillInfoChange}
            className="w-full p-2 border rounded"
          />
        </div>
        {billInfo.nameType === "Patient" && (
          <div>
            <label className="block mb-1">Ref Doctor:</label>
            <input
              type="text"
              name="refDoctor"
              value={billInfo.refDoctor}
              onChange={handleBillInfoChange}
              className="w-full p-2 border rounded"
            />
          </div>
        )}
        <div>
          <label className="block mb-1">Address:</label>
          <input
            type="text"
            name="address"
            value={billInfo.address}
            onChange={handleBillInfoChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Mobile:</label>
          <input
            type="text"
            name="mobile"
            value={billInfo.mobile}
            onChange={handleBillInfoChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Mode:</label>
          <select
            name="mode"
            value={billInfo.mode}
            onChange={handleBillInfoChange}
            className="w-full p-2 border rounded"
          >
            <option value="CREDIT">CREDIT</option>
            <option value="CASH/ONLINE">CASH/ONLINE</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Delivered By:</label>
          <input
            type="text"
            name="deliveredBy"
            value={billInfo.deliveredBy}
            onChange={handleBillInfoChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Sales Person:</label>
          <input
            type="text"
            name="salesPerson"
            value={billInfo.salesPerson}
            onChange={handleBillInfoChange}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
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
                        handleItemChange(index, "description", e.target.value)
                      }
                      className="w-full p-1 border"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      value={item.hsn}
                      onChange={(e) =>
                        handleItemChange(index, "hsn", e.target.value)
                      }
                      className="w-full p-1 border"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      value={item.mfg}
                      onChange={(e) =>
                        handleItemChange(index, "mfg", e.target.value)
                      }
                      className="w-full p-1 border"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      value={item.qty ?? ''}
                      onChange={(e) =>
                        handleItemChange(index, "qty", e.target.value)
                      }
                      className="w-full p-1 border"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) =>
                        handleItemChange(index, "unit", e.target.value)
                      }
                      className="w-full p-1 border"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      value={item.batch}
                      onChange={(e) =>
                        handleItemChange(index, "batch", e.target.value)
                      }
                      className="w-full p-1 border"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      value={item.exp}
                      onChange={(e) =>
                        handleItemChange(index, "exp", e.target.value)
                      }
                      className="w-full p-1 border"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      value={item.mrp ?? ''}
                      onChange={(e) =>
                        handleItemChange(index, "mrp", e.target.value)
                      }
                      className="w-full p-1 border"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      value={item.disc ?? ''}
                      onChange={(e) =>
                        handleItemChange(index, "disc", e.target.value)
                      }
                      className="w-full p-1 border"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      value={item.rate ?? ''}
                      onChange={(e) =>
                        handleItemChange(index, "rate", e.target.value)
                      }
                      className="w-full p-1 border"
                    />
                  </td>
                  <td className="border p-2">{item.amount?.toFixed(2) || ""}</td>
                  <td className="border p-2">
                    {items.length > 10 && (
                      <button
                        onClick={() => removeItem(index)}
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
          onClick={addItem}
          className="mt-2 bg-[#3b82f6] text-white px-4 py-2 rounded hover:bg-[#2563eb]"
        >
          Add Item
        </button>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div>
          <p>
            <strong>Total Items:</strong> {getActiveItemCount()}
          </p>
          <p>
            <strong>Total Quantity:</strong> {calculateTotalItems()}
          </p>
          <p>
            <strong>Total Amount:</strong> ₹{calculateTotal().toFixed(2)}
          </p>
          <p>
            <strong>In Words:</strong> {numberToWords(calculateTotal())}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div>
            <label className="block mb-1">PDF Orientation:</label>
            <select
              value={orientation}
              onChange={(e) =>
                setOrientation(e.target.value as "portrait" | "landscape")
              }
              className="p-2 border rounded"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
          <button
            onClick={handlePrintClick}
            className="bg-[#22c55e] text-white px-4 py-2 rounded hover:bg-[#16a34a]"
          >
            Print Bill
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-[#a855f7] text-white px-4 py-2 rounded hover:bg-[#9333ea]"
          >
            Export as PDF
          </button>
        </div>
      </div>

      <div className="mt-2">
        <h2 className="text-xl font-bold mb-4">Bill Preview</h2>
        <div className="border px-[70px] py-2" ref={componentRef}>
          <div className="mb-2">
            <div className="flex flex-col justify-center">
              <h1 className="text-[24px] font-bold text-center">
                Medivax Pharma
              </h1>
              <p className="text-center text-[13px]">
                14 DR. RAJKUMAR KUNDU LANE, SHIBTALA, HOWRAH - 711102
              </p>
            </div>
            <div className="flex justify-between mt-1 text-sm">
              <div className="text-left">
                <p>
                  <strong>GST NO:</strong> {billInfo.gstNo}
                </p>
                <p>
                  <strong>MOBILE:</strong> 8777219601 / 7980076433
                </p>
                <p>
                  <strong>DL NO:</strong> 2246-SBW, 2298-SW
                </p>
              </div>
              <div className="text-right">
                <p>
                  <strong>Bill No.:</strong> {billInfo.billNo}
                </p>
                <p>
                  <strong>Bill Date:</strong>{" "}
                  {new Date(billInfo.billDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Bill Time:</strong> {billInfo.billTime}
                </p>
                <p>
                  <strong>Order Date:</strong>{" "}
                  {new Date(billInfo.billDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-left mt-1 text-sm">
              <p>
                <strong>{billInfo.nameType} Name:</strong> {billInfo.doctorName}
              </p>
              {billInfo.nameType === "Patient" && billInfo.refDoctor && (
                <p>
                  <strong>Ref Doctor:</strong> {billInfo.refDoctor}
                </p>
              )}
              <p>
                <strong>Address:</strong> {billInfo.address}
              </p>
              <p>
                <strong>Mobile:</strong> {billInfo.mobile}
              </p>
              <p>
                <strong>MODE:</strong> {billInfo.mode}
              </p>
              <p>
                <strong>Delivered By:</strong> {billInfo.deliveredBy}
              </p>
              <p>
                <strong>Sales Person:</strong> {billInfo.salesPerson}
              </p>
            </div>
          </div>

          <table className="w-full table-fixed border-collapse text-sm">
            <thead>
              <tr className="bg-gray-400">
                <th className="border border-black p-1 text-xs w-[4%] align-top">Sr.</th>
                <th className="border border-black p-1 text-xs w-[15%] align-top">DESCRIPTION</th>
                <th className="border border-black p-1 text-xs w-[10%] align-top">HSN</th>
                <th className="border border-black p-1 text-xs w-[8%] align-top">MFG</th>
                <th className="border border-black p-1 text-xs w-[7%] align-top">QTY</th>
                <th className="border border-black p-1 text-xs w-[7%] align-top">UNIT</th>
                <th className="border border-black p-1 text-xs w-[10%] align-top">BATCH</th>
                <th className="border border-black p-1 text-xs w-[8%] align-top">EXP.</th>
                <th className="border border-black p-1 text-xs w-[7%] align-top">MRP</th>
                <th className="border border-black p-1 text-xs w-[6%] align-top">DISC</th>
                <th className="border border-black p-1 text-xs w-[6%] align-top">RATE</th>
                <th className="border border-black p-1 text-xs w-[11%] align-top">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="text-xs">
                  <td className="border border-black p-1 text-center align-top">{index + 1}</td>
                  <td className="border border-black p-1 align-top">
                    <textarea
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, "description", e.target.value)
                      }
                      className="w-full bg-transparent focus:outline-none resize-none overflow-hidden whitespace-pre-wrap"
                      rows={1}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = target.scrollHeight + 'px';
                      }}
                    />
                  </td>
                  <td className="border border-black p-1 align-top">
                    <textarea
                      value={item.hsn}
                      onChange={(e) =>
                        handleItemChange(index, "hsn", e.target.value)
                      }
                      className="w-full bg-transparent focus:outline-none resize-none overflow-hidden whitespace-pre-wrap"
                      rows={1}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = target.scrollHeight + 'px';
                      }}
                    />
                  </td>
                  <td className="border border-black p-1 align-top">
                    <textarea
                      value={item.mfg}
                      onChange={(e) =>
                        handleItemChange(index, "mfg", e.target.value)
                      }
                      className="w-full bg-transparent focus:outline-none resize-none overflow-hidden whitespace-pre-wrap"
                      rows={1}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = target.scrollHeight + 'px';
                      }}
                    />
                  </td>
                  <td className="border border-black p-1 align-top">
                    <input
                      type="number"
                      value={item.qty ?? ''}
                      onChange={(e) =>
                        handleItemChange(index, "qty", e.target.value)
                      }
                      className="w-full bg-transparent focus:outline-none"
                    />
                  </td>
                  <td className="border border-black p-1 align-top">
                    <textarea
                      value={item.unit}
                      onChange={(e) =>
                        handleItemChange(index, "unit", e.target.value)
                      }
                      className="w-full bg-transparent focus:outline-none resize-none overflow-hidden whitespace-pre-wrap"
                      rows={1}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = target.scrollHeight + 'px';
                      }}
                    />
                  </td>
                  <td className="border border-black p-1 align-top">
                    <textarea
                      value={item.batch}
                      onChange={(e) =>
                        handleItemChange(index, "batch", e.target.value)
                      }
                      className="w-full bg-transparent focus:outline-none resize-none overflow-hidden whitespace-pre-wrap"
                      rows={1}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = target.scrollHeight + 'px';
                      }}
                    />
                  </td>
                  <td className="border border-black p-1 align-top">
                    <textarea
                      value={item.exp}
                      onChange={(e) =>
                        handleItemChange(index, "exp", e.target.value)
                      }
                      className="w-full bg-transparent focus:outline-none resize-none overflow-hidden whitespace-pre-wrap"
                      rows={1}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = target.scrollHeight + 'px';
                      }}
                    />
                  </td>
                  <td className="border border-black p-1 align-top">
                    <input
                      type="number"
                      value={item.mrp ?? ''}
                      onChange={(e) =>
                        handleItemChange(index, "mrp", e.target.value)
                      }
                      className="w-full bg-transparent focus:outline-none"
                    />
                  </td>
                  <td className="border border-black p-1 align-top">
                    <input
                      type="number"
                      value={item.disc ?? ''}
                      onChange={(e) =>
                        handleItemChange(index, "disc", e.target.value)
                      }
                      className="w-full bg-transparent focus:outline-none"
                    />
                  </td>
                  <td className="border border-black p-1 align-top">
                    <input
                      type="number"
                      value={item.rate ?? ''}
                      onChange={(e) =>
                        handleItemChange(index, "rate", e.target.value)
                      }
                      className="w-full bg-transparent focus:outline-none"
                    />
                  </td>
                  <td className="border border-black p-1 text-right align-top">{item.amount?.toFixed(2) || ""}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="text-xs">
              <tr>
                <td colSpan={11} className="border border-black p-1 text-right">
                  <strong>ITEMS: {getActiveItemCount()}</strong>
                </td>
                <td className="border border-black p-1">
                  <strong>QTY: {calculateTotalItems()}</strong>
                </td>
              </tr>
              <tr>
                <td colSpan={11} className="border border-black p-1 text-right">
                  <strong>Total Pay(Rs.):</strong>
                </td>
                <td className="border border-black p-1 text-right whitespace-normal break-words">
                  <strong>{calculateTotal().toFixed(2)}</strong>
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="text-xs mt-2">
            <p>
              <strong>{numberToWords(calculateTotal())}</strong>
            </p>
            <div className="mt-2 space-y-0.5">
              <p>Please Consult with your Dr. Before Using The Medicines.</p>
              <p>
                Cold Chain Items Once Sold Can&apos;t Be Taken Back due to
                technical reasons.
              </p>
              <p>All Disputes are Subject to KOLKATA Jurisdiction Only.</p>
            </div>
            <div className="text-right mt-2">
              <p>For Medivax Pharma</p>
              <p>E.& O.E.</p>
            </div>
            <p className="mt-2">
              KOTAK MAHINDRA BANK, A/c No.-9314146480, IFS CODE: KKBK0000322,
              Park Street, Kolkata-700016
            </p>
            <span className="text-left text-[12px]">
              Done in partnership with HRISHIKESH ENTERPRISE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
