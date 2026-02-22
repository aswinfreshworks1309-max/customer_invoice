import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FileText, Plus, User, Calendar, ArrowRight, Loader2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';

const API_BASE_URL = 'http://localhost:5000/api/invoices';

const InvoiceList = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newInvoice, setNewInvoice] = useState({
        invoiceNumber: '',
        customerName: '',
        dueDate: '',
        taxRate: 0,
        lineItems: [{ description: '', quantity: 1, unitPrice: 0 }]
    });

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_BASE_URL);
            setInvoices(response.data);
        } catch (err) {
            console.error('Error fetching invoices:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: invoices.reduce((sum, inv) => sum + inv.total, 0),
        pending: invoices.filter(inv => inv.status !== 'PAID').length,
        paid: invoices.filter(inv => inv.status === 'PAID').length
    };

    const handleCreateInvoice = async (e) => {
        e.preventDefault();
        try {
            await axios.post(API_BASE_URL, newInvoice);
            setIsCreateModalOpen(false);
            setNewInvoice({
                invoiceNumber: '',
                customerName: '',
                dueDate: '',
                taxRate: 0,
                lineItems: [{ description: '', quantity: 1, unitPrice: 0 }]
            });
            fetchInvoices();
        } catch (err) {
            alert("Error: " + (err.response?.data?.message || err.message));
        }
    };

    const addLineItem = () => {
        setNewInvoice({
            ...newInvoice,
            lineItems: [...newInvoice.lineItems, { description: '', quantity: 1, unitPrice: 0 }]
        });
    };

    const updateLineItem = (index, field, value) => {
        const updatedItems = [...newInvoice.lineItems];
        updatedItems[index][field] = value;
        setNewInvoice({ ...newInvoice, lineItems: updatedItems });
    };

    const handleDelete = async (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this invoice?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/${id}`);
            fetchInvoices();
        } catch (err) {
            alert('Error deleting invoice');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold gradient-text">Invoices</h1>
                        <p className="text-zinc-500 mt-1">Manage your billing and payments</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn-primary"
                    >
                        <Plus className="w-4 h-4" /> Create Invoice
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-card p-6 border border-white/5">
                        <p className="text-zinc-500 text-sm uppercase tracking-wider mb-1 font-semibold">Total Volume</p>
                        <h2 className="text-3xl font-bold text-indigo-400">${stats.total.toLocaleString()}</h2>
                    </div>
                    <div className="glass-card p-6 border border-white/5">
                        <p className="text-zinc-500 text-sm uppercase tracking-wider mb-1 font-semibold">Pending</p>
                        <h2 className="text-3xl font-bold text-orange-400">{stats.pending} Invoices</h2>
                    </div>
                    <div className="glass-card p-6 border border-white/5">
                        <p className="text-zinc-500 text-sm uppercase tracking-wider mb-1 font-semibold">Fully Paid</p>
                        <h2 className="text-3xl font-bold text-emerald-400">{stats.paid} Invoices</h2>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by customer or invoice number..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {filteredInvoices.length === 0 ? (
                    <div className="glass-card p-12 text-center space-y-6">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-zinc-500">
                            <FileText className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold">{searchTerm ? 'No Matching Invoices' : 'No Invoices Found'}</h2>
                            <p className="text-zinc-500 max-w-xs mx-auto">
                                {searchTerm ? `Try searching for something else or clear the filter.` : 'It looks like your database is empty. Click below to generate a beautiful demo invoice.'}
                            </p>
                        </div>
                        {!searchTerm && (
                            <button
                                onClick={async () => {
                                    try {
                                        setLoading(true);
                                        await axios.post(API_BASE_URL, {
                                            invoiceNumber: `INV-DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
                                            customerName: "Aswin Rajasekar",
                                            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                                            taxRate: 12,
                                            lineItems: [
                                                { description: "Premium MERN Development", quantity: 1, unitPrice: 2500 },
                                                { description: "Advanced UI/UX Animation", quantity: 2, unitPrice: 400 }
                                            ]
                                        });
                                        window.location.reload();
                                    } catch (err) {
                                        alert("Error creating demo: " + (err.response?.data?.message || err.message));
                                        setLoading(false);
                                    }
                                }}
                                className="btn-primary mx-auto"
                            >
                                <Plus className="w-5 h-5" /> Generate Demo Invoice
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredInvoices.map((invoice) => (
                            <motion.div
                                key={invoice._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card p-6 hover:bg-white/5 transition-colors group relative"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-mono text-indigo-400">{invoice.invoiceNumber}</p>
                                        <h3 className="text-lg font-bold">{invoice.customerName}</h3>
                                    </div>
                                    <span className={`badge ${invoice.status === 'PAID' ? 'badge-paid' : 'badge-draft'}`}>
                                        {invoice.status}
                                    </span>
                                    <button
                                        onClick={(e) => handleDelete(invoice._id, e)}
                                        className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-zinc-400 mb-6">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(invoice.dueDate).toLocaleDateString()}
                                    </div>
                                    <div className="font-bold text-white">
                                        ${invoice.total.toLocaleString()}
                                    </div>
                                </div>
                                <Link
                                    to={`/invoices/${invoice._id}`}
                                    className="w-full py-2 bg-white/5 group-hover:bg-indigo-600 rounded-lg flex items-center justify-center gap-2 transition-all"
                                >
                                    View Details <ArrowRight className="w-4 h-4" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Invoice Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Invoice"
            >
                <form onSubmit={handleCreateInvoice} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm text-zinc-400">Invoice Number</label>
                            <input
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="e.g. INV-001"
                                value={newInvoice.invoiceNumber}
                                onChange={(e) => setNewInvoice({ ...newInvoice, invoiceNumber: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-zinc-400">Tax Rate (%)</label>
                            <input
                                type="number"
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-indigo-500"
                                value={newInvoice.taxRate}
                                onChange={(e) => setNewInvoice({ ...newInvoice, taxRate: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Customer Name</label>
                        <input
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="John Doe"
                            value={newInvoice.customerName}
                            onChange={(e) => setNewInvoice({ ...newInvoice, customerName: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Due Date</label>
                        <input
                            type="date"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-indigo-500 [color-scheme:dark]"
                            value={newInvoice.dueDate}
                            onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                        />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-zinc-300">Line Items</h4>
                            <button
                                type="button"
                                onClick={addLineItem}
                                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> Add Item
                            </button>
                        </div>

                        {newInvoice.lineItems.map((item, index) => (
                            <div key={index} className="space-y-3 p-4 bg-white/2 rounded-xl border border-white/5">
                                <input
                                    required
                                    className="w-full bg-zinc-900/50 border border-white/5 rounded-lg p-2 text-sm outline-none"
                                    placeholder="Service description"
                                    value={item.description}
                                    onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase text-zinc-500">Qty</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full bg-zinc-900/50 border border-white/5 rounded-lg p-2 text-sm"
                                            value={item.quantity}
                                            onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase text-zinc-500">Price ($)</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full bg-zinc-900/50 border border-white/5 rounded-lg p-2 text-sm"
                                            value={item.unitPrice}
                                            onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-zinc-400 hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 btn-primary justify-center"
                        >
                            Create Invoice
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default InvoiceList;
