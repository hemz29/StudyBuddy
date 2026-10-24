import { notFound } from "next/navigation";
import { getWorksheet } from "@/content";
import { WorksheetPaper } from "@/components/WorksheetPaper";
import { PrintButton } from "./PrintButton";
import { getParent, userStore } from "@/lib/server/context";
import { logActivity } from "@/lib/server/activity";

// Plain black-and-white page used for printing and for generating the PDF files.
export default async function PrintWorksheet({ params }: { params: Promise<{ id: string }> }) {
  const ws = getWorksheet((await params).id);
  if (!ws) notFound();
  const parent = await getParent();
  if (parent) await logActivity(await userStore(), parent.id, { kind: "worksheet_print", path: `/print/worksheet/${ws.id}`, detail: { worksheetId: ws.id } });
  return (
    <div className="min-h-screen bg-white py-6">
      <style>{`
        .worksheet { width: 190mm; font-size: 15px; }
        .ws-section { break-inside: avoid; }
        @page { size: A4; margin: 12mm 10mm; }
        @media print { body { background: #fff; } }
      `}</style>
      <div className="no-print mx-auto mb-4 flex max-w-[190mm] justify-end">
        <PrintButton />
      </div>
      <WorksheetPaper ws={ws} />
    </div>
  );
}
