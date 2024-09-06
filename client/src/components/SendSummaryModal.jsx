import React from 'react';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/solid';

const SendSummaryModal = ({ isOpen, onClose, sendResults = [] }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-[#141414] rounded-lg p-6 shadow-lg w-full max-w-md md:max-w-lg lg:max-w-2xl">
                <h2 className="text-xl font-semibold text-[#F2F2DC] mb-4">Proceso Terminado</h2>
                <p className="text-[#F2F2DC] mb-4">Detalles</p>

                <div className="overflow-x-auto">
                    <table className="w-full table-auto text-left">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-[#F2F2DC]">Número</th>
                                <th className="px-4 py-2 text-[#F2F2DC]">Estado</th>
                                <th className="px-4 py-2 text-[#F2F2DC]">Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(Array.isArray(sendResults) ? sendResults : []).map((result, index) => (
                                <tr key={index} className="text-[#F2F2DC]">
                                    <td 
                                        className="border px-4 py-2" 
                                        style={{ minWidth: 'max-content', maxWidth: 'max-content', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                    >
                                        {result.phone}
                                    </td>
                                    <td 
                                        className={`border px-4 py-2 flex items-center ${result.state === 'success' ? 'bg-green-500' : 'bg-yellow-500'} text-white h-full`}
                                    >
                                        {result.state === 'success' ? (
                                            <CheckCircleIcon className="w-5 h-5 mr-2" />
                                        ) : (
                                            <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                                        )}
                                        <span className="text-sm">{result.state === 'success' ? 'Éxito' : 'Error'}</span>
                                    </td>
                                    <td className="border px-4 py-2 break-words">{result.description || 'Sin descripción'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end mt-4">
                    <button
                        onClick={onClose}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200 ease-in-out"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SendSummaryModal;