import { getSigner, getContract, WHEEL_NFT_ABI, CONTRACT_ADDRESSES, mintWheelNFT } from './web3Utils';
import { db, storage } from './firebase';
import { collection, addDoc, updateDoc, doc, Timestamp, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface WheelNFT {
  id: string;
  tokenId: string;
  name: string;
  creator: string;
  createdAt: Timestamp;
  isPublic: boolean;
  imageUrl: string;
  segments: Segment[];
  metadata: any;
}

export interface Segment {
  label: string;
  color: string;
  probability: number;
  prizeAmount: number;
}

// Upload wheel image to Firebase Storage
export async function uploadWheelImage(file: File, wheelName: string): Promise<string> {
  try {
    const timestamp = Date.now();
    const filename = `wheels/${wheelName}-${timestamp}.png`;
    const fileRef = ref(storage, filename);

    await uploadBytes(fileRef, file);
    const downloadUrl = await getDownloadURL(fileRef);

    return downloadUrl;
  } catch (error) {
    console.error('Error uploading wheel image:', error);
    throw error;
  }
}

// Create wheel metadata JSON
export function createWheelMetadata(
  name: string,
  description: string,
  imageUrl: string,
  segments: Segment[]
) {
  return {
    name,
    description,
    image: imageUrl,
    attributes: [
      {
        trait_type: 'Segments',
        value: segments.length,
      },
      {
        trait_type: 'Creator',
        value: 'Spinlana Player',
      },
      {
        trait_type: 'Created',
        value: new Date().toISOString(),
      },
    ],
    segments,
  };
}

// Mint wheel as NFT
export async function mintWheelAsNFT(
  wheelData: {
    name: string;
    description: string;
    imageFile: File;
    segments: Segment[];
    isPublic: boolean;
    price?: string;
  },
  userId: string
): Promise<WheelNFT> {
  try {
    const signer = await getSigner();
    if (!signer) throw new Error('No signer available');

    const userAddress = await signer.getAddress();

    // Upload image to Firebase Storage
    const imageUrl = await uploadWheelImage(wheelData.imageFile, wheelData.name);

    // Create metadata
    const metadata = createWheelMetadata(
      wheelData.name,
      wheelData.description,
      imageUrl,
      wheelData.segments
    );

    // Convert metadata to JSON string for URI
    const metadataUri = JSON.stringify(metadata);

    // Mint NFT on blockchain
    const tx = await mintWheelNFT(wheelData.name, metadataUri, wheelData.isPublic, wheelData.price);

    // Save wheel data to Firestore
    const wheelsRef = collection(db, 'nftWheels');
    const wheelDoc = await addDoc(wheelsRef, {
      name: wheelData.name,
      description: wheelData.description,
      creator: userAddress,
      userId,
      createdAt: Timestamp.now(),
      isPublic: wheelData.isPublic,
      imageUrl,
      segments: wheelData.segments,
      metadata,
      txHash: tx?.transactionHash,
      mintPrice: wheelData.price || '0.1',
      status: 'minted',
    });

    return {
      id: wheelDoc.id,
      tokenId: '', // This would be extracted from contract event
      name: wheelData.name,
      creator: userAddress,
      createdAt: Timestamp.now(),
      isPublic: wheelData.isPublic,
      imageUrl,
      segments: wheelData.segments,
      metadata,
    };
  } catch (error) {
    console.error('Error minting wheel:', error);
    throw error;
  }
}

// Get user's NFT wheels
export async function getUserNFTWheels(userId: string): Promise<WheelNFT[]> {
  try {
    const wheelsRef = collection(db, 'nftWheels');
    const q = query(wheelsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      tokenId: doc.data().tokenId || '',
      name: doc.data().name,
      creator: doc.data().creator,
      createdAt: doc.data().createdAt,
      isPublic: doc.data().isPublic,
      imageUrl: doc.data().imageUrl,
      segments: doc.data().segments,
      metadata: doc.data().metadata,
    }));
  } catch (error) {
    console.error('Error fetching user wheels:', error);
    return [];
  }
}

// Get all public NFT wheels
export async function getPublicNFTWheels(): Promise<WheelNFT[]> {
  try {
    const wheelsRef = collection(db, 'nftWheels');
    const q = query(wheelsRef, where('isPublic', '==', true));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      tokenId: doc.data().tokenId || '',
      name: doc.data().name,
      creator: doc.data().creator,
      createdAt: doc.data().createdAt,
      isPublic: doc.data().isPublic,
      imageUrl: doc.data().imageUrl,
      segments: doc.data().segments,
      metadata: doc.data().metadata,
    }));
  } catch (error) {
    console.error('Error fetching public wheels:', error);
    return [];
  }
}

// Get single NFT wheel details
export async function getNFTWheelDetails(wheelId: string): Promise<WheelNFT | null> {
  try {
    const wheelRef = doc(db, 'nftWheels', wheelId);
    const wheelSnapshot = await getDocs(collection(db, 'nftWheels'));

    const wheelDoc = wheelSnapshot.docs.find((d) => d.id === wheelId);
    if (!wheelDoc) return null;

    const data = wheelDoc.data();
    return {
      id: wheelDoc.id,
      tokenId: data.tokenId || '',
      name: data.name,
      creator: data.creator,
      createdAt: data.createdAt,
      isPublic: data.isPublic,
      imageUrl: data.imageUrl,
      segments: data.segments,
      metadata: data.metadata,
    };
  } catch (error) {
    console.error('Error fetching wheel details:', error);
    return null;
  }
}

// Update wheel visibility
export async function updateWheelVisibility(wheelId: string, isPublic: boolean): Promise<void> {
  try {
    const wheelRef = doc(db, 'nftWheels', wheelId);
    await updateDoc(wheelRef, { isPublic });
  } catch (error) {
    console.error('Error updating wheel visibility:', error);
    throw error;
  }
}

// Estimate gas for minting
export async function estimateMintingGas(wheelName: string, price: string = '0.1'): Promise<string> {
  try {
    // This is a placeholder - actual gas estimation would come from contract
    return '0.005'; // Approximate gas in ETH
  } catch (error) {
    console.error('Error estimating gas:', error);
    return '0.005';
  }
}
