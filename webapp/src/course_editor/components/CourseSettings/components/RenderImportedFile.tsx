import { CircularProgress } from "@mui/material";

const RenderImportedFile = (props: { file: File, isUploading: boolean, onRemove: () => void }) => {
    const fileSizeInMB = (props.file.size / (1024 * 1024)).toFixed(2);

    return (
        <div className="flex flex-col sm:flex-row justify-center items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4 sm:gap-[97px] px-4 sm:px-6 py-4 rounded-lg bg-white border border-neutral-200">
            <div className="flex justify-start items-center flex-grow gap-4">
                <div className="flex justify-start items-start flex-grow-0 flex-shrink-0 relative p-1 rounded-sm bg-[#ececfe]">
                    <svg
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="flex-grow-0 flex-shrink-0 w-6 h-6 relative"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="M20 5H4V19L13.292 9.706C13.4795 9.51853 13.7338 9.41321 13.999 9.41321C14.2642 9.41321 14.5185 9.51853 14.706 9.706L20 15.01V5ZM2 3.993C2.00183 3.73038 2.1069 3.47902 2.29251 3.29322C2.47813 3.10742 2.72938 3.00209 2.992 3H21.008C21.556 3 22 3.445 22 3.993V20.007C21.9982 20.2696 21.8931 20.521 21.7075 20.7068C21.5219 20.8926 21.2706 20.9979 21.008 21H2.992C2.72881 20.9997 2.4765 20.895 2.29049 20.7088C2.10448 20.5226 2 20.2702 2 20.007V3.993ZM8 11C7.46957 11 6.96086 10.7893 6.58579 10.4142C6.21071 10.0391 6 9.53043 6 9C6 8.46957 6.21071 7.96086 6.58579 7.58579C6.96086 7.21071 7.46957 7 8 7C8.53043 7 9.03914 7.21071 9.41421 7.58579C9.78929 7.96086 10 8.46957 10 9C10 9.53043 9.78929 10.0391 9.41421 10.4142C9.03914 10.7893 8.53043 11 8 11Z"
                            fill="#000091"
                        />
                    </svg>
                </div>
                <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 relative">
                    <p className="flex-grow-0 flex-shrink-0 text-base font-medium text-center text-black m-0">
                        {props.file.name}
                    </p>
                    <p className="flex-grow-0 flex-shrink-0 text-base text-center text-[#000091] m-0">{fileSizeInMB}Mo</p>
                </div>
            </div>

            {props.isUploading ?
                <CircularProgress className="ml-2" size={24} />
                :
                <svg
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        props.onRemove()
                    }}
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="cursor-pointer flex-grow-0 flex-shrink-0 w-6 h-6 relative mt-4 sm:mt-0"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12.0007 10.586L16.9507 5.636L18.3647 7.05L13.4147 12L18.3647 16.95L16.9507 18.364L12.0007 13.414L7.05072 18.364L5.63672 16.95L10.5867 12L5.63672 7.05L7.05072 5.636L12.0007 10.586Z"
                        fill="#7B7B7B"
                    />
                </svg>}
        </div>
    )
}
export default RenderImportedFile;