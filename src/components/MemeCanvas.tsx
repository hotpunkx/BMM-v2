import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, FabricImage, IText, Rect, Path, Shadow } from "fabric";
import { Button } from "./ui/button";

// --- TEXT PRESETS DEFINITION ---
type PresetName =
  | "classic"
  | "thick-glow"
  | "soft-shadow"
  | "neon"
  | "sticker"
  | "comic"
  | "subtitle"
  | "hollow"
  | "3d"
  | "handwritten";

const TEXT_PRESETS: Record<PresetName, Partial<IText>> = {
  classic: {
    fontFamily: "Impact",
    stroke: "#000000",
    strokeWidth: 3,
    fill: "#ffffff",
    shadow: new Shadow({ color: "#000000", blur: 0, offsetX: 2, offsetY: 2 }),
  },
  "thick-glow": {
    fontFamily: "Impact",
    stroke: "#000000",
    strokeWidth: 5,
    fill: "#ffffff",
    shadow: new Shadow({ color: "rgba(255,255,255,0.35)", blur: 10, offsetX: 0, offsetY: 0 }),
  },
  "soft-shadow": {
    fontFamily: "Impact",
    strokeWidth: 0,
    fill: "#ffffff",
    shadow: new Shadow({ color: "rgba(0,0,0,0.55)", blur: 24, offsetX: 0, offsetY: 12 }),
  },
  neon: {
    fontFamily: "Impact",
    fill: "#ffffff",
    stroke: "#00ffff",
    strokeWidth: 1,
    shadow: new Shadow({ color: "rgba(0,255,255,0.7)", blur: 36, offsetX: 0, offsetY: 0 }),
  },
  sticker: {
    fontFamily: "Impact",
    fill: "#111111",
    backgroundColor: "rgba(255,255,255,0.92)",
    strokeWidth: 0,
    padding: 8,
    shadow: new Shadow({ color: "rgba(0,0,0,0.35)", blur: 25, offsetX: 0, offsetY: 10 }),
  },
  comic: {
    fontFamily: "Comic Sans MS",
    fill: "#ffffff",
    stroke: "#000000",
    strokeWidth: 2.5,
    shadow: new Shadow({ color: "rgba(0,0,0,0.8)", blur: 0, offsetX: 6, offsetY: 6 }),
  },
  subtitle: {
    fontFamily: "Arial",
    fill: "#ffffff",
    backgroundColor: "rgba(0,0,0,0.65)",
    strokeWidth: 0,
    padding: 6,
    shadow: new Shadow({ color: "rgba(0,0,0,0.75)", blur: 8, offsetX: 0, offsetY: 2 }),
  },
  hollow: {
    fontFamily: "Impact",
    fill: "transparent",
    stroke: "#ffffff",
    strokeWidth: 4,
    shadow: new Shadow({ color: "rgba(0,0,0,0.35)", blur: 22, offsetX: 0, offsetY: 10 }),
  },
  "3d": {
    fontFamily: "Impact",
    stroke: "#000000",
    strokeWidth: 2,
    fill: "#ffffff",
    shadow: new Shadow({ color: "rgba(0,0,0,0.8)", blur: 0, offsetX: 5, offsetY: 5 }), // Simplified Fabric 3D
  },
  handwritten: {
    fontFamily: "Comic Sans MS", // Fallback
    fill: "#ffffff",
    strokeWidth: 0,
    shadow: new Shadow({ color: "rgba(0,0,0,0.55)", blur: 22, offsetX: 0, offsetY: 10 }),
  },
};

import { Download, Type, Image, Trash2, Undo2, Redo2, Square, ArrowRight, ImagePlus, Monitor, Smartphone, RectangleHorizontal, Loader2, Coins, Share2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import { ThreeDButton } from "./ui/ThreeDButton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../constants/contract";
import { uploadToIPFS, uploadFileToIPFS } from "../utils/ipfs";

interface MemeCanvasProps {
  imageUrl: string;
  textColor: string;
  fontSize: number;
  onColorChange: (color: string) => void;
  onFontSizeChange: (size: number) => void;
  setUploadedImage: (url: string | null) => void;
}

type AspectRatio = "16:9" | "4:3" | "9:16";

export const MemeCanvas = ({ imageUrl, textColor, fontSize, onColorChange, onFontSizeChange, setUploadedImage }: MemeCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const imageRef = useRef<FabricImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const isRedoing = useRef(false);
  const [textStrokeColor, setTextStrokeColor] = useState("#000000");
  const [textStrokeWidth, setTextStrokeWidth] = useState(2);
  const [canvasColor, setCanvasColor] = useState("#ffffff");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [isMinting, setIsMinting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [mintHash, setMintHash] = useState<`0x${string}` | undefined>(undefined);

  // Wagmi Hooks
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { isLoading: isConfirmingTx, isSuccess: isMintSuccess } = useWaitForTransactionReceipt({
    hash: mintHash,
  });

  // Watch for Success
  useEffect(() => {
    if (isMintSuccess && mintHash) {
      toast.success("Minted Successfully!", {
        action: {
          label: "View on Basescan",
          onClick: () => window.open(`https://basescan.org/tx/${mintHash}`, '_blank'),
        },
        duration: 8000,
      });
      setIsMinting(false);
      setMintHash(undefined);
    }
  }, [isMintSuccess, mintHash]);

  // Guard to prevent double initialization issues
  const canvasInstanceRef = useRef<FabricCanvas | null>(null);

  const saveState = (canvas: FabricCanvas) => {
    if (isRedoing.current) return;
    try {
      const json = JSON.stringify(canvas.toJSON());
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyStep + 1);
        newHistory.push(json);
        return newHistory;
      });
      setHistoryStep((prev) => prev + 1);
    } catch (e) {
      console.error("Failed to save state:", e);
    }
  };

  const getCanvasSize = (ratio: AspectRatio) => {
    const padding = 32;
    const maxWidth = Math.min(window.innerWidth - padding, 800);
    // Base dimensions calculation
    let width = maxWidth;
    let height = width;

    if (ratio === "16:9") {
      height = Math.round(width * 9 / 16);
    } else if (ratio === "4:3") {
      height = Math.round(width * 3 / 4);
    } else if (ratio === "9:16") {
      height = Math.round(width * 16 / 9);
      // Removed viewport constraint as per request
    }
    return { width, height };
  };

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    // Safety check: Dispose existing instance if any (React Strict Mode support)
    if (canvasInstanceRef.current) {
      try {
        canvasInstanceRef.current.dispose();
      } catch (e) { console.warn("Dispose error", e); }
      canvasInstanceRef.current = null;
    }

    try {
      const { width, height } = getCanvasSize(aspectRatio);
      const canvas = new FabricCanvas(canvasRef.current, {
        width,
        height,
        backgroundColor: canvasColor,
        preserveObjectStacking: true, // Better layer management
      });

      canvasInstanceRef.current = canvas;
      setFabricCanvas(canvas);

      const handleResize = () => {
        if (!canvasInstanceRef.current) return;
        const { width, height } = getCanvasSize(aspectRatio);
        canvasInstanceRef.current.setDimensions({ width, height });
        refreshImagePosition(canvasInstanceRef.current, width, height);
      };

      window.addEventListener("resize", handleResize);

      // Initial State Save
      const initialState = JSON.stringify(canvas.toJSON());
      setHistory([initialState]);
      setHistoryStep(0);

      // Event Listeners
      const onStateChange = () => saveState(canvas);
      canvas.on("object:added", onStateChange);
      canvas.on("object:modified", onStateChange);
      canvas.on("object:removed", onStateChange);

      return () => {
        window.removeEventListener("resize", handleResize);
        // Cleanup
        if (canvasInstanceRef.current) {
          canvasInstanceRef.current.dispose();
          canvasInstanceRef.current = null;
        }
        setFabricCanvas(null);
      };
    } catch (error) {
      console.error("Error initializing fabric canvas:", error);
      toast.error("Failed to load canvas. Please refresh.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run ONCE on mount. resizing and ratio changes handled via refs/effects interaction or manual updates.

  // Helper to maintain image position on resize/ratio change
  const refreshImagePosition = (canvas: FabricCanvas, w: number, h: number) => {
    if (imageRef.current) {
      const scale = Math.min(
        w / (imageRef.current.width || 1),
        h / (imageRef.current.height || 1)
      );
      imageRef.current.scale(scale);
      imageRef.current.set({
        left: (w - (imageRef.current.width || 0) * scale) / 2,
        top: (h - (imageRef.current.height || 0) * scale) / 2,
      });
      canvas.sendObjectToBack(imageRef.current);
      canvas.renderAll();
    }
  };

  // Handle Aspect Ratio & Color Updates
  useEffect(() => {
    if (!fabricCanvas) return;

    // Updates
    const { width, height } = getCanvasSize(aspectRatio);
    fabricCanvas.setDimensions({ width, height });
    fabricCanvas.backgroundColor = canvasColor;

    refreshImagePosition(fabricCanvas, width, height);
    fabricCanvas.renderAll();
  }, [aspectRatio, canvasColor, fabricCanvas]);

  // Load Image
  useEffect(() => {
    if (!fabricCanvas || !imageUrl) return;

    FabricImage.fromURL(imageUrl).then((img) => {
      const { width, height } = getCanvasSize(aspectRatio); // Use current aspect ratio

      const scale = Math.min(width / (img.width || 1), height / (img.height || 1));
      img.scale(scale);
      img.set({
        left: (width - (img.width || 0) * scale) / 2,
        top: (height - (img.height || 0) * scale) / 2,
        selectable: true,
      });

      imageRef.current = img;
      fabricCanvas.clear(); // Clear previous content
      fabricCanvas.backgroundColor = canvasColor; // Restore color
      fabricCanvas.add(img);
      fabricCanvas.sendObjectToBack(img);
      fabricCanvas.renderAll();

      // Reset History on new image load
      const state = JSON.stringify(fabricCanvas.toJSON());
      setHistory([state]);
      setHistoryStep(0);
    }).catch(err => {
      console.error("Failed to load image:", err);
      toast.error("Failed to load image on canvas.");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fabricCanvas, imageUrl]); // Removed aspectRatio dependency to prevent reload loop

  // Keyboard Shortcuts (Outside useEffect to avoid stale closures if using state)
  useEffect(() => {
    if (!fabricCanvas) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        const activeObject = fabricCanvas.getActiveObject();
        if (activeObject instanceof IText && activeObject.isEditing) return;
        if (activeObject && activeObject !== imageRef.current) {
          fabricCanvas.remove(activeObject);
          fabricCanvas.renderAll();
          toast.success("Object deleted");
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fabricCanvas, history, historyStep]);

  const addText = () => {
    if (!fabricCanvas) return;
    const text = new IText("Your Text Here", {
      left: 100, top: 100, fontSize, fill: textColor, fontFamily: "Arial, sans-serif", fontWeight: "bold", stroke: textStrokeColor, strokeWidth: textStrokeWidth, selectable: true, editable: true,
    });
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    fabricCanvas.renderAll();
    toast.success("Text added!");
  };

  const addRectangle = () => {
    if (!fabricCanvas) return;
    const rect = new Rect({
      left: 150, top: 150, fill: textColor, width: 150, height: 100, stroke: textStrokeColor, strokeWidth: 2, selectable: true,
    });
    fabricCanvas.add(rect);
    fabricCanvas.setActiveObject(rect);
    fabricCanvas.renderAll();
    toast.success("Rectangle added!");
  };

  const addArrow = () => {
    if (!fabricCanvas) return;
    const arrowPath = new Path("M 0 0 L 100 0 L 90 -10 M 100 0 L 90 10", {
      left: 150, top: 150, stroke: textColor, strokeWidth: 3, fill: "", strokeLineCap: "round", selectable: true,
    });
    fabricCanvas.add(arrowPath);
    fabricCanvas.setActiveObject(arrowPath);
    fabricCanvas.renderAll();
    toast.success("Arrow added!");
  };

  const applyPreset = (presetName: PresetName) => {
    if (!fabricCanvas) return;
    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject && activeObject instanceof IText) {
      const preset = TEXT_PRESETS[presetName];
      activeObject.set(preset);

      // Sync state controls to match preset (optional, improves UX)
      if (preset.fill && typeof preset.fill === 'string') onColorChange(preset.fill);
      if (preset.stroke) setTextStrokeColor(preset.stroke);

      fabricCanvas.renderAll();
      toast.success(`Applied ${presetName} preset!`);
      saveState(fabricCanvas);
    } else {
      // If nothing selected, add new text with preset
      const preset = TEXT_PRESETS[presetName];
      const text = new IText("PRESET TEXT", {
        left: 150, top: 150, fontSize: 60, ...preset, selectable: true, editable: true
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
      fabricCanvas.renderAll();
      saveState(fabricCanvas);
    }
  };

  useEffect(() => {
    if (!fabricCanvas) return;
    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject && activeObject instanceof IText) {
      activeObject.set({ fill: textColor, fontSize, stroke: textStrokeColor, strokeWidth: textStrokeWidth }); // Added stroke sync
      fabricCanvas.renderAll();
    }
  }, [textColor, fontSize, textStrokeColor, textStrokeWidth, fabricCanvas]);

  const handleUndo = () => {
    if (!fabricCanvas || historyStep <= 0) return;
    const historyState = history[historyStep - 1];
    isRedoing.current = true;
    fabricCanvas.loadFromJSON(JSON.parse(historyState)).then(() => {
      const objects = fabricCanvas.getObjects();
      // Re-find image ref
      const img = objects.find(obj => obj instanceof FabricImage);
      if (img) imageRef.current = img as FabricImage;

      fabricCanvas.backgroundColor = canvasColor;
      fabricCanvas.renderAll();
      setHistoryStep(historyStep - 1);
      isRedoing.current = false;
      toast.success("Undo applied");
    });
  };

  const handleRedo = () => {
    if (!fabricCanvas || historyStep >= history.length - 1) return;
    const historyState = history[historyStep + 1];
    isRedoing.current = true;
    fabricCanvas.loadFromJSON(JSON.parse(historyState)).then(() => {
      const objects = fabricCanvas.getObjects();
      const img = objects.find(obj => obj instanceof FabricImage);
      if (img) imageRef.current = img as FabricImage;

      fabricCanvas.backgroundColor = canvasColor;
      fabricCanvas.renderAll();
      setHistoryStep(historyStep + 1);
      isRedoing.current = false;
      toast.success("Redo applied");
    });
  };

  const deleteSelected = () => {
    if (!fabricCanvas) return;
    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject && activeObject !== imageRef.current) {
      fabricCanvas.remove(activeObject);
      fabricCanvas.renderAll();
      toast.success("Object deleted");
    } else {
      toast.error("Cannot delete background image");
    }
  };

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgUrl = event.target?.result as string;
      FabricImage.fromURL(imgUrl).then((img) => {
        img.scale(0.3);
        img.set({ left: 100, top: 100, selectable: true });
        fabricCanvas.add(img);
        fabricCanvas.setActiveObject(img);
        fabricCanvas.renderAll();
        toast.success("Image added!");
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const downloadMeme = () => {
    if (!fabricCanvas) return;
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
    const dataURL = fabricCanvas.toDataURL({ format: "png", quality: 1, multiplier: 3 }); // High quality 3x
    const link = document.createElement("a");
    link.download = `meme-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
    toast.success("Downloading meme...");
  };

  const generateAndUploadMeme = async () => {
    if (!fabricCanvas) return null;
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
    const dataURL = fabricCanvas.toDataURL({ format: "png", quality: 1, multiplier: 2 });
    const res = await fetch(dataURL);
    const blob = await res.blob();
    const file = new File([blob], `meme-share-${Date.now()}.png`, { type: "image/png" });
    return await uploadFileToIPFS(file);
  };

  const handleShare = async () => {
    setIsSharing(true);
    toast.info("Creating shareable link...");
    try {
      const cid = await generateAndUploadMeme();
      if (!cid) throw new Error("Failed to upload");

      const shareUrl = `${window.location.origin}/share?id=${cid}`;
      await navigator.clipboard.writeText(shareUrl);

      toast.success("Link copied to clipboard!", {
        description: "Share this link with your friends!",
        duration: 5000,
      });
    } catch (e) {
      console.error("Share failed", e);
      toast.error("Failed to create share link");
    } finally {
      setIsSharing(false);
    }
  };

  const handleBaseShare = async () => {
    setIsSharing(true);
    toast.info("Preparing for Base Feed...");
    try {
      const cid = await generateAndUploadMeme();
      if (!cid) throw new Error("Failed to upload");

      const shareUrl = `${window.location.origin}/share?id=${cid}`;
      const text = encodeURIComponent("Make it Based 🔵");
      const url = encodeURIComponent(shareUrl);
      const warpcastUrl = `https://warpcast.com/~/compose?text=${text}&embeds[]=${url}`;

      window.open(warpcastUrl, '_blank');
      toast.success("Opened in Warpcast!");
    } catch (e) {
      console.error("Base Share failed", e);
      toast.error("Failed to share to Base Feed");
    } finally {
      setIsSharing(false);
    }
  };

  const handleMint = async () => {
    if (!fabricCanvas) return;
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first!");
      return;
    }

    setIsMinting(true);
    toast.info("Preparing your meme for the blockchain...");

    try {
      // 1. Prepare Image
      fabricCanvas.discardActiveObject();
      fabricCanvas.renderAll();

      const dataURL = fabricCanvas.toDataURL({ format: "png", quality: 1, multiplier: 2 });
      const res = await fetch(dataURL);
      const blob = await res.blob();
      const file = new File([blob], `meme-${Date.now()}.png`, { type: "image/png" });

      // 2. Upload to IPFS via Pinata
      toast.info("Uploading to permanent storage...");
      const metadataUri = await uploadToIPFS(file);
      console.log("Metadata URI:", metadataUri);

      // 3. Mint NFT
      toast.info("Please confirm transaction in your wallet...");
      // @ts-expect-error - Chain is inferred from provider but type definition expects explicit property in this context
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: "mint",
        args: [address, metadataUri],
        account: address,
      });

      console.log("Tx Hash:", hash);
      setMintHash(hash);
      toast.info("Transaction sent! Waiting for confirmation...");
      // setIsMinting stays true until isMintSuccess effect triggers

    } catch (error) {
      console.error("Minting failed:", error);
      toast.error("Minting failed. See console for details.");
      setIsMinting(false);
    }
  };

  return (
    <div className="space-y-2 max-w-4xl mx-auto animate-in fade-in duration-500 pb-20">
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

      {/* Top Controls: Image & Download - 2 Layers on Mobile */}
      <div className="flex justify-center flex-wrap gap-2 pb-2 px-1">
        <Button onClick={addImage} size="sm" className="btn-donate btn-orange gap-1.5 text-white shrink-0 px-3 h-9 text-xs sm:text-sm">
          <ImagePlus className="w-3.5 h-3.5" />
          Add
        </Button>
        <Button onClick={() => setUploadedImage(null)} size="sm" className="btn-donate btn-orange gap-1.5 text-white shrink-0 px-3 h-9 text-xs sm:text-sm">
          <Image className="w-3.5 h-3.5" />
          New
        </Button>

        {/* Dropdown for Download / Mint / Share */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="btn-donate gap-1.5 text-white shrink-0 px-3 h-9 text-xs sm:text-sm">
              Mint <ChevronDown className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-slate-900 border-white/10 text-white">
            <DropdownMenuItem onClick={downloadMeme} className="gap-2 cursor-pointer focus:bg-white/10 focus:text-white">
              <Download className="w-4 h-4" /> Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleMint} disabled={isMinting} className="gap-2 cursor-pointer focus:bg-white/10 focus:text-white">
              <Coins className="w-4 h-4" /> {isMinting ? "Preparing..." : "Mint on Base"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleBaseShare} disabled={isSharing} className="gap-2 cursor-pointer focus:bg-white/10 focus:text-white">
              <Share2 className="w-4 h-4" /> Share
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Editor Toolbar */}
      <div className="flex flex-col gap-2 bg-slate-900/60 backdrop-blur-md border border-white/10 p-2 rounded-xl shadow-2xl ring-1 ring-white/5">

        {/* Row 1: Add Items & History */}
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex gap-2">
            <Button onClick={addText} size="sm" variant="secondary" className="gap-2 bg-slate-800 text-white hover:bg-slate-700 border-white/10">
              <Type className="w-4 h-4" /> Text
            </Button>
            <Button onClick={addRectangle} size="icon" variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/10" title="Rectangle">
              <Square className="w-4 h-4" />
            </Button>
            <Button onClick={addArrow} size="icon" variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/10" title="Arrow">
              <ArrowRight className="w-4 h-4" />
            </Button>

            {/* Aspect Ratio Key - Moved beside Arrow */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 gap-2 text-slate-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10" title="Canvas Ratio">
                  <Monitor className="w-4 h-4" />
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-32 bg-slate-900 border-white/10 text-white">
                <DropdownMenuItem onClick={() => setAspectRatio("16:9")} className="gap-2 cursor-pointer focus:bg-white/10 focus:text-white justify-between">
                  <div className="flex items-center gap-2"><Monitor className="w-4 h-4" /> 16:9</div>
                  {aspectRatio === "16:9" && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAspectRatio("4:3")} className="gap-2 cursor-pointer focus:bg-white/10 focus:text-white justify-between">
                  <div className="flex items-center gap-2"><RectangleHorizontal className="w-4 h-4" /> 4:3</div>
                  {aspectRatio === "4:3" && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAspectRatio("9:16")} className="gap-2 cursor-pointer focus:bg-white/10 focus:text-white justify-between">
                  <div className="flex items-center gap-2"><Smartphone className="w-4 h-4" /> 9:16</div>
                  {aspectRatio === "9:16" && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex gap-2">
            <div className="h-8 w-px bg-white/10 mx-1" />
            <Button onClick={handleUndo} size="icon" variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/10" disabled={historyStep <= 0}>
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button onClick={handleRedo} size="icon" variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/10" disabled={historyStep >= history.length - 1}>
              <Redo2 className="w-4 h-4" />
            </Button>
            <Button onClick={deleteSelected} size="icon" variant="destructive" className="bg-red-500/80 hover:bg-red-600/90 text-white">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Row 2: Canvas Settings (Color Only) */}
        <div className="flex justify-center items-center gap-4 flex-wrap bg-black/20 p-2 rounded-lg border border-white/5">
          <div className="flex items-center gap-2">
            <Label htmlFor="canvas-color" className="text-xs font-semibold text-slate-300">CANVAS</Label>
            <div className="relative overflow-hidden w-8 h-8 rounded-full border-2 border-white/20 hover:scale-105 transition-transform">
              <input
                id="canvas-color"
                type="color"
                value={canvasColor}
                onChange={(e) => setCanvasColor(e.target.value)}
                className="absolute -top-4 -left-4 w-16 h-16 cursor-pointer p-0 border-0"
                title="Canvas Background Color"
              />
            </div>
          </div>
        </div>

        {/* Row 3: Text Styles & Presets */}
        <div className="flex justify-center items-center gap-4 flex-wrap text-sm pt-1">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-slate-300">TEXT</Label>
            <div className="relative overflow-hidden w-6 h-6 rounded border border-white/20">
              <input type="color" value={textColor} onChange={(e) => onColorChange(e.target.value)} className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer p-0 border-0" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs text-slate-300">OUTLINE</Label>
            <div className="relative overflow-hidden w-6 h-6 rounded border border-white/20">
              <input type="color" value={textStrokeColor} onChange={(e) => setTextStrokeColor(e.target.value)} className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer p-0 border-0" />
            </div>
          </div>

          {/* PRESETS DROPDOWN */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-white/20 bg-white/5 hover:bg-white/10 text-slate-300">
                  <Type className="w-3 h-3" /> PRESETS
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-slate-900 border-white/10 text-white max-h-64 overflow-y-auto">
                {Object.keys(TEXT_PRESETS).map((key) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => applyPreset(key as PresetName)}
                    className="cursor-pointer hover:bg-white/10 focus:bg-white/10 text-xs py-2 capitalize"
                  >
                    {key}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2 min-w-[120px]">
            <span className="text-xs text-slate-300">SIZE</span>
            <Slider value={[fontSize]} onValueChange={(val) => onFontSizeChange(val[0])} min={12} max={120} step={1} className="w-28" />
          </div>
        </div>
      </div>

      <div className="flex justify-center w-full px-2 sm:px-0">
        <div className="border border-white/10 rounded-xl overflow-hidden shadow-2xl bg-slate-950/50 w-full max-w-[800px] transition-all duration-500 ease-in-out relative group">
          <canvas ref={canvasRef} className="w-full h-auto" />
        </div>
      </div>

      <p className="text-center text-xs text-slate-500 animate-pulse">
        Double-click text to edit • Drag to move
      </p>
    </div>
  );
};
