// remix/app/components/AlertDialog.tsx
import React, { useEffect, useRef } from 'react';

interface AlertDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
}) => {
	const dialogRef = useRef<HTMLDivElement>(null);

	// モーダル外クリックで閉じる処理
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		} else {
			document.removeEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
			<div
				ref={dialogRef}
				className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
			>
				<h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
					{title}
				</h3>
				<p className="mb-6 text-gray-700 dark:text-gray-300">
					{message}
				</p>
				<div className="flex justify-end space-x-3">
					<button
						onClick={onClose}
						className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
					>
						{cancelText}
					</button>
					<button
						onClick={onConfirm}
						className="rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
					>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	);
};
