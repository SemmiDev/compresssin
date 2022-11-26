const Download = ({ result }) => {
    return (
        <div className='p-5'>
            {result.map((item, index) => (
                <div
                    className='flex py-5 text-xs md:text-lg gap-x-2 justify-between items-center border-1 border-secondary/30 border p-5 rounded-lg m-3'
                    key={index}
                >
                    <div className='font-semibold text-accent flex items-center justify-between gap-x-2'>
                        <span className='text-xs md:text-sm'>
                            {item.prev_size} mb
                        </span>
                        ➜
                        <span className='text-xs md:text-sm'>
                            {item.new_size} mb
                        </span>
                    </div>
                    <a
                        className='btn btn-outline text-accent btn-primary btn-sm'
                        download={item.name}
                        href={item.img}
                    >
                        Download
                    </a>
                </div>
            ))}
        </div>
    );
};

export default Download;
