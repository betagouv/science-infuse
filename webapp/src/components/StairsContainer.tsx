export default (props: { color: string, children: React.ReactNode }) => {
    return (
        <div className="w-full relative flex">
            {/* topLeft */}
            <div className="absolute -z-[1] -translate-y-full top-0 flex">
                <svg width="239" height="96" viewBox="0 0 239 94" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M239 96H0V48V0H60V48H239V96Z" fill={props.color} />
                </svg>
            </div>

            {/* botLeft */}
            <div className="absolute bottom-0 w-full flex">
                <svg width="480" height="240" viewBox="0 0 480 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M80 0H0V80V160V240H480V160H200V80H80V0Z" opacity={0.15} fill={'white'} />
                </svg>
            </div>

            {/* topRight */}
            <div className="absolute top-0 right-0 flex">
                <svg width="239" height="96" viewBox="0 0 239 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M0 0H239V48V96H119V48H0V0Z" opacity={0.15} fill="white" />
                </svg>
            </div>

            <div className="w-full" style={{ backgroundColor: props.color }}>
                <div className="w-full fr-grid-row fr-grid-row--gutters fr-grid-row--center">
                    <div className="fr-col-12 fr-col-md-8 main-content-item my-32">

                        {props.children}

                    </div>
                </div>
            </div>
        </div>
    )
}
