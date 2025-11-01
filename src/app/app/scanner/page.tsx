'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CameraScanner from '@/components/ui/CameraScanner';

export default function ScannerPage() {
  const router = useRouter();

  const handleScanSuccess = (barcode: string) => {
    // Redirecionar para página de registro com código escaneado
    router.push(`/app/cirurgia/nova?barcode=${encodeURIComponent(barcode)}`);
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <CameraScanner
      onScanSuccess={handleScanSuccess}
      onClose={handleClose}
      allowManualInput={true}
    />
  );
}
