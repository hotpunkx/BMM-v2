import { useState } from "react";
import { MemeGenerator } from "@/components/MemeGenerator";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect } from "react";
import { Star } from "lucide-react";

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState(true); // Default to true to avoid flash

  useEffect(() => {
    const checkContext = async () => {
      try {
        const context = await sdk.context;
        // Check strict equality to false so we only prompt if explicitly not added
        if (context && context.client.added === false) {
          setIsAdded(false);
        }
      } catch (err) {
        console.error("Error checking Farcaster context:", err);
      }
    };
    checkContext();
  }, []);

  const handleAddStart = async () => {
    try {
      await sdk.actions.addMiniApp();
      setIsAdded(true);
    } catch (error) {
      console.error("Failed to add miniapp:", error);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center overflow-auto bg-transparent relative selection:bg-blue-500 selection:text-white py-6">

      {/* Background Effects */}
      <div className="fixed inset-0 ambient-glow pointer-events-none z-0"></div>
      <div className="fixed top-[-10%] right-[-5%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Navbar / Header Actions - Responsive Positioning */}
      <div className="md:fixed md:top-4 md:right-4 z-50 flex justify-center w-full md:w-auto pt-4 md:pt-0 mb-4 md:mb-0">
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
            const ready = mounted && authenticationStatus !== 'loading';
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus ||
                authenticationStatus === 'authenticated');

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  'style': {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button onClick={openConnectModal} type="button" className="wallet-btn">
                        <svg viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
                          <g fill="none">
                            <path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"></path>
                            <path d="M9.107 5.448c.598-1.75 3.016-1.803 3.725-.159l.06.16l.807 2.36a4 4 0 0 0 2.276 2.411l.217.081l2.36.806c1.75.598 1.803 3.016.16 3.725l-.16.06l-2.36.807a4 4 0 0 0-2.412 2.276l-.081.216l-.806 2.361c-.598 1.75-3.016 1.803-3.724.16l-.062-.16l-.806-2.36a4 4 0 0 0-2.276-2.412l-.216-.081l-2.36-.806c-1.751-.598-1.804-3.016-.16-3.724l.16-.062l2.36-.806A4 4 0 0 0 8.22 8.025l.081-.216zM11 6.094l-.806 2.36a6 6 0 0 1-3.49 3.649l-.25.091l-2.36.806l2.36.806a6 6 0 0 1 3.649 3.49l.091.25l.806 2.36l.806-2.36a6 6 0 0 1 3.49-3.649l.25-.09l2.36-.807l-2.36-.806a6 6 0 0 1-3.649-3.49l-.09-.25zM19 2a1 1 0 0 1 .898.56l.048.117l.35 1.026l1.027.35a1 1 0 0 1 .118 1.845l-.118.048l-1.026.35l-.35 1.027a1 1 0 0 1-1.845.117l-.048-.117l-.35-1.026l-1.027-.35a1 1 0 0 1-.118-1.845l.118-.048l1.026-.35l.35-1.027A1 1 0 0 1 19 2" fill="currentColor"></path>
                          </g>
                        </svg>
                        Connect Wallet
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button onClick={openChainModal} type="button" className="wallet-btn bg-red-500">
                        Wrong network
                      </button>
                    );
                  }

                  return (
                    <div className="flex gap-3">
                      <button
                        onClick={openAccountModal}
                        type="button"
                        className="wallet-btn"
                      >
                        <svg viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
                          <g fill="none">
                            <path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"></path>
                            <path d="M9.107 5.448c.598-1.75 3.016-1.803 3.725-.159l.06.16l.807 2.36a4 4 0 0 0 2.276 2.411l.217.081l2.36.806c1.75.598 1.803 3.016.16 3.725l-.16.06l-2.36.807a4 4 0 0 0-2.412 2.276l-.081.216l-.806 2.361c-.598 1.75-3.016 1.803-3.724.16l-.062-.16l-.806-2.36a4 4 0 0 0-2.276-2.412l-.216-.081l-2.36-.806c-1.751-.598-1.804-3.016-.16-3.724l.16-.062l2.36-.806A4 4 0 0 0 8.22 8.025l.081-.216zM11 6.094l-.806 2.36a6 6 0 0 1-3.49 3.649l-.25.091l-2.36.806l2.36.806a6 6 0 0 1 3.649 3.49l.091.25l.806 2.36l.806-2.36a6 6 0 0 1 3.49-3.649l.25-.09l2.36-.807l-2.36-.806a6 6 0 0 1-3.649-3.49l-.09-.25zM19 2a1 1 0 0 1 .898.56l.048.117l.35 1.026l1.027.35a1 1 0 0 1 .118 1.845l-.118.048l-1.026.35l-.35 1.027a1 1 0 0 1-1.845.117l-.048-.117l-.35-1.026l-1.027-.35a1 1 0 0 1-.118-1.845l.118-.048l1.026-.35l.35-1.027A1 1 0 0 1 19 2" fill="currentColor"></path>
                          </g>
                        </svg>
                        {account.displayName}
                        {account.displayBalance
                          ? ` (${account.displayBalance})`
                          : ''}
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>

      <div className="z-10 w-full flex flex-col items-center gap-4 px-6">

        <div className="text-center space-y-4 max-w-lg bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)]">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.8)] filter font-slackey">
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

      {/* Add to Favorites Prompt */}
      {!isAdded && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button
            onClick={handleAddStart}
            className="flex items-center gap-2 bg-yellow-500/90 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.5)] transition-all hover:scale-105 active:scale-95 backdrop-blur-sm"
          >
            <Star className="w-5 h-5 fill-black" />
            Add to Favorites
          </button>
        </div>
      )}
    </main>
  );
};

export default Index;
