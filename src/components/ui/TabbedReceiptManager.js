import React, { useState, useEffect } from 'react';
import { Image, FileText, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Button';
import { Input } from '@/components/ui/Button';
import { Button } from '@/components/ui/Button';
import { Edit2, Save, Plus, Trash2 } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  // Your Firebase configuration
  databaseURL: "https://poolreceipts-25302-default-rtdb.europe-west1.firebasedatabase.app/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Account codes mapping
const accountCodes = {
  "Fournitures de carburant": "606140",
  "Fournitures de petit matériel/équipement": "606300",
  "Fournitures administratives/de bureau": "606400",
  "Sous-traitance montage": "611001",
  "Locations mobilières": "613500",
  "Location alarme sécurité": "613520",
  "Entretien matériel": "615520",
  "Entretien matériel transport": "615520",
  "Entretien matériel de bureau": "615530",
  "Maintenance": "615600",
  "Primes d'assurances": "616000",
  "Honoraires comptables": "622600",
  "Honoraires juridiques": "622610",
  "Frais d'actes et contentieux": "622700",
  "Annonces et insertion (publicité)": "623100",
  "Voyages et déplacements (autoroute, parking)": "625100",
  "Déplacements par les airs": "625110",
  "Frais postaux": "626000",
  "Internet": "626001",
  "Mobile": "626002",
  "Téléphone": "626100",
  "Cotisations": "628100"
};

const TabbedReceiptManager = () => {
  const [receipts, setReceipts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('2024-10');

  const tabs = [
    { id: '2024-10', label: 'October 2024' },
    { id: '2024-11', label: 'November 2024' },
    { id: '2024-12', label: 'December 2024' },
    { id: '2025-01', label: 'January 2025' },
    { id: '2025-02', label: 'Février 2025' }
  ];

  useEffect(() => {
    const receiptsRef = ref(database, 'receipts');
    onValue(receiptsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const receiptsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setReceipts(receiptsList);
      }
    });
  }, []);

  const filterReceiptsByMonth = (receipts, yearMonth) => {
    return receipts.filter(receipt => {
      if (!receipt.timestamp) return false;
      const receiptDate = new Date(Number(receipt.timestamp));
      const yearMonthStr = `${receiptDate.getFullYear()}-${String(receiptDate.getMonth() + 1).padStart(2, '0')}`;
      return yearMonthStr === yearMonth;
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(Number(timestamp));
    return date.toISOString().split('T')[0];
  };

  const getReadableAmount = (amount, currency) => {
    if (!amount) return '';
    return `${amount} ${currency || ''}`;
  };

  const exportCSV = () => {
    const filteredReceipts = filterReceiptsByMonth(receipts, activeTab);
    if (filteredReceipts.length === 0) {
      alert('No receipts to export for this month');
      return;
    }

    // Generate CSV data following the format in the provided code
    let csvContent = "ACH,date,compte1,compte2,ref,libelle,charges,fournisseur\n";
    
    filteredReceipts.forEach((receipt, index) => {
      const receiptDate = new Date(Number(receipt.timestamp));
      const day = String(receiptDate.getDate()).padStart(2, '0');
      const month = String(receiptDate.getMonth() + 1).padStart(2, '0');
      const year = receiptDate.getFullYear();
      
      // First row - payment information
      let row1 = ['ACH'];
      // date
      row1.push(`${day}/${month}/${year}`);
      
      // compte1 & compte2 based on payment method
      const paymentMethod = receipt.payment_method || '';
      if (paymentMethod.toLowerCase().includes('personnel')) {
        row1.push('455171', '');
      } else {
        row1.push('401000', '0DIVER');
      }
      
      // ref
      const ref = `${String(year).slice(2, 4)}${month}${String(index + 1).padStart(2, '0')} / ${receipt.amount || 0} ${receipt.currency || ''}`;
      row1.push(ref);
      
      // libelle
      row1.push(receipt.description || '');
      
      // charges
      row1.push('');
      
      // fournisseur
      row1.push(receipt.uploadedBy || '');
      
      csvContent += row1.join(',') + '\n';
      
      // Second row - category information
      let row2 = ['ACH'];
      row2.push(`${day}/${month}/${year}`);
      
      // Get account code from category
      const categoryCode = accountCodes[receipt.category] || '';
      row2.push(categoryCode, '');
      row2.push(ref);
      row2.push(receipt.description || '');
      row2.push(receipt.uploadedBy || '');
      row2.push('');
      
      csvContent += row2.join(',') + '\n';
    });
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const now = new Date();
    
    link.setAttribute('href', url);
    link.setAttribute('download', `CSV_${now.getDate()}_${now.getMonth()+1}_${now.getFullYear()}__${now.getHours()}_${now.getMinutes()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ImageModal = ({ image, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-4 rounded-lg max-w-2xl max-h-[90vh] overflow-auto">
        <img src={image || '/api/placeholder/400/320'} alt="Receipt" className="w-full h-auto" />
        <Button onClick={onClose} className="mt-4 w-full">Close</Button>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Receipt Management</span>
          <Button 
            onClick={exportCSV}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </CardTitle>
        <div className="flex space-x-2 mt-4 border-b">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Image</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Description</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Payment Method</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Card Digits</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Mission ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Location</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Uploaded By</th>
              </tr>
            </thead>
            <tbody>
              {filterReceiptsByMonth(receipts, activeTab).map(receipt => (
                <tr key={receipt.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setSelectedImage(receipt.image)}
                    >
                      <Image className="h-4 w-4" />
                    </Button>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">{formatDate(receipt.timestamp)}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{receipt.description}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{receipt.category}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{getReadableAmount(receipt.amount, receipt.currency)}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{receipt.payment_method}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{receipt.card_digits}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{receipt.mission_id}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{receipt.location}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{receipt.uploadedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </Card>
  );
};

export default TabbedReceiptManager;