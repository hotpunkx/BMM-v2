import { useState } from "react";
import { MemeGenerator } from "@/components/MemeGenerator";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  return (
    <main className="min-h-screen w-full flex items-center justify-center overflow-auto bg-transparent relative selection:bg-blue-500 selection:text-white py-10">

      {/* Background Effects */}
      <div className="fixed inset-0 ambient-glow pointer-events-none z-0"></div>
      <div className="fixed top-[-10%] right-[-5%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Navbar / Header Actions */}
      <div className="fixed top-4 right-4 z-50">
        <ConnectButton />
      </div>

      <div className="z-10 w-full flex flex-col items-center gap-8 px-6">

        <div className="text-center space-y-4 max-w-lg bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)]">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.8)] filter">
            Meme Maker
          </h1>
          {!uploadedImage && (
            <p className="text-slate-300 text-sm tracking-wide font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              YOUR GATEWAY TO <span className="text-blue-300 drop-shadow-[0_0_10px_rgba(147,197,253,0.8)]">BASED</span> MEMES.
            </p>
          )}
        </div>

        {/* MemeGenerator handles the Upload / Canvas Switch */}
        <div className="w-full flex justify-center">
          <MemeGenerator uploadedImage={uploadedImage} setUploadedImage={setUploadedImage} />
        </div>


      </div>
    </main>
  );
};

export default Index;
