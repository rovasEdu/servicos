
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X } from 'lucide-react';

interface QRCodeModalProps {
  value: string;
  onClose: () => void;
  title: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ value, onClose, title }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center relative max-w-sm w-full">
        <button onClick={onClose} className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="p-4 bg-white inline-block">
            <QRCodeSVG value={value} size={256} />
        </div>
        <p className="mt-4 text-sm text-gray-500">Aponte a câmera para o código.</p>
      </div>
    </div>
  );
};

export default QRCodeModal;
