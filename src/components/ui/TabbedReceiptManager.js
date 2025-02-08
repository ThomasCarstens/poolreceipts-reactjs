import React, { useState } from 'react';
// import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
// import { Input } from './ui/Input';
// import { Button } from './ui/Button';
// import { Edit2, Save, Plus, Trash2, Image } from 'lucide-react';

// import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Button';
import { Input } from '@/components/ui/Button';
import { Button } from '@/components/ui/Button';
import { Edit2, Save, Plus, Trash2, Image } from 'lucide-react';

const TabbedReceiptManager = () => {
  const categories = [
    'Fournitures de bureau',
    'Fournitures de carburant',
    'Entretien matériel'
  ];

  // Sample data for multiple months
  const initialReceipts = [
    {
      id: 1,
      date: '2024-10-05',
      description: 'Office Supplies',
      category: 'Fournitures de bureau',
      amount: 345.50,
      project: 'Operation Sahel Support',
      location: 'Mali',
      uploadedBy: 'Jean Dupont',
      image: '/api/placeholder/400/320'
    },
    {
      id: 2,
      date: '2024-10-15',
      description: 'Vehicle Maintenance',
      category: 'Entretien matériel',
      amount: 890.75,
      project: 'Desert Shield Initiative',
      location: 'Niger',
      uploadedBy: 'Marie Lambert',
      image: '/api/placeholder/400/320'
    },
    {
      id: 3,
      date: '2024-11-03',
      description: 'Fuel Purchase',
      category: 'Fournitures de carburant',
      amount: 567.20,
      project: 'Atlas Mountains Operation',
      location: 'Morocco',
      uploadedBy: 'Pierre Martin',
      image: '/api/placeholder/400/320'
    },
    {
      id: 4,
      date: '2024-11-22',
      description: 'Equipment Repair',
      category: 'Entretien matériel',
      amount: 1234.00,
      project: 'Coastal Protection Project',
      location: 'Senegal',
      uploadedBy: 'Sophie Dubois',
      image: '/api/placeholder/400/320'
    },
    {
      id: 5,
      date: '2024-12-07',
      description: 'Office Furniture',
      category: 'Fournitures de bureau',
      amount: 2100.50,
      project: 'Savanna Research Mission',
      location: 'Tanzania',
      uploadedBy: 'Jean Dupont',
      image: '/api/placeholder/400/320'
    },
    {
      id: 6,
      date: '2024-12-18',
      description: 'Vehicle Fuel',
      category: 'Fournitures de carburant',
      amount: 445.80,
      project: 'Operation Sahel Support',
      location: 'Mali',
      uploadedBy: 'Marie Lambert',
      image: '/api/placeholder/400/320'
    },
    {
      id: 7,
      date: '2024-12-28',
      description: 'Computer Equipment',
      category: 'Fournitures de bureau',
      amount: 1875.30,
      project: 'Desert Shield Initiative',
      location: 'Niger',
      uploadedBy: 'Pierre Martin',
      image: '/api/placeholder/400/320'
    },
    {
      id: 8,
      date: '2025-01-05',
      description: 'Generator Maintenance',
      category: 'Entretien matériel',
      amount: 678.90,
      project: 'Atlas Mountains Operation',
      location: 'Morocco',
      uploadedBy: 'Sophie Dubois',
      image: '/api/placeholder/400/320'
    },
    {
      id: 9,
      date: '2025-01-12',
      description: 'Field Equipment',
      category: 'Fournitures de bureau',
      amount: 923.45,
      project: 'Coastal Protection Project',
      location: 'Senegal',
      uploadedBy: 'Jean Dupont',
      image: '/api/placeholder/400/320'
    },
    {
      id: 10,
      date: '2025-01-25',
      description: 'Vehicle Fleet Fuel',
      category: 'Fournitures de carburant',
      amount: 1567.80,
      project: 'Savanna Research Mission',
      location: 'Tanzania',
      uploadedBy: 'Marie Lambert',
      image: '/api/placeholder/400/320'
    }
  ];

  const [receipts, setReceipts] = useState(initialReceipts);
  const [editingId, setEditingId] = useState(null);
  const [editedReceipt, setEditedReceipt] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('2024-10');

  const tabs = [
    { id: '2024-10', label: 'October 2024' },
    { id: '2024-11', label: 'November 2024' },
    { id: '2024-12', label: 'December 2024' },
    { id: '2025-01', label: 'January 2025' }
  ];

  const exchangeRates = {
    '2024-10-15': 0.93,
    '2024-10-31': 0.94,
    '2024-11-15': 0.92,
    '2024-11-30': 0.93,
    '2024-12-15': 0.91,
    '2024-12-31': 0.92,
    '2025-01-15': 0.90,
    '2025-01-31': 0.91,
  };

  const getExchangeRate = (date) => {
    const receiptDate = new Date(date);
    const day = receiptDate.getDate();
    const month = receiptDate.getMonth() + 1;
    const year = receiptDate.getFullYear();
    const rateDate = `${year}-${month.toString().padStart(2, '0')}-${day <= 15 ? '15' : day <= 28 ? '28' : '31'}`;
    return exchangeRates[rateDate] || 0.92;
  };

  const calculateEuros = (amount, date) => {
    const rate = getExchangeRate(date);
    return (amount * rate).toFixed(2);
  };

  const filterReceiptsByMonth = (receipts, yearMonth) => {
    return receipts.filter(receipt => receipt.date.startsWith(yearMonth));
  };

  const ImageModal = ({ image, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-4 rounded-lg max-w-2xl max-h-[90vh] overflow-auto">
        <img src={image} alt="Receipt" className="w-full h-auto" />
        <Button onClick={onClose} className="mt-4 w-full">Close</Button>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>Receipt Management</CardTitle>
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
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Amount ($)</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Amount (€)</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Project</th>
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
                  <td className="px-4 py-4 text-sm text-gray-900">{receipt.date}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{receipt.description}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{receipt.category}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">${receipt.amount.toFixed(2)}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">€{calculateEuros(receipt.amount, receipt.date)}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{receipt.project}</td>
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
