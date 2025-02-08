// src/pages/index.js
import TabbedReceiptManager from '@/components/ui/TabbedReceiptManager';
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <TabbedReceiptManager />
    </div>
  );
}