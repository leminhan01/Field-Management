'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { ImportResult } from '@fieldapp/shared';

interface EmployeeImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<ImportResult>;
  onSuccess: () => void;
}

export function EmployeeImportDialog({ open, onClose, onImport, onSuccess }: EmployeeImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await onImport(file);
      setResult(res);
      if (res.imported > 0) {
        toast.success(`Đã import ${res.imported}/${res.total} nhân viên`);
        onSuccess();
      } else {
        toast.warning('Không có nhân viên nào được import');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Import thất bại';
      toast.error(msg);
      setResult(null);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import danh sách nhân viên</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-[#0052cc]/50 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-[13px] text-muted-foreground">
              {file ? file.name : 'Nhấn để chọn file Excel (.xlsx, .xls)'}
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <p className="text-[12px] text-muted-foreground">
            File Excel cần có các cột: <strong>email</strong>, <strong>name</strong>, phone, role, branchId.
            Mật khẩu mặc định: FieldApp@123
          </p>

          {result && (
            <div className="space-y-2 p-4 bg-gray-50 rounded-lg text-[13px]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Tổng số dòng: <strong>{result.total}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Đã import: <strong className="text-emerald-600">{result.imported}</strong></span>
              </div>
              {result.skipped > 0 && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span>Bỏ qua: <strong className="text-amber-600">{result.skipped}</strong></span>
                </div>
              )}
              {result.errors.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-red-500 font-semibold">Chi tiết lỗi:</p>
                  {result.errors.slice(0, 10).map((err, i) => (
                    <p key={i} className="text-[12px] text-red-500">
                      Dòng {err.row}: {err.message}
                    </p>
                  ))}
                  {result.errors.length > 10 && (
                    <p className="text-[12px] text-muted-foreground">
                      ... và {result.errors.length - 10} lỗi khác
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleClose}>
              Đóng
            </Button>
            <Button
              size="sm"
              onClick={handleImport}
              disabled={!file || uploading}
              className="bg-[#0052cc] hover:bg-[#003d9b]"
            >
              {uploading && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Import
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
