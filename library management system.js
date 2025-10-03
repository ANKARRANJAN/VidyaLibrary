import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, BookOpen, Users, ArrowLeftRight, DollarSign, LogOut, UserCircle } from 'lucide-react';

export default function LibraryManagementSystem() {
  const [currentLibrarian, setCurrentLibrarian] = useState(null);
  const [librarians] = useState([
    { id: 1, username: 'admin', password: 'admin123', name: 'Admin User' },
    { id: 2, username: 'librarian1', password: 'lib123', name: 'Sarah Johnson' },
    { id: 3, username: 'librarian2', password: 'lib123', name: 'Mike Chen' },
  ]);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [activeTab, setActiveTab] = useState('books');
  const [books, setBooks] = useState([
    { id: 1, title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', status: 'available', borrower: null, dueDate: null },
    { id: 2, title: '1984', author: 'George Orwell', isbn: '9780451524935', status: 'borrowed', borrower: 'John Doe', dueDate: '2025-10-08' },
  ]);
  const [members, setMembers] = useState([
    { id: 1, name: 'John Doe', email: 'john@email.com', phone: '555-0101', joinDate: '2024-01-15', balance: 15.50 },
    { id: 2, name: 'Jane Smith', email: 'jane@email.com', phone: '555-0102', joinDate: '2024-03-20', balance: 0 },
  ]);
  const [payments, setPayments] = useState([
    { id: 1, memberId: 1, memberName: 'John Doe', amount: 10, type: 'Late Fee', date: '2025-09-28', processedBy: 'Admin User' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const handleLogin = () => {
    const librarian = librarians.find(
      l => l.username === loginForm.username && l.password === loginForm.password
    );
    if (librarian) {
      setCurrentLibrarian(librarian);
      setLoginForm({ username: '', password: '' });
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setCurrentLibrarian(null);
    setActiveTab('books');
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setFormData(item || {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleSubmit = () => {
    if (modalType === 'book') {
      if (editingItem) {
        setBooks(books.map(b => b.id === editingItem.id ? { ...formData, id: editingItem.id } : b));
      } else {
        setBooks([...books, { ...formData, id: Date.now(), status: 'available', borrower: null, dueDate: null }]);
      }
    } else if (modalType === 'member') {
      if (editingItem) {
        setMembers(members.map(m => m.id === editingItem.id ? { ...formData, id: editingItem.id } : m));
      } else {
        setMembers([...members, { ...formData, id: Date.now(), joinDate: new Date().toISOString().split('T')[0], balance: 0 }]);
      }
    } else if (modalType === 'checkout') {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      setBooks(books.map(b => b.id === formData.bookId 
        ? { ...b, status: 'borrowed', borrower: formData.memberName, dueDate: dueDate.toISOString().split('T')[0] }
        : b
      ));
    } else if (modalType === 'payment') {
      const member = members.find(m => m.id === formData.memberId);
      const newBalance = member.balance - parseFloat(formData.amount);
      setMembers(members.map(m => m.id === formData.memberId ? { ...m, balance: newBalance } : m));
      setPayments([...payments, {
        id: Date.now(),
        memberId: formData.memberId,
        memberName: member.name,
        amount: parseFloat(formData.amount),
        type: formData.type,
        date: new Date().toISOString().split('T')[0],
        processedBy: currentLibrarian.name
      }]);
    }
    closeModal();
  };

  const handleReturn = (bookId) => {
    const book = books.find(b => b.id === bookId);
    const member = members.find(m => m.name === book.borrower);
    
    let lateFee = 0;
    if (isOverdue(book.dueDate)) {
      const daysLate = Math.ceil((new Date() - new Date(book.dueDate)) / (1000 * 60 * 60 * 24));
      lateFee = daysLate * 0.50;
      if (member) {
        setMembers(members.map(m => m.id === member.id ? { ...m, balance: m.balance + lateFee } : m));
      }
    }
    
    setBooks(books.map(b => b.id === bookId 
      ? { ...b, status: 'available', borrower: null, dueDate: null }
      : b
    ));
    
    if (lateFee > 0) {
      alert(`Book returned. Late fee of $${lateFee.toFixed(2)} added to ${book.borrower}'s account.`);
    }
  };

  const deleteBook = (id) => {
    if (confirm('Are you sure you want to delete this book?')) {
      setBooks(books.filter(b => b.id !== id));
    }
  };

  const deleteMember = (id) => {
    if (confirm('Are you sure you want to delete this member?')) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.isbn.includes(searchTerm)
  );

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPayments = payments.filter(p =>
    p.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isFormValid = () => {
    if (modalType === 'book') {
      return formData.title && formData.author && formData.isbn;
    } else if (modalType === 'member') {
      return formData.name && formData.email && formData.phone;
    } else if (modalType === 'checkout') {
      return formData.bookId && formData.memberName;
    } else if (modalType === 'payment') {
      return formData.memberId && formData.amount && formData.type;
    }
    return false;
  };

  if (!currentLibrarian) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center gap-3 mb-8">
            <BookOpen className="w-12 h-12 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">Library System</h1>
          </div>
          <h2 className="text-xl font-semibold mb-6 text-center text-gray-700">Librarian Login</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={handleLogin}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Login
            </button>
          </div>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 font-semibold mb-2">Demo Credentials:</p>
            <p className="text-xs text-gray-500">admin / admin123</p>
            <p className="text-xs text-gray-500">librarian1 / lib123</p>
            <p className="text-xs text-gray-500">librarian2 / lib123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <BookOpen className="w-10 h-10 text-indigo-600" />
              <h1 className="text-4xl font-bold text-gray-800">Library Management System</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <UserCircle className="w-5 h-5" />
                  <span className="font-medium">{currentLibrarian.name}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          <div className="flex gap-4 mb-6 flex-wrap">
            <button
              onClick={() => setActiveTab('books')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                activeTab === 'books' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Books ({books.length})
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                activeTab === 'members' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-5 h-5" />
              Members ({members.length})
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                activeTab === 'payments' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <DollarSign className="w-5 h-5" />
              Payments ({payments.length})
            </button>
            <button
              onClick={() => openModal('checkout')}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition"
            >
              <ArrowLeftRight className="w-5 h-5" />
              Check Out Book
            </button>
            <button
              onClick={() => openModal('payment')}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700 transition"
            >
              <DollarSign className="w-5 h-5" />
              Process Payment
            </button>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            {activeTab !== 'payments' && (
              <button
                onClick={() => openModal(activeTab === 'books' ? 'book' : 'member')}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus className="w-5 h-5" />
                Add {activeTab === 'books' ? 'Book' : 'Member'}
              </button>
            )}
          </div>

          {activeTab === 'books' && (
            <div className="space-y-3">
              {filteredBooks.map(book => (
                <div key={book.id} className={`p-5 rounded-lg border-2 transition ${
                  book.status === 'borrowed' && isOverdue(book.dueDate)
                    ? 'border-red-300 bg-red-50'
                    : book.status === 'borrowed'
                    ? 'border-yellow-300 bg-yellow-50'
                    : 'border-green-300 bg-green-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">{book.title}</h3>
                      <p className="text-gray-600 mt-1">by {book.author}</p>
                      <p className="text-sm text-gray-500 mt-1">ISBN: {book.isbn}</p>
                      {book.status === 'borrowed' && (
                        <div className="mt-2">
                          <span className="text-sm font-medium text-gray-700">Borrowed by: {book.borrower}</span>
                          <span className={`ml-4 text-sm ${isOverdue(book.dueDate) ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                            Due: {new Date(book.dueDate).toLocaleDateString()} {isOverdue(book.dueDate) && '(OVERDUE)'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        book.status === 'available' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                      }`}>
                        {book.status === 'available' ? 'Available' : 'Borrowed'}
                      </span>
                      {book.status === 'borrowed' && (
                        <button
                          onClick={() => handleReturn(book.id)}
                          className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                        >
                          Return
                        </button>
                      )}
                      <button onClick={() => openModal('book', book)} className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteBook(book.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-3">
              {filteredMembers.map(member => (
                <div key={member.id} className="p-5 rounded-lg border-2 border-blue-300 bg-blue-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
                      <p className="text-gray-600 mt-1">{member.email}</p>
                      <p className="text-sm text-gray-500 mt-1">Phone: {member.phone}</p>
                      <p className="text-sm text-gray-500">Member since: {new Date(member.joinDate).toLocaleDateString()}</p>
                      <p className={`text-sm font-semibold mt-2 ${member.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Balance: ${member.balance.toFixed(2)} {member.balance > 0 && '(Outstanding)'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openModal('member', member)} className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteMember(member.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-3">
              {filteredPayments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No payment records yet
                </div>
              ) : (
                filteredPayments.map(payment => (
                  <div key={payment.id} className="p-5 rounded-lg border-2 border-purple-300 bg-purple-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{payment.memberName}</h3>
                        <p className="text-gray-600 mt-1">Amount: ${payment.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-500 mt-1">Type: {payment.type}</p>
                        <p className="text-sm text-gray-500">Date: {new Date(payment.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500">Processed by: {payment.processedBy}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-200 text-green-800">
                        Completed
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {editingItem ? 'Edit' : modalType === 'checkout' ? 'Check Out' : modalType === 'payment' ? 'Process Payment' : 'Add'}{' '}
              {modalType === 'book' ? 'Book' : modalType === 'member' ? 'Member' : modalType === 'checkout' ? 'Book' : ''}
            </h2>
            <div className="space-y-4">
              {modalType === 'book' && (
                <>
                  <input
                    type="text"
                    placeholder="Book Title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Author"
                    value={formData.author || ''}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="ISBN"
                    value={formData.isbn || ''}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </>
              )}
              {modalType === 'member' && (
                <>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </>
              )}
              {modalType === 'checkout' && (
                <>
                  <select
                    value={formData.bookId || ''}
                    onChange={(e) => setFormData({ ...formData, bookId: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select a book</option>
                    {books.filter(b => b.status === 'available').map(b => (
                      <option key={b.id} value={b.id}>{b.title} - {b.author}</option>
                    ))}
                  </select>
                  <select
                    value={formData.memberName || ''}
                    onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select a member</option>
                    {members.map(m => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-600">Due date will be set to 14 days from today</p>
                </>
              )}
              {modalType === 'payment' && (
                <>
                  <select
                    value={formData.memberId || ''}
                    onChange={(e) => setFormData({ ...formData, memberId: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select a member</option>
                    {members.filter(m => m.balance > 0).map(m => (
                      <option key={m.id} value={m.id}>{m.name} - Balance: ${m.balance.toFixed(2)}</option>
                    ))}
                  </select>
                  <select
                    value={formData.type || ''}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select payment type</option>
                    <option value="Late Fee">Late Fee Payment</option>
                    <option value="Membership Fee">Membership Fee</option>
                    <option value="Lost Book">Lost Book Payment</option>
                    <option value="Damage Fee">Damage Fee</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-600">Payment will be processed by {currentLibrarian.name}</p>
                </>
              )}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid()}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {editingItem ? 'Update' : modalType === 'checkout' ? 'Check Out' : modalType === 'payment' ? 'Process Payment' : 'Add'}
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}