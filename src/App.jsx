import { useEffect, useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';

const Intro = () => {
    return (
        <h1 className='text-lg text-center mb-12 md:text-2xl lg:text-3xl font-bold text-secondary flex gap-x-2 items-center justify-center'>
            Blazingly
            <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='w-6 h-6'
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

const Download = ({ result }) => {
    return (
        <div className='p-5'>
            {result.map((item, index) => (
                <div
                    className='flex py-5 text-xs md:text-lg gap-x-2 justify-between items-center border-1 border-secondary/30 border p-5 rounded-lg m-3'
                    key={index}
                >
                    <div className='font-semibold text-accent flex items-center justify-between gap-x-2'>
                        <span>{item.prev_size} mb</span>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                            strokeWidth={1.5}
                            stroke='currentColor'
                            className='w-6 h-6'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                d='M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3'
                            />
                        </svg>
                        <span>{item.new_size} mb</span>
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

const RadialProgress = ({ percent }) => {
    return (
        <span
            className='radial-progress bg-primary text-primary-content border-3 border-primary'
            style={{ '--value': percent }}
        >
            {percent.toFixed(0)}%
        </span>
    );
};

const ImageForm = () => {
    const maxSizeRef = useRef(null);
    const maxWidthRef = useRef(null);
    const imageRef = useRef(null);
    const [result, setResult] = useState([]);
    const handleAddResult = (result) => {
        setResult((prev) => [...prev, result]);
    };
    const [status, setStatus] = useState('Idle');
    const [buttonText, setButtonText] = useState('Compress');
    const [totalTask, setTotalTask] = useState(0);
    const [sectionProgess, setSectionProgess] = useState(0);
    const [completedTaskCounter, setCompletedTaskCounter] = useState(0);
    const [completedBarProgess, setCompletedBarProgess] = useState(0);

    /*
        totalTasks = n
        sectionProgress = 100 / total_task = y
        completeRadialTask = 1 * y = z (Setiap task z%)
    */

    useEffect(() => {
        setCompletedBarProgess(completedTaskCounter * sectionProgess);
    }, [completedTaskCounter]);

    async function handleImageUpload(e) {
        e.preventDefault();
        setButtonText('Compressing...');

        let maxSize = maxSizeRef.current.value ? maxSizeRef.current.value : 1;
        maxSize = maxSize.toString().replace(',', '.');

        const options = {
            maxSizeMB: maxSize,
            maxWidthOrHeight: maxWidthRef.current.value
                ? maxWidthRef.current.value
                : 1920,
            useWebWorker: true,
        };

        const images = imageRef.current.files;
        setTotalTask(images.length);
        setSectionProgess(100 / images.length);

        for (let i = 0; i < images.length; i++) {
            const imageFile = images[i];

            const prevSize = imageFile.size / 1024 / 1024;
            const compressedFile = await imageCompression(imageFile, options);
            const newSize = compressedFile.size / 1024 / 1024;

            const extension = compressedFile.name.split('.').pop();
            const result = {
                total_file: totalTask,
                name: i + 1 + '.' + extension,
                prev_size: prevSize.toFixed(2), // MB
                new_size: newSize.toFixed(2), // MB
                img: URL.createObjectURL(compressedFile),
            };

            handleAddResult(result);
            setCompletedTaskCounter((prev) => prev + 1);
        }

        setButtonText('Done');
        setStatus('Done');
    }

    return (
        <div className='flex flex-col justify-center items-center gap-y-12'>
            <form
                onSubmit={handleImageUpload}
                method='post'
                encType='multipart/form-data'
                className='w-full flex justify-center  gap-5 items-center flex-col'
            >
                <div className='form-control w-full max-w-xs'>
                    <label className='label'>
                        <span className='label-text text-accent'>
                            Maximum Size (mb){' '}
                            <h3 className='italic text-accent'>
                                ex: 1 or 0.1 or 0.7, etc..
                            </h3>
                        </span>
                    </label>
                    <input
                        required={true}
                        autoFocus={true}
                        type='number'
                        ref={maxSizeRef}
                        placeholder='contoh: 1'
                        className='input input-bordered input-primary text-accent w-full max-w-xs'
                    />
                </div>
                <div className='form-control w-full max-w-xs'>
                    <label className='label'>
                        <span className='label-text text-accent'>
                            Maximum Width/Height (px)
                            <h3 className='italic text-accent'>
                                ex: 1280 or 1920 or 720, etc..
                            </h3>
                        </span>
                    </label>
                    <input
                        required={true}
                        type='number'
                        ref={maxWidthRef}
                        placeholder='contoh: 1920'
                        className='input input-bordered input-primary text-accent w-full max-w-xs'
                    />
                </div>
                <input
                    name='images'
                    type='file'
                    ref={imageRef}
                    required={true}
                    multiple={true}
                    accept='image/*'
                    className='file-input file-input-outline file-input-primary w-full max-w-xs'
                />

                {buttonText == 'Compress' && (
                    <button
                        type='submit'
                        className='btn btn-outline btn-primary'
                        onClick={handleImageUpload}
                    >
                        {buttonText}
                    </button>
                )}

                {buttonText == 'Compressing...' && (
                    <RadialProgress percent={completedBarProgess} />
                )}

                {buttonText === 'Done' && (
                    <a
                        className='btn btn-outline btn-primary'
                        onClick={() => {
                            setTotalTask(0);
                            setSectionProgess(0);
                            setCompletedTaskCounter(0);
                            setCompletedBarProgess(0);
                            setResult([]);
                            setButtonText('Compress');
                            imageRef.current.value = '';
                        }}
                    >
                        Reset
                    </a>
                )}
            </form>

            {status === 'Done' && <Download result={result} />}
        </div>
    );
};

const Layout = ({ children }) => {
    return (
        <div className='mockup-window border max-w-xl mx-auto mt-3 border-base-300'>
            <div className='flex flex-col justify-center px-4 py-16 border-base-300'>
                {children}
            </div>
        </div>
    );
};

export default function App() {
    return (
        <Layout>
            <Intro />
            <ImageForm />
        </Layout>
    );
}
