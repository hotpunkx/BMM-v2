import { useState } from "react";
import { ImageUpload } from "./ImageUpload";
import { MemeCanvas } from "./MemeCanvas";

export interface MemeGeneratorProps {
  uploadedImage: string | null;
  setUploadedImage: (image: string | null) => void;
}

export const MemeGenerator = ({ uploadedImage, setUploadedImage }: MemeGeneratorProps) => {
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(48);

  return (
    <div className="max-w-5xl mx-auto">
      {!uploadedImage ? (
        <ImageUpload onImageUpload={setUploadedImage} />
      ) : (
        <MemeCanvas
          imageUrl={uploadedImage}
          textColor={textColor}
          fontSize={fontSize}
          onColorChange={setTextColor}
          onFontSizeChange={setFontSize}
          setUploadedImage={setUploadedImage}
        />
      )}
    </div>
  );
};
