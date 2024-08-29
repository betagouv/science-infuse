import React from 'react'

const ImageStackWithText = (props: { aspect?: string, disableStack?: boolean, stairColor: string, mainImage: string, title?: React.ReactNode, subTitle?: React.ReactNode }) => {
    const placeholderWidth = props.disableStack?0:1.25;
    const imageConfig = {
        mainImage: { width: (12 - 2 * placeholderWidth) / 12 },
        secondImage: { width: placeholderWidth / 12, right: placeholderWidth / 12, height: 10 / 12 },
        thirdImage: { width: placeholderWidth / 12, right: 0, height: 8 / 12 },
    }

    return (
        <div className="block relative w-full" style={{aspectRatio: props.aspect || "4/3"}}>
            <div className='absolute h-full bg-center bg-cover' style={{ width: `calc(${imageConfig.mainImage.width * 100}%)`, backgroundImage: `url(${props.mainImage})` }} />
            {!props.disableStack && <div className='absolute bottom-0  bg-center bg-cover' style={{ width: `calc(${imageConfig.secondImage.width * 100}%)`, right: `calc(${imageConfig.secondImage.right * 100}%)`, height: `calc(${imageConfig.secondImage.height * 100}%)`, backgroundImage: `url(/images/home/frame-placeholder-1.png)` }} />}
            {!props.disableStack && <div className='absolute bottom-0  bg-center bg-cover' style={{ width: `calc(${imageConfig.thirdImage.width * 100}%)`, right: `${imageConfig.thirdImage.right * 100}%`, height: `calc(${imageConfig.thirdImage.height * 100}%)`, backgroundImage: `url(/images/home/frame-placeholder-2.png)` }} />}

            <div className="absolute bottom-0 left-0 flex flex-col w-full">
                {props.title ? <div style={{ background: props.stairColor }} className='w-fit px-4 py-1'>
                    <p className='m-0 text-base text-left text-[#1a1a1a]'>
                        {props.title}
                    </p>
                </div> : <div style={{ backgroundColor: props.stairColor }} className='w-1/4 h-8 px-4 py-1'></div>}

                {props.subTitle ? <div style={{ background: props.stairColor }} className='w-fit min-w-[75%] px-4 pt-2'>
                    {props.subTitle}
                </div> : <div style={{ background: props.stairColor }} className='w-1/2 h-8 px-4 py-1'></div>}
            </div>
        </div>
    )
}

export default ImageStackWithText