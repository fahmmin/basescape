import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ImageIcon } from "lucide-react";

/** Base properties shared between all image card types */
type BaseImageCardProps = {
  blobId: string;
  endEpoch: number;
  imageUrl: string;
}

/** Properties for a newly created image card */
type NewlyCreatedImageCardProps = BaseImageCardProps & {
  status: 'newly created';
  suiObjectId: string;
}

/** Properties for an already certified image card */
type AlreadyCertifiedImageCardProps = BaseImageCardProps & {
  status: 'already certified';
  suiEventId: string;
}

/** Props type for the ImageCard component */
export type ImageCardProps = NewlyCreatedImageCardProps | AlreadyCertifiedImageCardProps;

export const ImageCard = (props: ImageCardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    console.log(`[ImageCard ${props.blobId}] Initial state:`, { isLoading, hasError });
  }, []);

  return (
    <div className="w-full max-w-[480px] h-auto bg-[#0C0F1D] rounded-2xl border border-2 border-[#97F0E533] flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-2 p-4 sm:p-2">
      <div className="w-full sm:w-[142px] h-[200px] sm:h-[142px] relative rounded-lg overflow-hidden flex-shrink-0">
        {hasError ? (
          <div className="w-full h-full bg-[#97F0E514] rounded-lg flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-[#97F0E5]" strokeWidth={1} />
          </div>
        ) : (
          <Image 
            src={props.imageUrl} 
            alt={`uploaded image: ${props.blobId}`} 
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 142px"
            placeholder="empty"
            onLoad={() => {
              console.log(`[ImageCard ${props.blobId}] Image loaded successfully`);
              setIsLoading(false);
            }}
            onError={(e) => {
              console.error(`[ImageCard ${props.blobId}] Image failed to load:`, e);
              setIsLoading(false);
              setHasError(true);
            }}
          />
        )}
      </div>
      <div className="w-full sm:w-auto sm:h-[142px] flex flex-col items-center justify-between gap-1 sm:gap-0">
        <div className="w-full sm:w-[314px] min-h-[34px] bg-[#97F0E514] flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg sm:rounded-t-lg sm:rounded-b-none px-3 sm:px-2 py-2 sm:py-0 gap-1 sm:gap-0">
          <span className="text-[#F7F7F7] text-sm font-medium sm:w-[157px] text-left">
            Status
          </span>
          <div className="sm:w-[157px] flex items-center">
            {
              props.status === 'newly created' ? (
                <span className="uppercase bg-[#B09F0729] rounded-sm text-[#B09F07] text-xs sm:text-sm font-medium text-left px-2 py-0.5 whitespace-nowrap">
                  {props.status}
                </span>
              ) : (
                <span className="uppercase bg-[#07B09A29] rounded-sm text-[#07B09A] text-xs sm:text-sm font-medium text-left px-2 py-0.5 whitespace-nowrap">
                  {props.status}
                </span>
              )
            }
          </div>
        </div>
        <div className="w-full sm:w-[314px] min-h-[34px] bg-[#97F0E514] flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg sm:rounded-none px-3 sm:px-2 py-2 sm:py-0 gap-1 sm:gap-0">
          <span className="text-[#F7F7F7] text-sm font-medium sm:w-[157px] text-left">
            Blob ID
          </span>
          <div className="w-full sm:w-[157px] overflow-hidden flex items-center">
            <Link href={props.imageUrl} target="_blank" rel="noopener noreferrer" className="text-[#C684F6] underline text-xs sm:text-sm font-medium block text-left text-ellipsis whitespace-nowrap overflow-hidden">
              {props.blobId}
            </Link>
          </div>
        </div>
        <div className="w-full sm:w-[314px] min-h-[34px] bg-[#97F0E514] flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg sm:rounded-none px-3 sm:px-2 py-2 sm:py-0 gap-1 sm:gap-0">
          <span className="text-[#F7F7F7] text-sm font-medium sm:w-[157px] text-left">
            {
              props.status === 'newly created' ? (
                'Associated Sui Object'
              ) : (
                'Associated Sui Event'
              )
            }
          </span>
          <div className="w-full sm:w-[157px] overflow-hidden flex items-center">
            { 
              props.status === 'newly created' ? (
                <Link href={`https://testnet.suivision.xyz/object/${props.suiObjectId}`} target="_blank" rel="noopener noreferrer" className="text-[#C684F6] underline text-xs sm:text-sm font-medium block text-left text-ellipsis whitespace-nowrap overflow-hidden">
                  {props.suiObjectId}
                </Link>
              ) : (
                <Link href={`https://testnet.suivision.xyz/txblock/${props.suiEventId}`} target="_blank" rel="noopener noreferrer" className="text-[#C684F6] underline text-xs sm:text-sm font-medium block text-left text-ellipsis whitespace-nowrap overflow-hidden">
                  {props.suiEventId}
                </Link>
              )
            }
          </div>
        </div>
        <div className="w-full sm:w-[314px] min-h-[34px] bg-[#97F0E514] flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg sm:rounded-b-md sm:rounded-t-none px-3 sm:px-2 py-2 sm:py-0 gap-1 sm:gap-0">
          <span className="text-[#F7F7F7] text-sm font-medium sm:w-[157px] text-left">
            End Epoch
          </span>
          <span className="text-[#97F0E5] text-xs sm:text-sm font-medium sm:w-[157px] text-left flex items-center">
            {props.endEpoch}
          </span>
        </div>
      </div>
    </div>
  )
};

