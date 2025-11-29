import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, AlertTriangle } from "lucide-react";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void; // Optional: If provided, shows "Confirm" button
  title: string;
  message: string;
  type?: "success" | "error" | "info";
  confirmText?: string;
  cancelText?: string;
}

const MessageModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    type = "info",
    confirmText = "OK",
    cancelText = "Cancel"
}: MessageModalProps) => {
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1c1917] border-4 border-[#CCA46D] text-[#E7E5E4] max-w-md shadow-stone texture-stone p-6">
        
        <DialogHeader className="flex flex-col items-center gap-4">
            {/* Icon based on type */}
            <div className={`h-16 w-16 rounded-full border-4 flex items-center justify-center shadow-bronze ${
                type === 'success' ? 'border-green-500/50 bg-green-900/20 text-green-500' :
                type === 'error' ? 'border-red-500/50 bg-red-900/20 text-red-500' :
                'border-[#CCA46D] bg-[#CCA46D]/10 text-[#CCA46D]'
            }`}>
                {type === 'success' ? <CheckCircle className="w-8 h-8" /> : 
                 type === 'error' ? <AlertTriangle className="w-8 h-8" /> : 
                 <Shield className="w-8 h-8" />}
            </div>

            <DialogTitle className="font-display text-2xl text-[#CCA46D] tracking-widest uppercase text-center">
                {title}
            </DialogTitle>
        </DialogHeader>
        
        <div className="text-center text-stone-300 font-sans text-lg py-2 leading-relaxed">
            {message}
        </div>

        <DialogFooter className="flex gap-3 justify-center sm:justify-center mt-4">
            {/* Cancel Button (Only if onConfirm exists) */}
            {onConfirm && (
                <Button 
                    variant="ghost" 
                    onClick={onClose}
                    className="text-stone-400 hover:text-[#CCA46D] hover:bg-transparent"
                >
                    {cancelText}
                </Button>
            )}

            {/* Main Action Button */}
            <Button 
                onClick={() => {
                    if (onConfirm) onConfirm();
                    else onClose();
                }}
                className="bg-[#CCA46D] text-black hover:bg-[#B08D57] font-bold px-8"
            >
                {confirmText}
            </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};

export default MessageModal;