
// import React, { useState, useEffect } from 'react';
// import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Button';
// import { Input } from '@/components/ui/Button';
// import { Button } from '@/components/ui/Button';
// import { Edit2, Save, Plus, Trash2 } from 'lucide-react';
// import { getApp, getApps, initializeApp } from "firebase/app";
// import { getDatabase, ref, onValue } from 'firebase/database';



// import { Image, Download, FileLabel, LogIn, LogOut, Key, Mail } from 'lucide-react';

// import { 
//   getAuth, 
//   signInWithEmailAndPassword,
//   signOut,
//   onAuthStateChanged
// } from 'firebase/auth';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Button';
import { Input } from '@/components/ui/Button';
import { Button } from '@/components/ui/Button';
import { Edit2, Save, Plus, Trash2 } from 'lucide-react';
import { getApp, getApps, initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from 'firebase/database';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';



import { Image, Download, FileLabel, LogIn, LogOut, Key, Mail } from 'lucide-react';

import { 
  getAuth, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: 'https://poolreceipts-25302-default-rtdb.europe-west1.firebasedatabase.app'
};
// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const database = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

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

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onLogin will be called by the auth state change listener
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-center">Receipt Manager Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div htmlFor="email">Email</div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div htmlFor="password">Password</div>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
            <LogIn className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const TabbedReceiptManager = ({ onLogout }) => {
  const [receipts, setReceipts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);
  const [activeTab, setActiveTab] = useState('2024-10');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  const tabs = [
    { id: '2024-10', title: 'October 2024' },
    { id: '2024-11', title: 'November 2024' },
    { id: '2024-12', title: 'December 2024' },
    { id: '2025-01', title: 'January 2025' },
    { id: '2025-02', title: 'February 2025' }
  ];

  useEffect(() => {
    // Get current user
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    // Get receipts data
    const receiptsRef = ref(database, 'receipts');
    const unsubscribeReceipts = onValue(receiptsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const receiptsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setReceipts(receiptsList);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeReceipts();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onLogout();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

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

  const loadReceiptImage = async (receiptId) => {
    setIsLoadingImage(true);
    try {
      const imageRef = storageRef(storage, `/receipts/${receiptId}/image`);
      const url = await getDownloadURL(imageRef);
      setSelectedImage(url);
      setSelectedReceiptId(receiptId);
    } catch (error) {
      console.error("Error loading image:", error);
      alert("Failed to load receipt image");
    } finally {
      setIsLoadingImage(false);
    }
  };

  const ImageModal = ({ image, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-4 rounded-lg max-w-2xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        {isLoadingImage ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading image...</p>
          </div>
        ) : (
          <img src={image || '/api/placeholder/400/320'} alt="Receipt" className="w-full h-auto" />
        )}
        <Button onClick={onClose} className="mt-4 w-full">Close</Button>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-6xl mx-auto mt-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Receipt Management</CardTitle>
          <div className="flex items-center gap-4">
            {currentUser && (
              <div className="text-sm text-gray-600">
                Logged in as: {currentUser.email}
              </div>
            )}
            <Button 
              onClick={exportCSV}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button 
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
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
              {tab.title}
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
                      onClick={() => loadReceiptImage(receipt.id)}
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
          onClose={() => {
            setSelectedImage(null);
            setSelectedReceiptId(null);
          }}
        />
      )}
    </Card>
  );
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="container py-8">
      {isLoggedIn ? (
        <TabbedReceiptManager onLogout={() => setIsLoggedIn(false)} />
      ) : (
        <LoginForm onLogin={() => setIsLoggedIn(true)} />
      )}
    </div>
  );
};

export default App;