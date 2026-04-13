import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { Home, Share2 } from "lucide-react";
import { toast } from "sonner";

const Share = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const id = searchParams.get("id"); // IPFS CID
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            // Construct Pinata Gateway URL
            const url = `https://gateway.pinata.cloud/ipfs/${id}`;
            setImageUrl(url);
        }
    }, [id]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
    };

    if (!id) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white bg-slate-950">
                <h1 className="text-2xl font-bold mb-4">Meme not found</h1>
                <Button onClick={() => navigate("/")}>Go Home</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 p-4">
            {imageUrl && (
                <Helmet>
                    <title>Based Meme</title>
                    <meta property="og:title" content="Check out this Based Meme!" />
                    <meta property="og:description" content="Created with Meme Minter" />
                    <meta property="og:image" content={imageUrl} />
                    <meta property="og:url" content={window.location.href} />
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:image" content={imageUrl} />
                </Helmet>
            )}

            <div className="max-w-4xl w-full flex flex-col gap-6 items-center">
                <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    Based Meme Shared
                </h1>

                <div className="relative group rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black/50">
                    {imageUrl ? (
                        <img src={imageUrl} alt="Shared Meme" className="max-w-full max-h-[70vh] object-contain" />
                    ) : (
                        <div className="w-96 h-96 flex items-center justify-center text-slate-500">
                            Loading...
                        </div>
                    )}
                </div>

                <div className="flex gap-4 flex-wrap justify-center">
                    <Button onClick={handleCopyLink} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <Share2 className="w-4 h-4" />
                        Copy Link
                    </Button>
                    <Button onClick={() => navigate("/")} variant="outline" className="gap-2 border-white/10 hover:bg-white/5 text-slate-300">
                        <Home className="w-4 h-4" />
                        Make Your Own
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Share;
