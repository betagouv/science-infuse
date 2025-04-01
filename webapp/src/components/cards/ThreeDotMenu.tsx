import { useMemo, useState } from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ChunkWithScoreUnion } from "@/types/vectordb";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import ReportContentModal from "./ReportContentModal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { useSession } from "next-auth/react";


const ThreeDotMenu = ({ className, chunk }: { className?: string, chunk: ChunkWithScoreUnion }) => {
    const user = useSession().data?.user;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);

    const reportModal = useMemo(() => createModal({
        id: "report-document-chunk-modal-"+chunk.id,
        isOpenedByDefault: false
    }), [])

    const isOpen = useIsModalOpen(reportModal)

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleReportClick = () => {
        console.log("chunkid", chunk.id);
        reportModal.open();
        handleMenuClose();
    };
    if (!user) return null;

    return (
        <>
            <div className={className}> {/* Apply className to the trigger's container */}
                <IconButton
                    aria-label="more"
                    id="long-button"
                    aria-controls={menuOpen ? 'long-menu' : undefined}
                    aria-expanded={menuOpen ? 'true' : undefined}
                    aria-haspopup="true"
                    onClick={handleMenuClick}
                >
                    <MoreVertIcon />
                </IconButton>
                <Menu
                    id="long-menu"
                    MenuListProps={{
                        'aria-labelledby': 'long-button',
                    }}
                    anchorEl={anchorEl}
                    open={menuOpen}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={handleReportClick}>
                        Signaler
                    </MenuItem>
                </Menu>
            </div>

            <ReportContentModal key={chunk.id} reportModal={reportModal} documentChunk={chunk} />
        </>
    );
}

export default ThreeDotMenu;