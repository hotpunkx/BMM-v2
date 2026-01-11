import axios from 'axios';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;

export const uploadFileToIPFS = async (file: File) => {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
        throw new Error("Pinata API Keys missing");
    }

    const formData = new FormData();
    formData.append('file', file);

    const pinataMetadata = JSON.stringify({
        name: "Based Meme Image",
    });
    formData.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({
        cidVersion: 0,
    });
    formData.append('pinataOptions', pinataOptions);

    const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'pinata_api_key': PINATA_API_KEY,
            'pinata_secret_api_key': PINATA_SECRET_KEY,
        }
    });

    return res.data.IpfsHash;
};

export const uploadToIPFS = async (file: File) => {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
        throw new Error("Pinata API Keys missing");
    }

    try {
        // 1. Upload Image
        console.log("Uploading image to Pinata...");
        const imageCid = await uploadFileToIPFS(file);
        const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageCid}`;
        console.log("Image uploaded:", imageUrl);

        // 2. Create & Upload Metadata
        const metadata = {
            name: "Based Meme",
            description: "Created with Based Meme Maker on Base",
            image: imageUrl,
            external_url: "https://mememakerbased.vercel.app/",
            attributes: [
                { trait_type: "Creator", value: "Hotpunk" },
                { trait_type: "App", value: "Based Meme Maker" }
            ]
        };

        console.log("Uploading metadata to Pinata...");
        const jsonRes = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", metadata, {
            headers: {
                'Content-Type': 'application/json',
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_KEY,
            }
        });

        const metadataCid = jsonRes.data.IpfsHash;
        const metadataUri = `ipfs://${metadataCid}`;

        console.log("Metadata uploaded:", metadataUri);
        return metadataUri;

    } catch (error) {
        console.error("IPFS Upload Error:", error);
        throw error;
    }
};
