import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import {
    Download,
    Plus,
    Archive,
    RotateCcw,
    CreditCard,
    Calendar,
    User,
    Hash,
    ArrowLeft,
    Loader2,
    Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Modal from '../components/Modal';

const API_BASE_URL = 'http://localhost:5000/api/invoices';

const InvoiceDetails = () => {
    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchInvoiceDetails();
    }, [id]);

    const fetchInvoiceDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/${id}`);
            setInvoice(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching invoice:', err);
            setError('Failed to load invoice details or Invoice not found.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPayment = async (e) => {
        e.preventDefault();
        if (!paymentAmount || isNaN(paymentAmount) || paymentAmount <= 0) return;

        try {
            setIsSubmitting(true);
            await axios.post(`${API_BASE_URL}/${id}/payments`, {
                amount: parseFloat(paymentAmount)
            });
            setPaymentAmount('');
            setIsModalOpen(false);
            fetchInvoiceDetails();
        } catch (err) {
            alert(err.response?.data?.message || 'Error processing payment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleArchive = async () => {
        try {
            await axios.post(`${API_BASE_URL}/${id}/${invoice.isArchived ? 'restore' : 'archive'}`);
            fetchInvoiceDetails();
        } catch (err) {
            alert('Error updating archive status');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this invoice?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/${id}`);
            window.location.href = '/';
        } catch (err) {
            alert('Error deleting invoice');
        }
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('invoice-content');
        const canvas = await html2canvas(element, {
            backgroundColor: '#09090b',
            scale: 2
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white p-4">
                <p className="text-xl mb-4 text-zinc-400">{error}</p>
                <button onClick={() => window.history.back()} className="btn-primary">
                    <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Navigation & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <button onClick={() => window.history.back()} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" /> Back to Invoices
                    </button>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleArchive}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${invoice.isArchived
                                ? 'border-orange-500/50 text-orange-500 bg-orange-500/5'
                                : 'border-white/10 text-zinc-400 hover:bg-white/5'
                                }`}
                        >
                            {invoice.isArchived ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                            {invoice.isArchived ? 'Restore' : 'Archive'}
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-zinc-400 hover:bg-white/5"
                        >
                            <Download className="w-4 h-4" /> PDF
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/5 transition-all"
                        >
                            <Trash2 className="w-4 h-4" /> Delete
                        </button>
                    </div>
                </div>

                <div id="invoice-content" className="space-y-8 p-4 bg-zinc-950 rounded-2xl">

                    {/* Header Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-8 premium-shadow relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8">
                            <span className={`badge ${invoice.status === 'PAID' ? 'badge-paid' : 'badge-draft'}`}>
                                {invoice.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-indigo-400">
                                    <Hash className="w-5 h-5" />
                                    <span className="font-mono text-sm tracking-wider uppercase">Invoice</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold gradient-text">{invoice.invoiceNumber}</h1>
                                <div className="flex items-center gap-3 text-zinc-400 mt-2">
                                    <User className="w-5 h-5" />
                                    <span className="text-lg">{invoice.customerName}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Issue Date</p>
                                    <div className="flex items-center gap-2 text-zinc-300">
                                        <Calendar className="w-4 h-4 text-zinc-500" />
                                        {invoice.issueDate ? format(new Date(invoice.issueDate), 'MMM dd, yyyy') : 'N/A'}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Due Date</p>
                                    <div className="flex items-center gap-2 text-zinc-300">
                                        <Calendar className="w-4 h-4 text-zinc-500" />
                                        {invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM dd, yyyy') : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content: Table */}
                        <div className="lg:col-span-2 space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="glass-card overflow-hidden"
                            >
                                <div className="p-6 border-b border-white/5 bg-white/2">
                                    <h3 className="font-semibold text-lg">List of Items</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-white/2 border-b border-white/5">
                                                <th className="px-6 py-4 text-xs uppercase tracking-wider text-zinc-500">Description</th>
                                                <th className="px-6 py-4 text-xs uppercase tracking-wider text-zinc-500 text-center">Qty</th>
                                                <th className="px-6 py-4 text-xs uppercase tracking-wider text-zinc-500 text-right">Unit Price</th>
                                                <th className="px-6 py-4 text-xs uppercase tracking-wider text-zinc-500 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {(invoice.lineItems || []).map((item, idx) => (
                                                <tr key={idx} className="hover:bg-white/2 transition-colors">
                                                    <td className="px-6 py-4 font-medium">{item.description}</td>
                                                    <td className="px-6 py-4 text-zinc-400 text-center">{item.quantity}</td>
                                                    <td className="px-6 py-4 text-zinc-400 text-right">${(item.unitPrice || 0).toLocaleString()}</td>
                                                    <td className="px-6 py-4 font-semibold text-right">${(item.lineTotal || 0).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>

                            {/* Payments History */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="glass-card overflow-hidden"
                            >
                                <div className="p-6 border-b border-white/5 bg-white/2 flex justify-between items-center">
                                    <h3 className="font-semibold text-lg">Payment History</h3>
                                    <span className="text-xs text-zinc-500 uppercase tracking-widest">{invoice.payments?.length || 0} Transactions</span>
                                </div>
                                <div className="p-6 space-y-4">
                                    {!invoice.payments || invoice.payments.length === 0 ? (
                                        <p className="text-zinc-500 text-center py-4 italic">No payments recorded yet.</p>
                                    ) : (
                                        (invoice.payments || []).map((payment, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                        <CreditCard className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">Payment Received</p>
                                                        <p className="text-xs text-zinc-500">
                                                            {payment.paymentDate ? format(new Date(payment.paymentDate), 'MMM dd, yyyy · HH:mm') : 'Date Unknown'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-emerald-500 font-bold">+ ${payment.amount.toLocaleString()}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* Sidebar: Totals & Summary */}
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="glass-card p-6 space-y-6 sticky top-8"
                            >
                                <h3 className="font-semibold text-xl mb-4">Summary</h3>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-zinc-400">
                                        <span>Subtotal</span>
                                        <span className="text-white">${(invoice.total - (invoice.taxAmount || 0)).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-zinc-400">
                                        <span>Tax ({invoice.taxRate || 0}%)</span>
                                        <span className="text-white">${(invoice.taxAmount || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="h-px bg-white/5 my-4" />
                                    <div className="flex justify-between items-end">
                                        <span className="text-lg font-medium">Grand Total</span>
                                        <span className="text-2xl font-bold bg-indigo-500/20 px-3 py-1 rounded-lg text-indigo-300">
                                            ${invoice.total.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5 space-y-4">
                                    <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                        <span className="text-sm text-emerald-500/80">Amount Paid</span>
                                        <span className="font-bold text-emerald-500">${invoice.amountPaid.toLocaleString()}</span>
                                    </div>

                                    <div className="flex justify-between items-center p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
                                        <span className="text-sm text-orange-500/80">Balance Due</span>
                                        <span className="font-bold text-orange-500">${invoice.balanceDue.toLocaleString()}</span>
                                    </div>
                                </div>

                                {invoice.balanceDue > 0 && (
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="w-full btn-primary justify-center mt-4 h-14"
                                    >
                                        <Plus className="w-5 h-5" /> Add Payment
                                    </button>
                                )}
                                {invoice.status === 'PAID' && (
                                    <div className="w-full py-4 text-center bg-emerald-500/10 text-emerald-500 rounded-xl font-bold uppercase tracking-widest border border-emerald-500/20">
                                        Fully Paid
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Payment Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Record Payment"
                >
                    <form onSubmit={handleAddPayment} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Payment Amount ($)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-lg">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    max={invoice.balanceDue}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    placeholder="0.00"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                />
                            </div>
                            <p className="text-xs text-zinc-500 mt-2 italic">Max payable: ${invoice.balanceDue.toLocaleString()}</p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-zinc-400 hover:bg-white/5 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Payment'}
                            </button>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
};

export default InvoiceDetails;
