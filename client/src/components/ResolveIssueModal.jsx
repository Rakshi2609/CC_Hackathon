import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import { X } from 'lucide-react';

// Modal styles
const customStyles = {
    overlay: {
        backgroundColor: 'rgba(30, 41, 59, 0.45)',
        zIndex: 1000,
    },
    content: {
        maxWidth: 420,
        margin: 'auto',
        borderRadius: 16,
        padding: 0,
        border: 'none',
        background: 'rgba(255,255,255,0.98)',
        boxShadow: '0 8px 32px rgba(30,41,59,0.18)',
    },
};

export default function ResolveIssueModal({ isOpen, onClose, onSubmit, loading }) {
    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setPhoto(file);
            setPreview(URL.createObjectURL(file));
            setError('');
        } else {
            setError('Please select a valid image file.');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!photo) {
            setError('Please upload a resolution photo.');
            return;
        }
        onSubmit({ photo, notes });
    };

    const handleClose = () => {
        setPhoto(null);
        setPreview('');
        setNotes('');
        setError('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={handleClose}
            style={customStyles}
            ariaHideApp={false}
            contentLabel="Resolve Issue Modal"
        >
            <div className="p-6 relative">
                <button
                    className="absolute top-3 right-3 text-slate-400 hover:text-slate-700"
                    onClick={handleClose}
                    aria-label="Close"
                >
                    <X size={20} />
                </button>
                <h2 className="text-xl font-semibold mb-4 text-slate-800">Mark Issue as Resolved</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Upload Fixed Photo</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
                            />
                            {preview && (
                                <img src={preview} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-slate-200 shadow" />
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Resolution Notes</label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-slate-200 p-2 text-slate-700 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                            placeholder="Describe the fix, materials used, or any remarks..."
                        />
                    </div>
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Submitting...' : 'Submit & Mark as Resolved'}
                    </button>
                </form>
            </div>
        </Modal>
    );
}

ResolveIssueModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    loading: PropTypes.bool,
};
