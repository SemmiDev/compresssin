const Intro = () => {
    return (
        <h1 className='text-lg text-center mb-12 md:text-xl lg:text-2xl font-bold text-secondary flex gap-x-2 items-center justify-center'>
            Blazingly
            <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='w-8 h-8 stroke-current text-accent'
            >
                <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z'
                />
            </svg>
            Fast Image Compression
        </h1>
    );
};

export default Intro;
