import { useEffect, useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';

const Intro = () => {
    return (
        <h1 className='text-xl text-center mb-12 md:text-2xl lg:text-3xl font-bold text-secondary'>
            Blazingly Fast image compression and optimization tool 🗲
        </h1>
    );
};

const Download = ({ result }) => {
    return (
        <div className='p-5'>
            {result.map((item, index) => (
                <div
                    className='flex py-5 text-xs md:text-lg gap-x-2 justify-between items-center'
                    key={index}
                >
                    <h1 className='font-semibold'>Name: {item.name}</h1>
                    <h1 className='font-semibold'>
                        Prev Size: {item.prev_size} MB
                    </h1>
                    <h1 className='font-semibold'>
                        New Size: {item.new_size} MB
                    </h1>
                    <a
                        className='btn btn-outline btn-primary btn-sm'
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
            className='radial-progress bg-primary text-primary-content border-4 border-primary'
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
        const options = {
            maxSizeMB: maxSizeRef.current.value,
            maxWidthOrHeight: maxWidthRef.current.value,
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
                className='w-full flex justify-center gap-5 items-center flex-col'
            >
                <div className='form-control w-full max-w-xs'>
                    <label className='label'>
                        <span className='label-text'>
                            Max Size (MB){' '}
                            <h3 className='italic'>
                                ex: 1 or 0,1 or 0,7, etc..
                            </h3>
                        </span>
                    </label>
                    <input
                        required={true}
                        type='number'
                        ref={maxSizeRef}
                        placeholder='1'
                        className='input input-bordered w-full max-w-xs'
                    />
                </div>
                <div className='form-control w-full max-w-xs'>
                    <label className='label'>
                        <span className='label-text'>
                            Max Width/Height{' '}
                            <h3 className='italic'>
                                ex: 1280 or 1920 or 720, etc..
                            </h3>
                        </span>
                    </label>
                    <input
                        required={true}
                        type='number'
                        ref={maxWidthRef}
                        placeholder='1920'
                        className='input input-bordered w-full max-w-xs'
                    />
                </div>
                <input
                    name='images'
                    type='file'
                    ref={imageRef}
                    required={true}
                    multiple={true}
                    accept='image/*'
                    className='file-input  file-input-outline file-input-secondary w-full max-w-xs'
                />

                {buttonText == 'Compress' && (
                    <button
                        type='submit'
                        className='btn btn-outline btn-secondary'
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
                        className='btn btn-outline btn-secondary'
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
                        Compress More
                    </a>
                )}
            </form>

            {status === 'Done' && <Download result={result} />}
        </div>
    );
};

const Layout = ({ children }) => {
    return (
        <div className='flex flex-col  h-screen max-w-3xl mx-auto pt-12'>
            {children}
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
