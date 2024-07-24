import Pagination from '@codegouvfr/react-dsfr/Pagination'
import { signal } from '@preact/signals-react'
import React from 'react'

interface SIPaginationProps {
    pageCount?: number
}

export const pageNumber = signal<number>(1)

const SIPagination: React.FC<SIPaginationProps> = ({ pageCount }) => {
    return (
        <Pagination
            className="[&_ul]:justify-around"
            count={pageCount || 1}
            defaultPage={pageNumber.value}
            getPageLinkProps={(newPageNumber: number) => ({
                onClick: () => {
                    pageNumber.value = newPageNumber
                },
                href: `#page-${pageNumber}`,
            })}
            showFirstLast
        />
    )
}

export default SIPagination
