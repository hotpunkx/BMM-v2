import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
}

export const ImageUpload = ({ onImageUpload }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageUpload(result);
        toast.success("Image uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageUpload(result);
        toast.success("Image uploaded successfully!");
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Please drop an image file");
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="based-float w-full max-w-md mx-auto relative group">
      <div
        className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"
      ></div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="relative w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col items-center text-center shadow-2xl"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-b from-blue-600 to-blue-800 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(37,99,235,0.6)] mb-6 transition-transform group-hover:scale-110 duration-300">
          <Upload className="w-8 h-8 text-white" />
        </div>

        <h3 className="text-lg font-semibold text-white mb-1">Click or drag to upload image</h3>
        <p className="text-xs text-slate-500 font-mono mb-8">PNG, JPG, GIF UP TO 10MB</p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="animated-button mx-auto"
        >
          <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
            ></path>
          </svg>
          <span className="text">Choose File</span>
          <span className="circle"></span>
          <svg viewBox="0 0 24 24" className="arr-1" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
            ></path>
          </svg>
        </button>

      </div>
    </div>
  );
};
